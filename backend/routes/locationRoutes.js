// import express from "express";
// import axios from "axios";
// import { KUTCH_PLACES } from "../data/kutchPlaces.js";

// const router = express.Router();

// const AIRPORTS = {
//   "bhuj airport": {
//     name: "Bhuj Airport (Rudra Mata Airport)",
//     lat: "23.2878",
//     lon: "69.6702",
//     city: "Bhuj",
//     district: "Kutch",
//     state: "Gujarat",
//     type: "airport",
//   },
//   "ahmedabad airport": {
//     name: "Sardar Vallabhbhai Patel International Airport, Ahmedabad",
//     lat: "23.0726",
//     lon: "72.6317",
//     city: "Ahmedabad",
//     district: "Ahmedabad",
//     state: "Gujarat",
//     type: "airport",
//   },
//   "surat airport": {
//     name: "Surat International Airport",
//     lat: "21.1140",
//     lon: "72.7419",
//     city: "Surat",
//     district: "Surat",
//     state: "Gujarat",
//     type: "airport",
//   },
//   "vadodara airport": {
//     name: "Vadodara Airport (Civil Airport Harni)",
//     lat: "22.3362",
//     lon: "73.2263",
//     city: "Vadodara",
//     district: "Vadodara",
//     state: "Gujarat",
//     type: "airport",
//   },
//   "rajkot airport": {
//     name: "Rajkot Airport",
//     lat: "22.3092",
//     lon: "70.7795",
//     city: "Rajkot",
//     district: "Rajkot",
//     state: "Gujarat",
//     type: "airport",
//   },
//   "kandla airport": {
//     name: "Kandla Airport (Gandhidham Airport)",
//     lat: "23.1127",
//     lon: "70.1003",
//     city: "Gandhidham",
//     district: "Kutch",
//     state: "Gujarat",
//     type: "airport",
//   },
//   "mundra airport": {
//     name: "Mundra Airport",
//     lat: "22.8323",
//     lon: "69.7463",
//     city: "Mundra",
//     district: "Kutch",
//     state: "Gujarat",
//     type: "airport",
//   },
// };

// /* ----------------------------------------------
//    HELPERS
// ---------------------------------------------- */

// // Find airport fallback (only airports allowed)
// function findAirportFallback(query) {
//   const q = query.toLowerCase().trim();

//   if (AIRPORTS[q]) return AIRPORTS[q];

//   // Partial matches e.g. "mundra" → mundra airport
//   for (const key of Object.keys(AIRPORTS)) {
//     if (key.includes(q) || q.includes(key.split(" ")[0])) {
//       return AIRPORTS[key];
//     }
//   }

//   return null;
// }

// // Check if results contain a relevant match
// function hasRelevantMatch(query, results) {
//   const q = query.toLowerCase().trim();
//   return results.some((p) => p.name.toLowerCase().split(",")[0] === q);
// }

// /* ----------------------------------------------
//    SEARCH API
// ---------------------------------------------- */
// router.get("/search", async (req, res) => {
//   try {
//     const q = req.query.q?.trim();
//     const rideType = req.query.rideType;

//     if (!q) return res.json({ success: true, places: [], match: false });

//     const isAirportRide = rideType === "airport";

//     // Check airport fallback first
//     const airportFallback = isAirportRide ? findAirportFallback(q) : null;

//     /* --------------------------------------------
//        SPECIAL: LOCAL MODE → Return static places
//     -------------------------------------------- */
//     if (rideType === "local") {
//       const qLower = q.toLowerCase();

//       const localMatches = KUTCH_PLACES.filter((place) =>
//         place.name.toLowerCase().includes(qLower)
//       );

//       return res.json({
//         success: true,
//         places: localMatches,
//         match: localMatches.length > 0,
//       });
//     }

//     /* --------------------------------------------
//        FETCH FROM NOMINATIM WITH RETRY
//     -------------------------------------------- */
//     let results = [];

//     try {
//       const { data } = await axios.get(
//         "https://graphhopper.com/api/1/geocode",
//         {
//           params: {
//             q: q,
//             locale: "en",
//             limit: 10,
//             key: process.env.GRAPH_HOPPER_KEY,
//           },
//         }
//       );

//       // Convert results
//       results = data.hits.map((p) => ({
//         name: [
//           p.name,
//           p.city,
//           p.state,
//           p.country,
//         ]
//           .filter(Boolean)
//           .join(", "),
//         lat: p.point.lat,
//         lon: p.point.lng,
//         city: p.city,
//         district: p.state,
//         state: p.state,
//       }));

