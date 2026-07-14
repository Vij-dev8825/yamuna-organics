/**
 * SMS sender with pluggable providers:
 *  - MSG91 when MSG91_AUTH_KEY is set — uses the Flow API, which sends a
 *    DLT-approved template (required by Indian telecom regulation for A2P
 *    SMS) with ONE variable substituted in — it cannot send arbitrary free
 *    text. Create a template on the MSG91 dashboard shaped like:
 *      "{{VAR1}} is your Yamuna Organics OTP. Valid 5 minutes."
 *    then set MSG91_TEMPLATE_ID to its id. The variable name defaults to
 *    VAR1 (override with MSG91_VAR_NAME if your template uses a different
 *    placeholder name).
 *  - Twilio when TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM are
 *    set — sends the full free-form message, no template needed.
 *  - otherwise logs to the console (dev mode) — OTPs and campaigns still
 *    work end-to-end locally.
 *
 * `varValue` is the single value substituted into the MSG91 template (e.g.
 * the OTP digits). Providers that send free text (Twilio, dev log) use the
 * full `message` instead and ignore `varValue`.
 */
async function sendSms(phone, message, varValue) {
  if (!phone) return { sent: false, reason: 'no-phone' };

  if (process.env.MSG91_AUTH_KEY) {
    try {
      const varName = process.env.MSG91_VAR_NAME || 'VAR1';
      const res = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: process.env.MSG91_AUTH_KEY,
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          short_url: '0',
          recipients: [
            {
              mobiles: `91${phone}`,
              [varName]: varValue ?? message,
            },
          ],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.type === 'error') throw new Error(data.message || `MSG91 ${res.status}`);
      return { sent: true, provider: 'msg91' };
    } catch (err) {
      console.error('[SMS:msg91:error]', err.message);
      return { sent: false, error: err.message };
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const body = new URLSearchParams({
        To: `+91${phone}`,
        From: process.env.TWILIO_FROM,
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
      console.error('[SMS:twilio:error]', err.message);
      return { sent: false, error: err.message };
    }
  }

  console.log(`[SMS:dev] to=${phone} | ${message}`);
  return { sent: true, dev: true };
}

module.exports = { sendSms };
