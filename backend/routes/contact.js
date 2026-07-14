const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// POST /api/contact  { name, email, phone, subject, message }
router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }

    const contact = {
      id: uuid(),
      name,
      email,
      phone: req.body.phone || '',
      subject: req.body.subject || 'General enquiry',
      message,
      createdAt: new Date().toISOString(),
    };
    await db.put('contacts', contact);

    await sendMail({
      to: process.env.CONTACT_NOTIFY_EMAIL,
      subject: `Contact form: ${contact.subject}`,
      text: `${name} <${email}> ${contact.phone}\n\n${message}`,
    });

    res.status(201).json({ success: true, message: "Thanks for reaching out — we'll get back to you soon." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
