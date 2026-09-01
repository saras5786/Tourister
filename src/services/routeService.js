/**
 * Real Route & Distance Calculation Service
 * Uses true spherical trigonometry (Haversine formula) for Air Distance
 * Uses OSRM / Mapbox Directions Routing API for Real Driving Road Distance & Duration
 */

/**
 * Calculate Great-Circle Air Distance between two coordinates in kilometers
 */
export function calculateAirDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Format duration in seconds to clean human-readable string (e.g. "7h 45m" or "45m")
 */
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Fetch real driving road route between two coordinates via OSRM / Mapbox
 * Returns real road distance in km, driving duration, and route geometry
 */
export async function fetchRealRoadRoute(lat1, lon1, lat2, lon2) {
  // If coordinates are the same or distance is negligible
  const airDist = calculateAirDistanceKm(lat1, lon1, lat2, lon2);
  if (airDist === 0) {
    return {
      isLocal: true,
      roadDistanceKm: 0,
      drivingDurationText: "Local travel (15-30m)",
      routeCoordinates: [[lon1, lat1]],
      source: "local",
    };
  }

  // 1. Try Mapbox Directions API if valid token is provided
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  if (
    mapboxToken &&
    mapboxToken.startsWith("pk.") &&
    !mapboxToken.includes("demo_token") &&
    mapboxToken !== "YOUR_MAPBOX_PUBLIC_TOKEN"
  ) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lon1},${lat1};${lon2},${lat2}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            isLocal: false,
            roadDistanceKm: Math.round(route.distance / 1000),
            drivingDurationText: formatDuration(route.duration),
            routeCoordinates: route.geometry?.coordinates || [],
            source: "mapbox",
          };
        }
      }
    } catch (e) {
      console.warn("Mapbox directions routing error, trying OSRM:", e);
    }
  }

  // 2. Open Source Routing Machine (OSRM) Public API (free, worldwide, no API key)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          isLocal: false,
          roadDistanceKm: Math.round(route.distance / 1000),
          drivingDurationText: formatDuration(route.duration),
          routeCoordinates: route.geometry?.coordinates || [],
          source: "osrm",
        };
      }
    }
  } catch (e) {
    console.warn("OSRM routing unreachable:", e);
  }

  // If no road connection exists (e.g. across oceans like Hyderabad -> Amsterdam)
  return null;
}

/**
 * Calculate Comprehensive Real Travel Summary
 * Never generates fake 450 km or 1 hour fallbacks.
 */
export async function getRealRouteSummary(sourceLoc, destLoc) {
  if (!sourceLoc || !destLoc) return null;

  const lat1 = sourceLoc.latitude;
  const lon1 = sourceLoc.longitude;
  const lat2 = destLoc.latitude;
  const lon2 = destLoc.longitude;

  const airDistanceKm = calculateAirDistanceKm(lat1, lon1, lat2, lon2);
  const isLocal =
    airDistanceKm === 0 ||
    sourceLoc.name.toLowerCase() === destLoc.name.toLowerCase();

  if (isLocal) {
    return {
      isLocal: true,
      airDistanceKm: 0,
      roadDistanceKm: 0,
      drivingDurationText: "Local exploration (15-30m)",
      flightInfo: "Not applicable (Local city)",
      trainInfo: "Local metro / suburban transit",
      busInfo: "Local city bus / auto-rickshaw",
      ecoCo2: "0.005t CO2",
      routeCoordinates: [[lon1, lat1]],
      roadRouteAvailable: true,
    };
  }

  // Fetch real road route
  const roadResult = await fetchRealRoadRoute(lat1, lon1, lat2, lon2);

  // Flight Info: Real air distance with explicit transparency
  let flightInfo = "";
  if (airDistanceKm < 200) {
    flightInfo = `Air distance: ${airDistanceKm} km (Direct road/rail recommended)`;
  } else if (airDistanceKm < 1500) {
    flightInfo = `Air distance: ${airDistanceKm} km (Live flight schedule integration required)`;
  } else {
    flightInfo = `Air distance: ${airDistanceKm} km (International flight data integration required)`;
  }

  // Train Info: Honest transparency
  const trainInfo = "Check live rail options (IRCTC / Ixigo)";

  // Bus Info: Based on actual road duration if road exists
  let busInfo = "";
  if (roadResult) {
    busInfo = `Estimated road transit: ~${roadResult.drivingDurationText} (Subject to bus operator schedules)`;
  } else {
    busInfo = "Road route unavailable (Intercontinental / overseas)";
  }

  // Estimated CO2 calculated strictly from real distance
  const distForCo2 = roadResult ? roadResult.roadDistanceKm : airDistanceKm;
  const ecoCo2 = `${(distForCo2 * 0.00009).toFixed(2)}t CO2`;

  return {
    isLocal: false,
    airDistanceKm,
    roadDistanceKm: roadResult ? roadResult.roadDistanceKm : null,
    drivingDurationText: roadResult ? roadResult.drivingDurationText : null,
    flightInfo,
    trainInfo,
    busInfo,
    ecoCo2,
    routeCoordinates: roadResult ? roadResult.routeCoordinates : [],
    roadRouteAvailable: Boolean(roadResult),
  };
}
