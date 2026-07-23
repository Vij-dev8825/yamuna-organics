const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/stock-notify  { productId, size, email? }
// Logged-in customers are matched by account (their stored email is used for
// the eventual alert); guests must supply an email address. Fulfilled and
// cleared out from admin.js when the size is restocked.
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { productId, size } = req.body;
    if (!productId || !size) {
      return res.status(400).json({ success: false, message: 'Product and size are required.' });
    }

    const product = await db.get('products', productId);
    const sizeInfo = product?.sizes.find((s) => s.label === size);
    if (!sizeInfo) return res.status(404).json({ success: false, message: 'That size was not found.' });
    if (sizeInfo.stock > 0) {
      return res.status(400).json({ success: false, message: 'That size is already in stock — no need to wait!' });
    }

    let userId = null;
    let email = (req.body.email || '').trim().toLowerCase();
    if (req.user) {
      const user = await db.get('users', req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
      userId = user.id;
      email = user.email || email;
    }
    if (!userId && !email) {
      return res.status(400).json({ success: false, message: 'Enter an email address to be notified.' });
    }
    if (!userId && !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }

    const existing = (await db.list('stock-notify')).find(
      (n) => n.productId === productId && n.size === size && (userId ? n.userId === userId : n.email === email)
    );
    if (existing) {
      return res.json({ success: true, message: "You're already on the list — we'll email you when it's back." });
    }

    await db.put('stock-notify', {
      id: uuid(),
      productId,
      size,
      userId,
      email: email || null,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: "Got it — we'll notify you when this is back in stock." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
