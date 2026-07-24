const express = require('express');
const db = require('../data/db');

const router = express.Router();

// GET /api/homepage-reviews — public. A manually-curated (not live-fetched)
// showcase of real reviews copied from the business's Google listing, since
// wiring up the Places API would require Google Cloud billing the admin
// chose to skip. Hidden until the admin has entered at least one review.
router.get('/', async (req, res, next) => {
  try {
    const settings = await db.get('homepage-reviews', 'main');
    const reviews = settings?.reviews || [];
    res.json({
      success: true,
      configured: reviews.length > 0,
      rating: settings?.rating || 0,
      reviewCount: settings?.reviewCount || 0,
      mapsUrl: settings?.mapsUrl || null,
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
