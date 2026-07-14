let loadPromise = null;

/** Loads Razorpay's checkout script once; safe to call repeatedly. */
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Could not load the payment gateway. Check your connection and try again.'));
    };
    document.body.appendChild(script);
  });
  return loadPromise;
}
