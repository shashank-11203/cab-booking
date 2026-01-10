import axios from "axios";

export const calculateDistance = async (req, res) => {
  try {
    const { pickupLat, pickupLon, dropLat, dropLon } = req.query;

    if (!pickupLat || !pickupLon || !dropLat || !dropLon) {
      return res.json({ success: false, message: "Missing coordinates" });
    }

    const url = `https://graphhopper.com/api/1/route?
point=${Number(pickupLat)},${Number(pickupLon)}
&point=${Number(dropLat)},${Number(dropLon)}
&vehicle=car
&locale=en
&weighting=fastest
&ch.disable=false
&type=json
&key=${process.env.GRAPH_HOPPER_KEY}`
      .replace(/\s+/g, '');

    const { data } = await axios.get(url);

    if (!data.paths || data.paths.length === 0) {
      return res.json({ success: false, message: "No route found" });
    }

    const route = data.paths[0];

    const distanceKm = (route.distance / 1000).toFixed(2);
    const durationMinutes = Math.round(route.time / 60000);

    return res.json({
      success: true,
      distanceKm,
      durationMinutes,
    });
  } catch (err) {
    console.error("Distance Error:", err.message);
    return res.json({ success: false, message: "Could not fetch route" });
  }
};
