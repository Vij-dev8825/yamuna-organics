const { v4: uuid } = require('uuid');
const db = require('../data/db');
const { sendMail } = require('./mailer');
const { sendSms } = require('./sms');

/**
 * Push a notification to one user over the selected channels.
 * channels: { inapp?: bool, email?: bool, sms?: bool }  (in-app is default on)
 */
async function notifyUser(user, { title, message, meta = {}, channels = { inapp: true } }) {
  const results = { inapp: false, email: false, sms: false };

  if (channels.inapp !== false) {
    await db.put('notifications', {
      id: uuid(),
      userId: user.id,
      title,
      message,
      meta,
      read: false,
      createdAt: new Date().toISOString(),
    });
    results.inapp = true;
  }
  if (channels.email && user.email) {
    const r = await sendMail({ to: user.email, subject: title, text: message });
    results.email = !!r.sent;
  }
  if (channels.sms && user.phone) {
    const r = await sendSms(user.phone, `${title} — ${message}`);
    results.sms = !!r.sent;
  }
  return results;
}

/**
 * Broadcast to every customer (admin excluded), log the campaign, and return
 * per-channel delivery counts.
 */
async function broadcast({ title, message, channels, meta = {} }) {
  const users = (await db.list('users')).filter((u) => u.role !== 'admin');
  const counts = { audience: users.length, inapp: 0, email: 0, sms: 0 };

  for (const user of users) {
    const r = await notifyUser(user, { title, message, meta, channels });
    if (r.inapp) counts.inapp += 1;
    if (r.email) counts.email += 1;
    if (r.sms) counts.sms += 1;
  }

  await db.put('notification-logs', {
    id: uuid(),
    title,
    message,
    channels,
    counts,
    createdAt: new Date().toISOString(),
  });
  return counts;
}

module.exports = { notifyUser, broadcast };
