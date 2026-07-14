const express = require('express');
const db = require('../data/db');

const router = express.Router();

// GET /api/banners — active home-page banners (videos/images), in display order
router.get('/', async (req, res, next) => {
  try {
    const banners = (await db.list('banners'))
      .filter((b) => b.active)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    res.json({ success: true, banners });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
