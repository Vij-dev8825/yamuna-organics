/**
 * SMS sender with pluggable providers:
 *  - MSG91 when MSG91_AUTH_KEY is set (flow/transactional API)
 *  - Twilio when TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM are set
 *  - otherwise logs to the console (dev mode) — OTPs and campaigns still work
 *    end-to-end locally.
 */
async function sendSms(phone, message) {
  if (!phone) return { sent: false, reason: 'no-phone' };

  if (process.env.MSG91_AUTH_KEY) {
    try {
      const res = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: process.env.MSG91_AUTH_KEY,
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          sender: process.env.SMS_SENDER_ID || 'YAMUNA',
          mobiles: `91${phone}`,
          message,
        }),
      });
      if (!res.ok) throw new Error(`MSG91 ${res.status}`);
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
