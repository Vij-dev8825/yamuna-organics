const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { findValidCoupon, computeDiscount } = require('../utils/coupons');

const router = express.Router();

// POST /api/coupons/validate  { code, subtotal } — checkout preview only;
// the order-placement routes re-validate and recompute the discount
// server-side rather than trusting whatever this returned.
router.post('/validate', requireAuth, async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await findValidCoupon(code);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }
    if (Number(subtotal) < coupon.minOrder) {
      return res.status(400).json({ success: false, message: `This code needs a minimum order of ₹${coupon.minOrder}.` });
    }
    const discount = computeDiscount(coupon, Number(subtotal));
    res.json({ success: true, code: coupon.code, discount, type: coupon.type, value: coupon.value });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
