export const simplifyLocation = (place) => {
  if (!place) return "";

  const name = place.name?.split(",")[0].trim();
  const state =
    place.state ||
    place.address?.state ||
    place.city ||
    place.town ||
    "";

  if (name && state) return `${name}, ${state}`;
  return name;
};