//       // FILTER: Only Gujarat results allowed
//       // results = results.filter((p) => {
//       //   const st = (p.state || "").toLowerCase();
//       //   return st === "gujarat";
//       // });

//       /* --------------------------------------------
//          BLOCK AIRPORTS (except airport ride)
//       -------------------------------------------- */
//       if (!isAirportRide) {
//         results = results.filter(
//           (p) =>
//             !p.name.toLowerCase().includes("airport") &&
//             !p.name.toLowerCase().includes("terminal")
//         );
//       }

//     } catch (ghError) {
//       console.error("GraphHopper error:", ghError.code || ghError.message);

//       // If GraphHopper fails, check if we have airport fallback
//       if (airportFallback) {
//         return res.json({
//           success: true,
//           places: [{
//             name: airportFallback.name,
//             lat: airportFallback.lat,
//             lon: airportFallback.lon,
//             city: airportFallback.city,
//             district: airportFallback.district,
//             state: airportFallback.state,
//             isFallback: true,
//           }],
//           match: true,
//           warning: "Using offline airport database"
//         });
//       }

//       // Return empty results with error message
//       return res.json({
//         success: true,
//         places: [],
//         match: false,
//         error: "Location service temporarily unavailable. Please try again."
//       });
//     }

//     /* --------------------------------------------
//        INJECT AIRPORT FALLBACK if needed
//     -------------------------------------------- */
//     if (airportFallback && !hasRelevantMatch(q, results)) {
//       results.unshift({
//         name: airportFallback.name,
//         lat: airportFallback.lat,
//         lon: airportFallback.lon,
//         city: airportFallback.city,
//         district: airportFallback.district,
//         state: airportFallback.state,
//         isFallback: true,
//       });
//     }

//     return res.json({
//       success: true,
//       places: results,
//       match: hasRelevantMatch(q, results),
//     });

//   } catch (err) {
//     console.error("Search error:", err);
//     return res.json({
//       success: true,
//       places: [],
//       match: false,
//       error: "An error occurred while searching"
//     });
//   }
// });

// /* ----------------------------------------------
//    VALIDATE API
// ---------------------------------------------- */
// router.post("/validate", async (req, res) => {
//   try {
//     const text = req.body.text?.trim();
//     if (!text) return res.json({ success: false, message: "Text required" });

//     // Check airport fallback first
//     const fallback = findAirportFallback(text);
//     if (fallback) {
//       return res.json({
//         success: true,
//         lat: fallback.lat,
//         lon: fallback.lon,
//         formattedName: fallback.name,
//         address: {
//           city: fallback.city,
//           district: fallback.district,
//           state: fallback.state,
//         },
//       });
//     }

//     // Try Nominatim with retry
//     try {
//       const response = await axios.get(
//         "https://graphhopper.com/api/1/geocode",
//         {
//           params: {
//             q: text,
//             limit: 1,
//             locale: "en",
//             key: process.env.GRAPH_HOPPER_KEY,
//           },
//         }
//       );

//       if (!response.data.length) {
//         return res.json({ success: false, message: "Location not found" });
//       }

//       const d = response.data[0];

//       return res.json({
//         success: true,
//         lat: d.point.lat,
//         lon: d.point.lng,
//         formattedName: [
//           d.name,
//           d.city,
//           d.state,
//           d.country,
//         ].filter(Boolean).join(", "),
//         address: {
//           city: d.city,
//           district: d.state,
//           state: d.state,
//         },
//       });

//     } catch (ghError) {
//       console.error("Validation error:", ghError.code || ghError.message);
//       return res.json({
//         success: false,
//         message: "Location service temporarily unavailable"
//       });
//     }

//   } catch (err) {
//     console.error("Validate error:", err);
//     return res.json({ success: false, message: "Validation error" });
//   }
// });

// export default router;


import express from "express";
import axios from "axios";
import { KUTCH_PLACES } from "../data/kutchPlaces.js";

const router = express.Router();

