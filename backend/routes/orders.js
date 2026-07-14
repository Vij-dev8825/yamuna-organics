const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');
const { notifyUser } = require('../utils/notify');

const router = express.Router();

// POST /api/orders  { items, address, paymentMethod }
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items, address, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }
    if (!address || !address.line1 || !address.pincode || !address.phone) {
      return res.status(400).json({ success: false, message: 'A complete delivery address is required.' });
    }

    const products = await db.list('products');
    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const sizeInfo = product?.sizes.find((s) => s.label === item.size);
      const price = sizeInfo ? sizeInfo.price : 0;
      total += price * item.quantity;
      return {
        productId: item.productId,
        name: product?.name,
        size: item.size,
        quantity: item.quantity,
        price,
      };
    });

    const order = {
      id: uuid(),
      orderNumber: `YO${Date.now().toString().slice(-8)}`,
      userId: req.user.id,
      items: orderItems,
      address,
      paymentMethod: paymentMethod || 'cod',
      total,
      status: 'placed',
      createdAt: new Date().toISOString(),
    };
    await db.put('orders', order);

    // Clear cart after order
    await db.put('carts', { id: req.user.id, items: [] });

    // Order confirmation to the customer (in-app + email when available)
    const user = await db.get('users', req.user.id);
    if (user) {
      await notifyUser(user, {
        title: `Order ${order.orderNumber} placed`,
        message: `We've received your order of ${orderItems.length} item(s) totalling ₹${total}. We'll notify you when it ships.`,
        meta: { orderId: order.id },
        channels: { inapp: true, email: true },
      });
    }

    res.status(201).json({ success: true, message: 'Order placed successfully.', order });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders (my orders)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const orders = (await db.list('orders')).filter((o) => o.userId === req.user.id);
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const order = await db.get('orders', req.params.id);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
