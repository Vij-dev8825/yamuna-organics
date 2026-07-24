const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { optionalAuth } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

function normalizeItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((it) => ({
      productCategory: it?.productCategory || '',
      quantity: Number(it?.quantity) || 0,
      unit: it?.unit || 'Litres',
    }))
    .filter((it) => it.productCategory && it.quantity >= 1);
}

// POST /api/bulk-enquiry
// { name, company, phone, email, city, country, gstin, items: [{productCategory, quantity, unit}],
//   sampleRequested, privateLabel, message }
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const items = normalizeItems(req.body.items);

    if (!name || !phone || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and at least one product with quantity are required.',
      });
    }

    const enquiry = {
      id: uuid(),
      enquiryNumber: `BE${Date.now().toString().slice(-8)}`,
      userId: req.user?.id || null,
      name,
      company: req.body.company || '',
      phone,
      email: req.body.email || '',
      city: req.body.city || '',
      country: req.body.country || '',
      gstin: req.body.gstin || '',
      items,
      sampleRequested: !!req.body.sampleRequested,
      privateLabel: !!req.body.privateLabel,
      message: req.body.message || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    await db.put('bulk-enquiries', enquiry);

    const itemLines = items.map((it) => `${it.quantity} ${it.unit} of ${it.productCategory}`).join('\n');

    // Notify the sales inbox (logs in dev mode). Doesn't block the response —
    // the enquiry is already saved even if mail delivery has an issue.
    sendMail({
      to: process.env.CONTACT_NOTIFY_EMAIL,
      subject: `Bulk enquiry ${enquiry.enquiryNumber}: ${items.length} product line(s)`,
      text:
        `${name} (${phone}${enquiry.email ? ', ' + enquiry.email : ''})${enquiry.company ? ` — ${enquiry.company}` : ''}\n` +
        `From: ${enquiry.country || enquiry.city || 'N/A'}\n\n` +
        `Items:\n${itemLines}\n` +
        `${enquiry.gstin ? `\nGST / Business ID: ${enquiry.gstin}` : ''}` +
        `${enquiry.sampleRequested ? '\nWants a sample shipped first.' : ''}` +
        `${enquiry.privateLabel ? '\nInterested in private-label / custom bottling.' : ''}` +
        `\n\n${enquiry.message}`,
    }).catch(() => {});

    // Confirmation to the enquirer themselves, with a reference number they
    // can quote — previously only the internal sales inbox was notified.
    if (enquiry.email) {
      sendMail({
        to: enquiry.email,
        subject: `We received your bulk enquiry (${enquiry.enquiryNumber})`,
        text:
          `Hi ${name},\n\n` +
          `Thanks for your bulk order enquiry with Western Gods Organics. Your reference number is ${enquiry.enquiryNumber}.\n\n` +
          `You requested:\n${itemLines}\n\n` +
          `Our bulk sales team will contact you within 24 working hours at ${phone}.\n\n` +
          `— Western Gods Organics`,
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: 'Thanks! Our bulk sales team will contact you within 24 hours.',
      enquiryId: enquiry.id,
      enquiryNumber: enquiry.enquiryNumber,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
