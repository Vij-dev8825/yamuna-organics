import { useEffect, useState } from 'react';
import { api } from '../api';

const STORAGE_KEY = 'yo_liked_posts';

function getLikedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveLikedSet(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

/** Like button + count. No server-side per-visitor tracking — this browser's
 * localStorage is what stops a repeat click on the same device, so treat the
 * count as an engagement signal, not an audited metric. */
export default function BlogLike({ slug, likes: initialLikes }) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(getLikedSet().has(slug));
  }, [slug]);

  useEffect(() => {
    setLikes(initialLikes || 0);
  }, [initialLikes]);

  async function handleClick() {
    if (liked || busy) return;
    setBusy(true);
    try {
      const res = await api.likeBlogPost(slug);
      setLikes(res.likes);
      setLiked(true);
      const set = getLikedSet();
      set.add(slug);
      saveLikedSet(set);
    } catch {
      // Silently ignore — liking is a nice-to-have, not worth an error toast.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`blog-like-btn ${liked ? 'active' : ''}`}
      onClick={handleClick}
      disabled={liked || busy}
      aria-pressed={liked}
    >
      <span className="blog-like-icon" aria-hidden="true">{liked ? '♥' : '♡'}</span>
      {likes}
    </button>
  );
}
