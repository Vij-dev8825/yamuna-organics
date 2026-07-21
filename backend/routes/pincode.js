const express = require('express');

const router = express.Router();

// GET /api/pincode/:code — India Post pincode lookup, proxied server-side
// since api.postalpincode.in doesn't send CORS headers for browser calls.
router.get('/:code', async (req, res, next) => {
  try {
    const code = req.params.code;
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6-digit pincode.' });
    }

    const upstream = await fetch(`https://api.postalpincode.in/pincode/${code}`);
    const data = await upstream.json();
    const result = data?.[0];

    if (!result || result.Status !== 'Success' || !Array.isArray(result.PostOffice)) {
      return res.status(404).json({ success: false, message: 'No matching location found for this pincode.' });
    }

    const cities = [...new Set(result.PostOffice.map((p) => p.District))];
    const states = [...new Set(result.PostOffice.map((p) => p.State))];
    res.json({ success: true, cities, states });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
