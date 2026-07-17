const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { notifyUser } = require('./notify');
const { findValidCoupon, computeDiscount } = require('./coupons');

function calculateShipping(subtotal) {
  return subtotal > 999 || subtotal === 0 ? 0 : 60;
}

async function buildOrderItems(items, couponCode) {
  const products = await db.list('products');
  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const sizeInfo = product?.sizes.find((s) => s.label === item.size);
    const price = sizeInfo ? sizeInfo.price : 0;
    subtotal += price * item.quantity;
    return {
      productId: item.productId,
      name: product?.name,
      size: item.size,
      quantity: item.quantity,
      price,
    };
  });
  const shipping = calculateShipping(subtotal);

  const coupon = await findValidCoupon(couponCode);
  const discount = computeDiscount(coupon, subtotal);

  return {
    orderItems,
    subtotal,
    shipping,
    discount,
    couponCode: discount > 0 ? coupon.code : null,
    total: subtotal + shipping - discount,
  };
}

async function createOrderRecord({ userId, orderItems, address, total, discount, couponCode, paymentMethod, payment, subscriptionId }) {
  const order = {
    id: uuid(),
    orderNumber: `YO${Date.now().toString().slice(-8)}`,
    userId,
    items: orderItems,
    address,
    paymentMethod,
    paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
    payment: payment || null,
    discount: discount || 0,
    couponCode: couponCode || null,
    subscriptionId: subscriptionId || null,
    total,
    status: 'placed',
    createdAt: new Date().toISOString(),
  };
  await db.put('orders', order);
  if (!subscriptionId) {
    // Subscription-generated orders don't touch the customer's live cart.
    await db.put('carts', { id: userId, items: [] });
  }

  const user = await db.get('users', userId);
  if (user) {
    await notifyUser(user, {
      title: `Order ${order.orderNumber} placed`,
      message: subscriptionId
        ? `Your subscription renewed: ${orderItems.length} item(s) totalling ₹${total}. We'll notify you when it ships.`
        : `We've received your order of ${orderItems.length} item(s) totalling ₹${total}. We'll notify you when it ships.`,
      meta: { orderId: order.id },
      channels: { inapp: true, email: true },
    });
  }
  return order;
}

module.exports = { calculateShipping, buildOrderItems, createOrderRecord };
