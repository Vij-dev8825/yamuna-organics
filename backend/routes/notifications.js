const express = require('express');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — my notifications, newest first
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const notifications = (await db.list('notifications'))
      .filter((n) => n.userId === req.user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50);
    const unread = notifications.filter((n) => !n.read).length;
    res.json({ success: true, unread, notifications });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, async (req, res, next) => {
  try {
    const mine = (await db.list('notifications')).filter(
      (n) => n.userId === req.user.id && !n.read
    );
    for (const n of mine) {
      n.read = true;
      await db.put('notifications', n);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const n = await db.get('notifications', req.params.id);
    if (!n || n.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    n.read = true;
    await db.put('notifications', n);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
