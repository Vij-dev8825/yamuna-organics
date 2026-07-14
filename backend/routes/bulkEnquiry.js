const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { optionalAuth } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// POST /api/bulk-enquiry
// { name, company, phone, email, city, productCategory, quantity, unit, message }
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { name, phone, productCategory, quantity } = req.body;

    if (!name || !phone || !productCategory || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, product category and quantity are required.',
      });
    }

    const enquiry = {
      id: uuid(),
      userId: req.user?.id || null,
      name,
      company: req.body.company || '',
      phone,
      email: req.body.email || '',
      city: req.body.city || '',
      productCategory,
      quantity,
      unit: req.body.unit || 'Litres',
      message: req.body.message || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    await db.put('bulk-enquiries', enquiry);

    // Notify the sales inbox (logs in dev mode).
    await sendMail({
      to: process.env.CONTACT_NOTIFY_EMAIL,
      subject: `Bulk enquiry: ${quantity} ${enquiry.unit} of ${productCategory}`,
      text: `${name} (${phone}${enquiry.email ? ', ' + enquiry.email : ''}) from ${enquiry.city || 'N/A'}\n\n${enquiry.message}`,
    });

    res.status(201).json({
      success: true,
      message: 'Thanks! Our bulk sales team will contact you within 24 hours.',
      enquiryId: enquiry.id,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
