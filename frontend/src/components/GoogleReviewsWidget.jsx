import { useEffect, useState } from 'react';
import { api } from '../api';

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="google-review-stars" aria-label={`${rating} star rating`}>
      {'★'.repeat(full)}
      <span className="muted">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

/** Aggregate rating + up to 5 review snippets pulled from the business's
 * Google listing (Places API, cached server-side). Renders nothing until
 * GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID are configured, and nothing on
 * fetch failure — this is a bonus trust section, never worth blocking or
 * erroring the homepage over. */
export default function GoogleReviewsWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getGoogleReviews().then(setData).catch(() => {});
  }, []);

  if (!data?.success || !data.configured || !data.reviews?.length) return null;

  return (
    <section className="section container google-reviews-section">
      <div className="google-reviews-head">
        <div>
          <span className="eyebrow">Verified feedback</span>
          <h2>What Google Reviewers Say</h2>
        </div>
        <div className="google-reviews-summary">
          <span className="google-reviews-rating">{data.rating.toFixed(1)}</span>
          <div>
            <Stars rating={data.rating} />
            <span className="muted google-reviews-count">{data.userRatingsTotal} Google reviews</span>
          </div>
        </div>
      </div>

      <div className="testimonial-grid">
        {data.reviews.map((r, i) => (
          <figure className="testimonial google-review-card" key={i}>
            <div className="google-review-head">
              {r.profilePhoto ? (
                <img src={r.profilePhoto} alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="google-review-avatar">{r.author?.[0] || '?'}</span>
              )}
              <div>
                <b>{r.author}</b>
                <Stars rating={r.rating} />
              </div>
            </div>
            <blockquote>{r.text}</blockquote>
            <figcaption>{r.relativeTime}</figcaption>
          </figure>
        ))}
      </div>

      {data.mapsUrl && (
        <a href={data.mapsUrl} target="_blank" rel="noreferrer" className="link-btn google-reviews-link">
          See all reviews on Google →
        </a>
      )}
    </section>
  );
}
