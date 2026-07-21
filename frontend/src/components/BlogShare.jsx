import { useToast } from '../context/ToastContext';
import { useLang } from '../i18n';

// Instagram has no public web share-intent for arbitrary links (unlike
// Facebook/Twitter/WhatsApp) — copying the link is the honest fallback,
// since it's what a customer would actually paste into a bio, DM, or story.
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function BlogShare({ url, title }) {
  const { showToast } = useToast();
  const { t } = useLang();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function handleInstagram() {
    const ok = await copyToClipboard(url);
    showToast(ok ? t('shareInstagramCopied') : t('shareCopyFailed'));
  }

  return (
    <div className="blog-share">
      <span className="blog-share-label">{t('shareLabel')}</span>
      <a
        className="blog-share-btn"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        Facebook
      </a>
      <a
        className="blog-share-btn"
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noreferrer"
      >
        X
      </a>
      <a
        className="blog-share-btn"
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
      <button type="button" className="blog-share-btn" onClick={handleInstagram}>
        Instagram
      </button>
    </div>
  );
}
