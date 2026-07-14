import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n';

export default function ChatWidget() {
  const { token, isLoggedIn, user } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const location = useLocation();

  // Hide on admin pages and login
  const hidden = location.pathname.startsWith('/admin') || location.pathname === '/login';

  // Poll the thread while the panel is open
  useEffect(() => {
    if (!open || !token) return undefined;
    let cancelled = false;
    const load = () =>
      api
        .getChat(token)
        .then((d) => !cancelled && setMessages(d.messages))
        .catch(() => {});
    load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [open, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  if (hidden) return null;

  async function handleSend(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      const d = await api.sendChat(token, t);
      setMessages((m) => [...m, d.message]);
      setText('');
    } catch {
      /* keep text so the user can retry */
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Yamuna Organic">
          <div className="chat-head">
            <div>
              <b>{t('chatTitle')}</b>
              <span>{t('chatReply')}</span>
            </div>
            <button aria-label="Close chat" onClick={() => setOpen(false)}>✕</button>
          </div>

          {!isLoggedIn ? (
            <div className="chat-login">
              <p>{t('chatLoginText')}</p>
              <Link to="/login" className="btn btn-gold btn-sm" onClick={() => setOpen(false)}>
                {t('chatLoginBtn')}
              </Link>
            </div>
          ) : (
            <>
              <div className="chat-body">
                {messages.length === 0 && <div className="chat-empty">{t('chatGreeting')}</div>}
                {messages.map((m) => (
                  <div key={m.id} className={`chat-msg ${m.from === 'user' ? 'mine' : 'theirs'}`}>
                    {m.text}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form className="chat-input" onSubmit={handleSend}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('chatPlaceholder')}
                  maxLength={2000}
                />
                <button type="submit" className="btn btn-gold btn-sm" disabled={!text.trim() || sending}>
                  {t('chatSend')}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        className="chat-fab"
        aria-label={open ? 'Close chat' : 'Chat with us'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
}
