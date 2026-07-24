import { IconWhatsApp } from './Icons';

const SUPPORT_PHONE = '+918825875607';
const DEFAULT_MESSAGE = "Hi, I'd like to know more about your products.";

/** Site-wide floating WhatsApp enquiry button, fixed to the bottom-left —
 * mirrors ChatWidget's bottom-right chat-fab so the two sit symmetrically
 * without overlapping. The "Need Help?" label sits next to the icon on
 * larger screens and is hidden on mobile, where the width isn't there to
 * spare without overlapping page content. */
export default function WhatsAppButton() {
  const href = `https://wa.me/${SUPPORT_PHONE.replace('+', '')}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-widget"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="whatsapp-widget-label">Need Help? Chat with us</span>
      <span className="whatsapp-fab">
        <IconWhatsApp size={28} />
      </span>
    </a>
  );
}
