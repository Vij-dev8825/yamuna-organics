const express = require('express');

const router = express.Router();

const SUPPORTED = ['USD', 'GBP', 'CAD', 'AUD', 'SGD', 'MYR'];
const CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours — the upstream API only updates daily anyway

let cache = { rates: null, fetchedAt: 0 };

async function getRates() {
  if (cache.rates && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.rates;
  }
  const res = await fetch('https://open.er-api.com/v6/latest/INR');
  const data = await res.json();
  if (data.result !== 'success') throw new Error('Exchange rate provider returned an error.');

  const rates = { INR: 1 };
  for (const code of SUPPORTED) {
    if (data.rates[code]) rates[code] = data.rates[code];
  }
  cache = { rates, fetchedAt: Date.now() };
  return rates;
}

// GET /api/currency/rates — INR-based conversion rates for the storefront's
// currency selector. Display/reference only: checkout still charges in INR
// (see PageBanner/checkout copy) since payment-gateway multi-currency
// settlement hasn't been set up.
router.get('/rates', async (req, res, next) => {
  try {
    const rates = await getRates();
    res.json({ success: true, base: 'INR', rates });
  } catch (err) {
    // Serve a stale cache rather than failing the whole storefront if the
    // upstream provider is briefly down.
    if (cache.rates) {
      return res.json({ success: true, base: 'INR', rates: cache.rates, stale: true });
    }
    next(err);
  }
});

module.exports = router;
