const db = require('../data/db');
const { buildOrderItems, createOrderRecord } = require('./orderBuilder');

const DISCOUNT_PERCENT = 10;
const ALLOWED_FREQUENCIES = [2, 4, 6];

function computeNextDate(fromIso, weeks) {
  const d = new Date(fromIso);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString();
}

/** Places a renewal order for every active subscription whose nextOrderDate
 * has passed, applying the standard subscription discount. Runs on a plain
 * setInterval from server.js (no worker process on Render's free plan) and
 * is also exposed via an admin-triggered endpoint as a manual fallback. */
async function processDueSubscriptions() {
  const subs = await db.list('subscriptions');
  const now = new Date();
  const results = [];

  for (const sub of subs) {
    if (sub.status !== 'active') continue;
    if (new Date(sub.nextOrderDate) > now) continue;

    try {
      const { orderItems, subtotal, shipping } = await buildOrderItems(
        [{ productId: sub.productId, size: sub.size, quantity: sub.quantity }],
        null
      );
      if (!orderItems[0]?.price) {
        results.push({ subscriptionId: sub.id, skipped: true, reason: 'Product or size no longer available' });
        continue;
      }

      const discount = Math.round(subtotal * (DISCOUNT_PERCENT / 100));
      const total = subtotal + shipping - discount;
      const order = await createOrderRecord({
        userId: sub.userId,
        orderItems,
        address: sub.address,
        total,
        discount,
        couponCode: `SUBSCRIBE${DISCOUNT_PERCENT}`,
        paymentMethod: 'cod',
        subscriptionId: sub.id,
      });

      sub.lastOrderId = order.id;
      sub.nextOrderDate = computeNextDate(sub.nextOrderDate, sub.frequencyWeeks);
      await db.put('subscriptions', sub);
      results.push({ subscriptionId: sub.id, orderId: order.id });
    } catch (err) {
      results.push({ subscriptionId: sub.id, error: err.message });
    }
  }

  return results;
}

module.exports = { DISCOUNT_PERCENT, ALLOWED_FREQUENCIES, computeNextDate, processDueSubscriptions };
