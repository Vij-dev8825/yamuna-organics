const express = require('express');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Carts are stored one document per user: { id: userId, items: [...],
// updatedAt, remindedAt }. remindedAt is cleared on every mutation so a
// fresh abandonment window starts each time the customer touches their
// cart again — see utils/abandonedCarts.js.

async function getItems(userId) {
  const doc = await db.get('carts', userId);
  return doc ? doc.items || [] : [];
}

async function saveItems(userId, items) {
  await db.put('carts', { id: userId, items, updatedAt: new Date().toISOString(), remindedAt: null });
  return items;
}

// GET /api/cart
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({ success: true, items: await getItems(req.user.id) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart  { items } - replace whole cart (used to sync guest cart on login)
router.put('/', requireAuth, async (req, res, next) => {
  try {
    const items = await saveItems(req.user.id, req.body.items || []);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/item  { productId, size, quantity }
router.post('/item', requireAuth, async (req, res, next) => {
  try {
    const { productId, size, quantity = 1 } = req.body;
    const items = await getItems(req.user.id);

    const existing = items.find((i) => i.productId === productId && i.size === size);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId, size, quantity });
    }

    await saveItems(req.user.id, items);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cart/item  { productId, size, quantity }
router.patch('/item', requireAuth, async (req, res, next) => {
  try {
    const { productId, size, quantity } = req.body;
    let items = await getItems(req.user.id);
    const existing = items.find((i) => i.productId === productId && i.size === size);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not in cart.' });
    }
    existing.quantity = quantity;
    items = items.filter((i) => i.quantity > 0);
    await saveItems(req.user.id, items);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/item  { productId, size }
router.delete('/item', requireAuth, async (req, res, next) => {
  try {
    const { productId, size } = req.body;
    const items = (await getItems(req.user.id)).filter(
      (i) => !(i.productId === productId && i.size === size)
    );
    await saveItems(req.user.id, items);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
