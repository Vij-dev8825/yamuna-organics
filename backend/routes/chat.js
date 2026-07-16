const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// Customer side of the support chat. The admin console polls the same
// collection through /api/admin/chat.

// GET /api/chat/unread — count of admin replies not yet opened (does not mark read)
router.get('/unread', requireAuth, async (req, res, next) => {
  try {
    const messages = (await db.list('chat-messages')).filter((m) => m.userId === req.user.id);
    const unread = messages.filter((m) => m.from === 'admin' && !m.readByUser).length;
    res.json({ success: true, unread });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat?since=<ISO> — my conversation (optionally only new messages)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let messages = (await db.list('chat-messages')).filter((m) => m.userId === req.user.id);
    if (req.query.since) {
      messages = messages.filter((m) => m.createdAt > req.query.since);
    }
    messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    // Everything the admin sent is now read by the customer.
    for (const m of messages) {
      if (m.from === 'admin' && !m.readByUser) {
        m.readByUser = true;
        await db.put('chat-messages', m);
      }
    }

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat  { text }
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message is too long.' });
    }

    const message = {
      id: uuid(),
      userId: req.user.id,
      from: 'user',
      text,
      readByAdmin: false,
      readByUser: true,
      createdAt: new Date().toISOString(),
    };
    await db.put('chat-messages', message);
    res.status(201).json({ success: true, message });

    // Alert the admin by email, since the in-app unread badge only helps
    // while the admin panel is actually open. Best-effort and detached from
    // the response above — a failure here must never surface as a second
    // response or an unhandled rejection.
    if (process.env.CONTACT_NOTIFY_EMAIL) {
      db.get('users', req.user.id)
        .then((customer) =>
          sendMail({
            to: process.env.CONTACT_NOTIFY_EMAIL,
            subject: `New chat message from ${customer?.name || customer?.phone || 'a customer'}`,
            text: `${customer?.name || 'Customer'} <${customer?.phone || ''}>\n\n${text}`,
          })
        )
        .catch(() => {});
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