const AIRPORTS = {
  "bhuj airport": {
    name: "Bhuj Airport (Rudra Mata Airport)",
    lat: "23.2878",
    lon: "69.6702",
    city: "Bhuj",
    district: "Kutch",
    state: "Gujarat",
    country: "India",
    type: "airport",
  },
  "ahmedabad airport": {
    name: "Sardar Vallabhbhai Patel International Airport, Ahmedabad",
    lat: "23.0726",
    lon: "72.6317",
    city: "Ahmedabad",
    district: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    type: "airport",
  },
  "surat airport": {
    name: "Surat International Airport",
    lat: "21.1140",
    lon: "72.7419",
    city: "Surat",
    district: "Surat",
    state: "Gujarat",
    country: "India",
    type: "airport",
  },
  "vadodara airport": {
    name: "Vadodara Airport (Civil Airport Harni)",
    lat: "22.3362",
    lon: "73.2263",
    city: "Vadodara",
    district: "Vadodara",
    state: "Gujarat",
    country: "India",
    type: "airport",
  },
  "rajkot airport": {
    name: "Rajkot Airport",
    lat: "22.3092",
    lon: "70.7795",
    city: "Rajkot",
    district: "Rajkot",
    state: "Gujarat",
    country: "India",
    type: "airport",
  },
  "kandla airport": {
    name: "Kandla Airport (Gandhidham Airport)",
    lat: "23.1127",
    lon: "70.1003",
    city: "Gandhidham",
    district: "Kutch",
    state: "Gujarat",
    country: "India",
    type: "airport",
  },
  "mundra airport": {
    name: "Mundra Airport",
    lat: "22.8323",
    lon: "69.7463",
    city: "Mundra",
    district: "Kutch",
    state: "Gujarat",
    country: "India",
    type: "airport",
  },
};

/* ----------------------------------------------
   HELPERS
---------------------------------------------- */

// Find airport fallback (only airports allowed)
function findAirportFallback(query) {
  const q = query.toLowerCase().trim();

  if (AIRPORTS[q]) return AIRPORTS[q];

  // Partial matches e.g. "mundra" → mundra airport
  for (const key of Object.keys(AIRPORTS)) {
    if (key.includes(q) || q.includes(key.split(" ")[0])) {
      return AIRPORTS[key];
    }
  }

  return null;
}

// Check if results contain a relevant match
function hasRelevantMatch(query, results) {
  const q = query.toLowerCase().trim();
  return results.some((p) => p.name.toLowerCase().split(",")[0] === q);
}

// ✅ Filter only Indian locations
function isIndianLocation(place) {
  const country = (place.country || "").toLowerCase();
  
  // Check if country is India or Bharat
  if (country === "india" || country === "bharat" || country === "in") {
    return true;
  }
  
  // Fallback: Check if state is an Indian state
  const indianStates = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
    "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
    "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
    "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
    "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
    "andaman and nicobar islands", "chandigarh", "dadra and nagar haveli and daman and diu",
    "daman and diu", "delhi", "jammu and kashmir", "ladakh", "lakshadweep",
    "puducherry", "pondicherry"
  ];
  
  const state = (place.state || "").toLowerCase();
  return indianStates.includes(state);
}

