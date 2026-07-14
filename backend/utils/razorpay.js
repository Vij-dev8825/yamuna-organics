const crypto = require('crypto');

/**
 * Thin wrapper over Razorpay's REST API (no SDK dependency, same pattern as
 * the MSG91/Twilio helpers). Requires RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET.
 * Test-mode keys (from the Razorpay dashboard, no KYC needed) work exactly
 * the same as live keys for all of this — only real settlement requires
 * completed KYC on Razorpay's side.
 */

function isConfigured() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function authHeader() {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return `Basic ${token}`;
}

/** amountRupees: number (e.g. 770); returns the Razorpay order object. */
async function createOrder(amountRupees, receipt) {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: Math.round(amountRupees * 100), // paise
      currency: 'INR',
      receipt,
      payment_capture: 1,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.description || `Razorpay order creation failed (${res.status})`);
  return data;
}

/** Verifies the HMAC signature Razorpay's checkout returns after payment. */
function verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature || ''));
  } catch {
    return false; // length mismatch etc. — treat as invalid, not a crash
  }
}

module.exports = { isConfigured, createOrder, verifySignature };
