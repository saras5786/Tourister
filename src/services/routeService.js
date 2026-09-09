/**
 * Real Route & Distance Calculation Service
 * Uses true spherical trigonometry (Haversine formula) for Great-Circle Air Distance
 * Uses OSRM / Mapbox Directions Routing API for Real Driving Road Distance & Duration
 * Provides realistic multi-modal transit metrics (Driving, Bus, Train, Flight)
 */

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km) {
  if (km === null || km === undefined) return 0;
  return Math.round(km * 0.621371);
}

/**
 * Calculate Great-Circle Air Distance between two coordinates in kilometers using Haversine formula
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
 * Generate smooth Great-Circle (Geodesic) arc coordinates between two points
 * Uses spherical interpolation (Slerp) to produce intermediate [lat, lon] points
 */
export function generateGeodesicArc(lat1, lon1, lat2, lon2, numSteps = 50) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return [];
  }

  const points = [];
  const phi1 = (lat1 * Math.PI) / 180;
  const lambda1 = (lon1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const lambda2 = (lon2 * Math.PI) / 180;

  // Angular distance in radians
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((phi2 - phi1) / 2) ** 2 +
          Math.cos(phi1) * Math.cos(phi2) * Math.sin((lambda2 - lambda1) / 2) ** 2
      )
    );

  if (d === 0) {
    return [[lat1, lon1]];
  }

  for (let i = 0; i <= numSteps; i++) {
    const f = i / numSteps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x =
      A * Math.cos(phi1) * Math.cos(lambda1) +
      B * Math.cos(phi2) * Math.cos(lambda2);
    const y =
      A * Math.cos(phi1) * Math.sin(lambda1) +
      B * Math.cos(phi2) * Math.sin(lambda2);
    const z = A * Math.sin(phi1) + B * Math.sin(phi2);

    const lat = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI;
    const lon = (Math.atan2(y, x) * 180) / Math.PI;

    points.push([+lat.toFixed(5), +lon.toFixed(5)]);
  }

  return points;
}

/**
 * Format duration in seconds to clean human-readable string (e.g. "7h 45m" or "45m")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Fetch real driving road route between two coordinates via OSRM / Mapbox
 * Returns real road distance in km & miles, driving duration, and [lat, lon] route coordinates
 */
