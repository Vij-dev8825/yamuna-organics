import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';

/** "Shop with AI" — a stateless AI assistant (Google Gemini, free tier) that
 * can recommend products and answer store-policy questions instantly with
 * no login, separate from ChatWidget's login-gated human support thread.
 * Conversation history lives only in this component's state — nothing is
 * persisted server-side. */
export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { from: 'user' | 'bot', text }
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const location = useLocation();

  const hidden = location.pathname.startsWith('/admin') || location.pathname === '/login';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open, sending]);

  if (hidden) return null;

  async function handleSend(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    const priorMessages = messages;
    setMessages((m) => [...m, { from: 'user', text: t }]);
    setText('');
    setSending(true);
    try {
      const d = await api.askAiAssistant(t, priorMessages);
      setMessages((m) => [...m, { from: 'bot', text: d.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { from: 'bot', text: err.message || 'Something went wrong — please try again.' }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="chat-panel ai-assistant-panel" role="dialog" aria-label="Shop with AI">
          <div className="chat-head">
            <div>
              <b>✨ Shop with AI</b>
              <span>Ask about products, shipping, or policies</span>
            </div>
            <button aria-label="Close AI assistant" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-body">
            {messages.length === 0 && (
              <div className="chat-empty">
                Hi! Ask me things like "what's good for dry skin" or "do you ship to the US?"
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from === 'user' ? 'mine' : 'theirs'}`}>
                {m.text}
              </div>
            ))}
            {sending && <div className="chat-msg theirs">…</div>}
            <div ref={bottomRef} />
          </div>
          <form className="chat-input" onSubmit={handleSend}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask the AI assistant…"
              maxLength={500}
            />
            <button type="submit" className="btn btn-gold btn-sm" disabled={!text.trim() || sending}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        className="ai-assistant-fab"
        aria-label={open ? 'Close AI assistant' : 'Shop with AI'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '✕' : '✨'}
      </button>
    </>
  );
}
