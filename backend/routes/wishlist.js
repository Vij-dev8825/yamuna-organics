const express = require('express');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Wishlists are stored one document per user: { id: userId, items: [productId] }.

async function getIds(userId) {
  const doc = await db.get('wishlists', userId);
  return doc ? doc.items || [] : [];
}

// GET /api/wishlist
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({ success: true, productIds: await getIds(req.user.id) });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist  { productId }
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.body;
    const list = await getIds(req.user.id);
    if (!list.includes(productId)) list.push(productId);
    await db.put('wishlists', { id: req.user.id, items: list });
    res.json({ success: true, productIds: list });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    const list = (await getIds(req.user.id)).filter((id) => id !== req.params.productId);
    await db.put('wishlists', { id: req.user.id, items: list });
    res.json({ success: true, productIds: list });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
