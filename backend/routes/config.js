const express = require('express');
const razorpay = require('../utils/razorpay');

const router = express.Router();

// GET /api/config — public, non-secret feature flags the frontend needs
router.get('/', (req, res) => {
  res.json({ success: true, razorpayEnabled: razorpay.isConfigured() });
});

module.exports = router;
