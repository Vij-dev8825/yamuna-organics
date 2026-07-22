import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isPushSupported, getPushPermission, enablePushNotifications } from '../utils/pushNotifications';

const DISMISSED_KEY = 'yo_push_optin_dismissed';
const SHOW_DELAY_MS = 4000;

/** Soft, dismissible ask for browser push permission — shown to any visitor
 * (logged in or not) so marketing alerts (sales, restocks) can reach people
 * who haven't made an account. Only shown once permission is still
 * "default" (never asked, never denied) and the visitor hasn't dismissed it
 * before; the real browser prompt only fires after they click Enable, never
 * on page load, so it's never a surprise. */
export default function PushOptIn() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return undefined;
    if (getPushPermission() !== 'default') return undefined;
    if (localStorage.getItem(DISMISSED_KEY)) return undefined;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  }

  async function enable() {
    setBusy(true);
    try {
      const ok = await enablePushNotifications(token);
      if (ok) {
        showToast("You're subscribed — we'll notify you about sales and new arrivals.");
      } else if (getPushPermission() === 'denied') {
        showToast('Notifications blocked — you can enable them later in your browser settings.', 'error');
      }
    } catch {
      showToast('Could not enable notifications right now.', 'error');
    } finally {
      localStorage.setItem(DISMISSED_KEY, '1');
      setBusy(false);
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="push-optin" role="dialog" aria-label="Enable notifications">
      <button className="push-optin-close" aria-label="Dismiss" onClick={dismiss}>×</button>
      <span className="push-optin-icon" aria-hidden="true">🔔</span>
      <p>Get notified about sales, new products &amp; restocks</p>
      <div className="push-optin-actions">
        <button type="button" className="btn btn-gold btn-sm" disabled={busy} onClick={enable}>
          {busy ? 'Enabling…' : 'Enable'}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
