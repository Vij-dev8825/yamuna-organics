const db = require('../data/db');
const { notifyUser } = require('./notify');

const ABANDONED_AFTER_MS = (parseInt(process.env.ABANDONED_CART_HOURS, 10) || 3) * 60 * 60 * 1000;

/** Reminds a customer once per cart "session" — cart.js clears remindedAt on
 * every add/update/remove, so a fresh abandonment window starts each time
 * the customer touches their cart again, rather than nagging repeatedly
 * about the same items. Runs on a plain setInterval from server.js (no
 * worker process on Render's free plan), same pattern as subscriptions. */
async function processAbandonedCarts() {
  const carts = await db.list('carts');
  const now = Date.now();
  const results = [];

  for (const cart of carts) {
    if (!cart.items?.length) continue;
    if (cart.remindedAt) continue;
    if (!cart.updatedAt || now - new Date(cart.updatedAt).getTime() < ABANDONED_AFTER_MS) continue;

    try {
      const user = await db.get('users', cart.id);
      if (!user) continue;

      const itemCount = cart.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
      await notifyUser(user, {
        title: 'You left something in your cart',
        message: `${itemCount} item${itemCount === 1 ? '' : 's'} still waiting in your cart — complete your order before it sells out!`,
        meta: { cart: true },
        channels: { inapp: true, email: true },
      });

      cart.remindedAt = new Date().toISOString();
      await db.put('carts', cart);
      results.push({ userId: cart.id, reminded: true });
    } catch (err) {
      results.push({ userId: cart.id, error: err.message });
    }
  }

  return results;
}

module.exports = { processAbandonedCarts };
