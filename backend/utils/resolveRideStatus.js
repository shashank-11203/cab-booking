export function resolveRideStatus(ride) {
  const now = new Date();

  if (ride.rideStatus === "cancelled") return "cancelled";
  if (ride.rideStatus === "completed") return "completed";

  let start;

  if (ride.startTime) {
    start = new Date(ride.startTime);
  } else if (ride.date && ride.time) {
    start = new Date(`${ride.date}T${ride.time}`);
  } else {
    return ride.rideStatus;
  }

  if (start <= now) return "active";

  return "upcoming";
}