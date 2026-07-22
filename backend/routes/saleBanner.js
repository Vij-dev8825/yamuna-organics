const express = require('express');
const db = require('../data/db');

const router = express.Router();

// GET /api/sale-banner — public, only returns the banner when an admin has
// switched it on and the end date hasn't passed yet.
router.get('/', async (req, res, next) => {
  try {
    const settings = await db.get('sale-banner', 'main');
    if (!settings || !settings.active || !settings.endDate || new Date(settings.endDate) <= new Date()) {
      return res.json({ success: true, active: false });
    }
    res.json({
      success: true,
      active: true,
      title: settings.title || '',
      subtitle: settings.subtitle || '',
      endDate: settings.endDate,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
