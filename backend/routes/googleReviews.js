const express = require('express');

const router = express.Router();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;
const CACHE_MS = 12 * 60 * 60 * 1000; // reviews barely change; avoid paying for repeat Places API calls

let cache = { data: null, fetchedAt: 0 };

function isConfigured() {
  return !!(API_KEY && PLACE_ID);
}

async function fetchPlaceDetails() {
  if (cache.data && Date.now() - cache.fetchedAt < CACHE_MS) return cache.data;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(PLACE_ID)}&fields=rating,user_ratings_total,reviews,url&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK') {
    throw new Error(data.error_message || `Google Places API returned status ${data.status}`);
  }

  const result = {
    rating: data.result.rating || 0,
    userRatingsTotal: data.result.user_ratings_total || 0,
    mapsUrl: data.result.url || null,
    // Google's Place Details API only ever returns up to 5 reviews, regardless
    // of the business's total review count.
    reviews: (data.result.reviews || []).map((r) => ({
      author: r.author_name,
      profilePhoto: r.profile_photo_url || null,
      rating: r.rating,
      text: r.text,
      relativeTime: r.relative_time_description,
      time: r.time,
    })),
  };
  cache = { data: result, fetchedAt: Date.now() };
  return result;
}

// GET /api/google-reviews — display-only aggregate rating + up to 5 review
// snippets from the business's Google listing. No-ops (configured: false)
// until GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID are both set.
router.get('/', async (req, res, next) => {
  try {
    if (!isConfigured()) return res.json({ success: true, configured: false });
    const data = await fetchPlaceDetails();
    res.json({ success: true, configured: true, ...data });
  } catch (err) {
    if (cache.data) return res.json({ success: true, configured: true, ...cache.data, stale: true });
    console.error('[google-reviews]', err.message);
    res.json({ success: false, configured: true });
  }
});

module.exports = router;
