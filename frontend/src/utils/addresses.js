// Addresses saved before multi-address support existed have no id/isDefault
// — this backfills both (id per entry, the first entry marked default if
// none is) so the address book and checkout picker have something stable
// to key/select on. Returns the array unchanged (same reference) when
// nothing needed backfilling, so callers can skip an unnecessary PUT.
export function normalizeAddresses(addresses) {
  if (!addresses?.length) return addresses || [];
  const hasDefault = addresses.some((a) => a.isDefault);
  let changed = false;
  const normalized = addresses.map((a, i) => {
    let next = a;
    if (!next.id) {
      next = { ...next, id: crypto.randomUUID() };
      changed = true;
    }
    if (!hasDefault && i === 0 && !next.isDefault) {
      next = { ...next, isDefault: true };
      changed = true;
    }
    return next;
  });
  return changed ? normalized : addresses;
}
