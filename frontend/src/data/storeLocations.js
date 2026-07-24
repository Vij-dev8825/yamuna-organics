// Single source of truth for physical location(s) — shared by Footer's map
// accordion and the /store-locator page. Add more entries here as/when
// additional retail outlets open; both consumers already render a list.
export const STORE_LOCATIONS = [
  {
    id: 'udumalpet-mill',
    name: 'Shri Gopal Flour & Oil Mills',
    address: 'Shri Gopal Flour & Oil Mills, Udumalpet, Tiruppur District, Tamil Nadu – 642126',
    phone: '+918825875607',
    phoneDisplay: '+91 88258 75607',
    hours: 'Mon–Sat, 9am–7pm',
  },
];

export function mapEmbedSrc(address) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=14&output=embed`;
}

export function directionsUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