/* ----------------------------------------------
   SEARCH API
---------------------------------------------- */
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    const rideType = req.query.rideType;

    if (!q) return res.json({ success: true, places: [], match: false });

    const isAirportRide = rideType === "airport";

    // Check airport fallback first
    const airportFallback = isAirportRide ? findAirportFallback(q) : null;

    /* --------------------------------------------
       SPECIAL: LOCAL MODE → Return static places
    -------------------------------------------- */
    if (rideType === "local") {
      const qLower = q.toLowerCase();

      const localMatches = KUTCH_PLACES.filter((place) =>
        place.name.toLowerCase().includes(qLower)
      );

      return res.json({
        success: true,
        places: localMatches,
        match: localMatches.length > 0,
      });
    }

    /* --------------------------------------------
       FETCH FROM GRAPHHOPPER WITH INDIA RESTRICTION
    -------------------------------------------- */
    let results = [];

    try {
      const { data } = await axios.get(
        "https://graphhopper.com/api/1/geocode",
        {
          params: {
            q: q + ", India", // ✅ ADD ", India" to search query
            locale: "en",
            limit: 10, // ✅ Max for free tier
            key: process.env.GRAPH_HOPPER_KEY,
          },
          timeout: 8000, // 8 second timeout
        }
      );

      // Convert results
      results = data.hits.map((p) => ({
        name: [
          p.name,
          p.city,
          p.state,
          p.country,
        ]
          .filter(Boolean)
          .join(", "),
        lat: p.point.lat,
        lon: p.point.lng,
        city: p.city,
        district: p.state,
        state: p.state,
        country: p.country,
      }));

      // ✅ FILTER: Only Indian results allowed
      const indianResults = results.filter((p) => isIndianLocation(p));
      
      // If we got Indian results, use them
      if (indianResults.length > 0) {
        results = indianResults;
      } else {
        // ✅ If no Indian results with ", India" suffix, try without it
        console.log("No Indian results found with ', India' suffix. Trying without...");
        
        const { data: data2 } = await axios.get(
          "https://graphhopper.com/api/1/geocode",
          {
            params: {
              q: q,
              locale: "en",
              limit: 10,
              key: process.env.GRAPH_HOPPER_KEY,
              // ✅ Bias towards India's geographic center
              point: "20.5937,78.9629",
            },
            timeout: 8000,
          }
        );

        results = data2.hits.map((p) => ({
          name: [
            p.name,
            p.city,
            p.state,
            p.country,
          ]
            .filter(Boolean)
            .join(", "),
          lat: p.point.lat,
          lon: p.point.lng,
          city: p.city,
          district: p.state,
          state: p.state,
          country: p.country,
        }));

        // Filter for Indian locations
        results = results.filter((p) => isIndianLocation(p));
      }

      /* --------------------------------------------
         BLOCK AIRPORTS (except airport ride)
      -------------------------------------------- */
      if (!isAirportRide) {
        results = results.filter(
          (p) =>
            !p.name.toLowerCase().includes("airport") &&
            !p.name.toLowerCase().includes("terminal")
        );
      }

    } catch (ghError) {
      console.error("GraphHopper error:", ghError.response?.status, ghError.response?.data || ghError.message);

      // If GraphHopper fails, check if we have airport fallback
      if (airportFallback) {
        return res.json({
          success: true,
          places: [{
            name: airportFallback.name,
            lat: airportFallback.lat,
            lon: airportFallback.lon,
            city: airportFallback.city,
            district: airportFallback.district,
            state: airportFallback.state,
            country: airportFallback.country,
            isFallback: true,
          }],
          match: true,
          warning: "Using offline airport database"
        });
      }

      // Return empty results with error message
      return res.json({
        success: true,
        places: [],
        match: false,
        error: "Location service temporarily unavailable. Please try again."
      });
    }

    /* --------------------------------------------
       INJECT AIRPORT FALLBACK if needed
    -------------------------------------------- */
    if (airportFallback && !hasRelevantMatch(q, results)) {
      results.unshift({
        name: airportFallback.name,
        lat: airportFallback.lat,
        lon: airportFallback.lon,
        city: airportFallback.city,
        district: airportFallback.district,
        state: airportFallback.state,
        country: airportFallback.country,
        isFallback: true,
      });
    }

    return res.json({
      success: true,
      places: results,
      match: hasRelevantMatch(q, results),
    });

  } catch (err) {
    console.error("Search error:", err);
    return res.json({
      success: true,
      places: [],
      match: false,
      error: "An error occurred while searching"
    });
  }
});

/* ----------------------------------------------
   VALIDATE API
---------------------------------------------- */
router.post("/validate", async (req, res) => {
  try {
    const text = req.body.text?.trim();
    if (!text) return res.json({ success: false, message: "Text required" });

    // Check airport fallback first
    const fallback = findAirportFallback(text);
    if (fallback) {
      return res.json({
        success: true,
        lat: fallback.lat,
        lon: fallback.lon,
        formattedName: fallback.name,
        address: {
          city: fallback.city,
          district: fallback.district,
          state: fallback.state,
          country: fallback.country,
        },
      });
    }

    // Try GraphHopper with India restriction
    try {
      const response = await axios.get(
        "https://graphhopper.com/api/1/geocode",
        {
          params: {
            q: text + ", India", // ✅ ADD ", India" to validation query
            limit: 10, // ✅ Max for free tier
            locale: "en",
            key: process.env.GRAPH_HOPPER_KEY,
          },
          timeout: 8000,
        }
      );

      if (!response.data.hits || response.data.hits.length === 0) {
        return res.json({ success: false, message: "Location not found" });
      }

      // ✅ Find first Indian location
      const indianLocation = response.data.hits.find((hit) => {
        const country = (hit.country || "").toLowerCase();
        return country === "india" || country === "bharat" || country === "in";
      });

      if (!indianLocation) {
        return res.json({ 
          success: false, 
          message: "Only Indian locations are supported" 
        });
      }

      const d = indianLocation;

      return res.json({
        success: true,
        lat: d.point.lat,
        lon: d.point.lng,
        formattedName: [
          d.name,
          d.city,
          d.state,
          d.country,
        ].filter(Boolean).join(", "),
        address: {
          city: d.city,
          district: d.state,
          state: d.state,
          country: d.country,
        },
      });

    } catch (ghError) {
      console.error("Validation error:", ghError.response?.status, ghError.response?.data || ghError.message);
      return res.json({
        success: false,
        message: "Location service temporarily unavailable"
      });
    }

  } catch (err) {
    console.error("Validate error:", err);
    return res.json({ success: false, message: "Validation error" });
  }
});

export default router;