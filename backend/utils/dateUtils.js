export function makeUTCStartTime(date, time) {
  const local = new Date(`${date}T${time}:00+05:30`);
  return new Date(local.toISOString());
}
