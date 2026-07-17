/**
 * Optional Cloudinary storage for admin uploads (product/category images,
 * home banners). When configured, uploaded files are pushed to Cloudinary
 * and served from there — surviving Render's ephemeral disk across
 * redeploys. When unset (e.g. local dev), callers fall back to the local
 * uploads/ folder, so no Cloudinary account is required to run locally.
 */
const cloudinary = require('cloudinary').v2;

let configured = false;

function isConfigured() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
}

/** Uploads a local file path to Cloudinary and returns { url, publicId, resourceType }. */
async function uploadFile(localPath, { resourceType = 'image', folder = 'yamuna-organics' } = {}) {
  ensureConfigured();
  const result = await cloudinary.uploader.upload(localPath, { resource_type: resourceType, folder });
  return { url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type };
}

async function destroyFile(publicId, resourceType = 'image') {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { isConfigured, uploadFile, destroyFile };