export async function fetchRealRoadRoute(lat1, lon1, lat2, lon2) {
  const airDist = calculateAirDistanceKm(lat1, lon1, lat2, lon2);
  if (airDist === 0) {
    return {
      isLocal: true,
      roadDistanceKm: 0,
      roadDistanceMiles: 0,
      drivingDurationText: "Local travel (15-30m)",
      routeCoordinates: [[lat1, lon1]],
      source: "local",
    };
  }

  // 1. Try Mapbox Directions API if valid token is provided
  const mapboxToken =
    typeof import.meta !== "undefined" && import.meta?.env
      ? import.meta.env.VITE_MAPBOX_TOKEN
      : undefined;
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
          const distKm = Math.round(route.distance / 1000);
          // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
          const coords = (route.geometry?.coordinates || []).map(([ln, lt]) => [
            lt,
            ln,
          ]);
          return {
            isLocal: false,
            roadDistanceKm: distKm,
            roadDistanceMiles: kmToMiles(distKm),
            drivingDurationText: formatDuration(route.duration),
            drivingDurationSeconds: route.duration,
            routeCoordinates: coords,
            source: "mapbox",
          };
        }
      }
    } catch (e) {
      console.warn("Mapbox directions routing error, trying OSRM:", e);
    }
  }

  // 2. High-speed OpenStreetMap / OSRM Routing Servers (Free, Worldwide, No API Key)
  const routingEndpoints = [
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`,
    `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`,
  ];

  for (const endpointUrl of routingEndpoints) {
    try {
      const res = await fetch(endpointUrl, { signal: AbortSignal.timeout(7000) });
      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && Array.isArray(data.routes) && data.routes.length > 0) {
          const route = data.routes[0];
          const distKm = Math.round(route.distance / 1000);
          // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
          const coords = (route.geometry?.coordinates || []).map(([ln, lt]) => [
            lt,
            ln,
          ]);
          if (coords.length > 1) {
            return {
              isLocal: false,
              roadDistanceKm: distKm,
              roadDistanceMiles: kmToMiles(distKm),
              drivingDurationText: formatDuration(route.duration),
              drivingDurationSeconds: route.duration,
              routeCoordinates: coords,
              source: "osrm_real_highway",
            };
          }
        }
      }
    } catch (e) {
      console.warn("Routing mirror attempt notice:", e.message);
    }
  }

  // 3. Fallback when road API is unreachable or offline for land connections (< 3500 km)
  if (airDist && airDist < 3500) {
    // Apply realistic road tortuosity factor (~1.28x)
    const estimatedRoadKm = Math.round(airDist * 1.28);
    // Average driving speed 68 km/h
    const estimatedDrivingSeconds = Math.round((estimatedRoadKm / 68) * 3600);
    return {
      isLocal: false,
      roadDistanceKm: estimatedRoadKm,
      roadDistanceMiles: kmToMiles(estimatedRoadKm),
      drivingDurationText: formatDuration(estimatedDrivingSeconds),
      drivingDurationSeconds: estimatedDrivingSeconds,
      routeCoordinates: generateGeodesicArc(lat1, lon1, lat2, lon2, 40),
      source: "haversine_tortuosity_estimate",
      isFallbackEstimate: true,
    };
  }

  // Over oceans / intercontinental routes where no road exists
  return null;
}

/**
 * Calculate Comprehensive Real Multi-Modal Travel Summary
 * Never generates fake 450 km or 1 hour fallbacks.
 */
export async function getRealRouteSummary(sourceLoc, destLoc) {
  if (!sourceLoc || !destLoc) return null;

  const lat1 = sourceLoc.latitude;
  const lon1 = sourceLoc.longitude;
  const lat2 = destLoc.latitude;
  const lon2 = destLoc.longitude;

  const airDistanceKm = calculateAirDistanceKm(lat1, lon1, lat2, lon2);
  const airDistanceMiles = kmToMiles(airDistanceKm);

  const isLocal =
    airDistanceKm === 0 ||
    sourceLoc.name?.toLowerCase() === destLoc.name?.toLowerCase();

  if (isLocal) {
    return {
      isLocal: true,
      corridorType: "local",
      airDistanceKm: 0,
      airDistanceMiles: 0,
      roadDistanceKm: 0,
      roadDistanceMiles: 0,
      drivingDurationText: "Local exploration (15-30m)",
      flightDurationText: "Not applicable (Local city)",
      trainDurationText: "Local metro / suburban transit",
      busDurationText: "Local city bus / auto-rickshaw",
      trainDistanceKm: 0,
      busDistanceKm: 0,
      flightInfo: "Not applicable (Local city)",
      trainInfo: "Local metro / suburban transit",
      busInfo: "Local city bus / auto-rickshaw",
      ecoCo2: "0.005t CO2",
      routeCoordinates: [[lat1, lon1]],
      roadRouteAvailable: true,
    };
  }

  // Fetch real road route
  const roadResult = await fetchRealRoadRoute(lat1, lon1, lat2, lon2);

  // Multi-modal transit estimations:
  // 1. Flight: Cruising speed 750 km/h + 1.5h (5400s) airport check-in / boarding buffer
  const flightAirSeconds = Math.round((airDistanceKm / 750) * 3600) + 5400;
  const flightDurationText = formatDuration(flightAirSeconds);

  // 2. Train: Rail winding factor ~1.18x of air distance at ~65 km/h average speed
  const trainDistanceKm = Math.round(airDistanceKm * 1.18);
  const trainDistanceMiles = kmToMiles(trainDistanceKm);
  const trainSeconds = Math.round((trainDistanceKm / 65) * 3600);
  const trainDurationText = formatDuration(trainSeconds);

  // 3. Bus: Road distance at ~50 km/h average transit speed with highway rest stops
  const busDistanceKm = roadResult
    ? roadResult.roadDistanceKm
    : Math.round(airDistanceKm * 1.28);
  const busDistanceMiles = kmToMiles(busDistanceKm);
  const busSeconds = Math.round((busDistanceKm / 50) * 3600);
  const busDurationText = formatDuration(busSeconds);

  // Status & Guidance labels
  let flightInfo = "";
  if (airDistanceKm < 200) {
    flightInfo = `${airDistanceKm} km / ${airDistanceMiles} mi (Direct road/rail recommended)`;
  } else {
    flightInfo = `${airDistanceKm} km / ${airDistanceMiles} mi (~${flightDurationText} incl. airport check-in)`;
  }

  const trainInfo = `~${trainDurationText} (${trainDistanceKm} km / ${trainDistanceMiles} mi)`;
  const busInfo = roadResult
    ? `~${busDurationText} (${busDistanceKm} km / ${busDistanceMiles} mi)`
    : "Road route unavailable (Intercontinental / overseas)";

  // Estimated CO2 calculated strictly from real distance
  const distForCo2 = roadResult ? roadResult.roadDistanceKm : airDistanceKm;
  const ecoCo2 = `${(distForCo2 * 0.00009).toFixed(2)}t CO2`;

  // Route coordinates: use road coordinates if available, otherwise great-circle flight arc
  const routeCoordinates =
    roadResult && roadResult.routeCoordinates && roadResult.routeCoordinates.length > 0
      ? roadResult.routeCoordinates
      : generateGeodesicArc(lat1, lon1, lat2, lon2, 60);

  return {
    isLocal: false,
    corridorType: roadResult ? "road" : "air",
    airDistanceKm,
    airDistanceMiles,
    roadDistanceKm: roadResult ? roadResult.roadDistanceKm : null,
    roadDistanceMiles: roadResult ? roadResult.roadDistanceMiles : null,
    drivingDurationText: roadResult ? roadResult.drivingDurationText : null,
    flightDurationText,
    trainDistanceKm,
    trainDistanceMiles,
    trainDurationText,
    busDistanceKm,
    busDistanceMiles,
    busDurationText,
    flightInfo,
    trainInfo,
    busInfo,
    ecoCo2,
    routeCoordinates,
    roadRouteAvailable: Boolean(roadResult),
    isFallbackEstimate: Boolean(roadResult?.isFallbackEstimate),
  };
}
