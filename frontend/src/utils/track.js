export function openGoogleMaps(pickupName, dropName) {
  if (!pickupName || !dropName) return;

  const origin = encodeURIComponent(pickupName);
  const destination = encodeURIComponent(dropName);

  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

  window.open(url, "_blank");
}