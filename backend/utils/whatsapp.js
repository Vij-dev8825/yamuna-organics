/**
 * WhatsApp order-update messages via Twilio's WhatsApp channel — this reuses
 * the same Programmable Messaging API and TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN
 * already configured for SMS (see sms.js), just addressed through a
 * WhatsApp-enabled sender instead of a plain SMS number.
 *
 * TWILIO_WHATSAPP_FROM must be a WhatsApp-approved sender in the form
 * "whatsapp:+14155238886" — this is a separate Twilio Console step from the
 * existing SMS setup (Twilio Sandbox for testing, or a verified WhatsApp
 * Business sender for production) and is NOT the same number as TWILIO_FROM.
 *
 * Meta only allows free-form business-initiated WhatsApp text within a
 * 24-hour window after the customer last messaged you; outside that window
 * (true for almost all order-status updates) a Meta-approved message
 * template is required instead of plain text. This sends plain text, which
 * works today in the Twilio Sandbox for testing — production sending to real
 * customers needs an approved Utility-category template via the Twilio
 * Console/Meta Business Manager first.
 */
async function sendWhatsApp(phone, message) {
  if (!phone) return { sent: false, reason: 'no-phone' };

  if (!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM)) {
    console.log(`[WHATSAPP:dev] to=${phone} | ${message}`);
    return { sent: true, dev: true };
  }

  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const toNumber = phone.startsWith('+') ? phone : `+91${phone}`;
    const body = new URLSearchParams({
      To: `whatsapp:${toNumber}`,
      From: process.env.TWILIO_WHATSAPP_FROM,
      Body: message,
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!res.ok) throw new Error(`Twilio ${res.status}`);
    return { sent: true, provider: 'twilio' };
  } catch (err) {
    console.error('[WHATSAPP:twilio:error]', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendWhatsApp };
