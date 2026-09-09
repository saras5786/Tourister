import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaMapMarkedAlt,
  FaMapPin,
  FaCompass,
  FaDirections,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaCompressArrowsAlt,
  FaCarSide,
  FaPlane,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import "./TravelMap.css";

function TravelMap({
  destinationName = "Kakinada",
  sourceName = "Hyderabad",
  sourceCoordinates = { lat: 17.385, lng: 78.4867 },
  destinationCoordinates = { lat: 16.9891, lng: 82.2475 },
  touristPlaces = [],
  routeCoordinates = [],
  routeSummary = null,
  isFlightRoute = false,
}) {
  const [mapType, setMapType] = useState("m"); // 'm' = street, 'k' = satellite
  const [activeTarget, setActiveTarget] = useState("route");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersGroupRef = useRef(null);

  const sLat = Number(sourceCoordinates?.lat) || 17.385;
  const sLng = Number(sourceCoordinates?.lng) || 78.4867;
  const dLat = Number(destinationCoordinates?.lat) || 16.9891;
  const dLng = Number(destinationCoordinates?.lng) || 82.2475;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if map already exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [(sLat + dLat) / 2, (sLng + dLng) / 2],
      zoom: 6,
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Create LayerGroup for markers and polylines
    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;

    // Invalidate size on resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update Tile Layer when mapType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapType === "k") {
      // Esri World Imagery Satellite
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
          attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ).addTo(map);
    } else {
      // OpenStreetMap Street
      tileLayerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }
      ).addTo(map);
    }
  }, [mapType]);

  // Update Route Polyline, Origin/Dest Markers, and Attraction Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    const boundsPoints = [
      [sLat, sLng],
      [dLat, dLng],
    ];

    // 1. Origin Marker
    const originIcon = L.divIcon({
      className: "tourister-map-marker-wrapper",
      html: `
        <div class="custom-route-marker origin-marker">
          <div class="marker-pulse"></div>
          <div class="marker-core origin-core">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="marker-badge origin-badge">START: ${sourceName}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const originMarker = L.marker([sLat, sLng], { icon: originIcon })
      .bindPopup(
        `<div class="map-popup-card">
          <div class="popup-tag origin">ORIGIN</div>
          <h4>${sourceName}</h4>
          <p class="popup-coords">${sLat.toFixed(4)}° N, ${sLng.toFixed(4)}° E</p>
        </div>`
      )
      .addTo(layersGroup);

    // 2. Destination Marker
    const destIcon = L.divIcon({
      className: "tourister-map-marker-wrapper",
      html: `
        <div class="custom-route-marker dest-marker">
          <div class="marker-pulse dest-pulse"></div>
          <div class="marker-core dest-core">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="marker-badge dest-badge">DEST: ${destinationName}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker([dLat, dLng], { icon: destIcon })
      .bindPopup(
        `<div class="map-popup-card">
          <div class="popup-tag dest">DESTINATION</div>
          <h4>${destinationName}</h4>
          <p class="popup-coords">${dLat.toFixed(4)}° N, ${dLng.toFixed(4)}° E</p>
        </div>`
      )
      .addTo(layersGroup);

    // 3. Intermediate Tourist Attraction Markers
    if (touristPlaces && touristPlaces.length > 0) {
      touristPlaces.slice(0, 8).forEach((place, idx) => {
        const pLat = Number(place.lat || place.latitude);
        const pLng = Number(place.lng || place.longitude);

        if (!isNaN(pLat) && !isNaN(pLng) && pLat !== 0 && pLng !== 0) {
          boundsPoints.push([pLat, pLng]);

          const spotIcon = L.divIcon({
            className: "tourister-map-marker-wrapper",
            html: `
              <div class="custom-route-marker spot-marker">
                <div class="marker-core spot-core">
                  <span>${idx + 1}</span>
                </div>
                <div class="marker-badge spot-badge">${place.name.split(" ")[0]}</div>
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          L.marker([pLat, pLng], { icon: spotIcon })
            .bindPopup(
              `<div class="map-popup-card">
                <div class="popup-tag spot">STOP #${idx + 1}</div>
                <h4>${place.name}</h4>
                <p class="popup-desc">${place.category || "Attraction"} · ★ ${place.rating || "4.8"}</p>
                <p class="popup-coords">${pLat.toFixed(4)}° N, ${pLng.toFixed(4)}° E</p>
              </div>`
            )
            .addTo(layersGroup);
        }
      });
    }

    // 4. Route Polyline
    let polylineCoords = [];
    if (routeCoordinates && routeCoordinates.length > 1) {
      polylineCoords = routeCoordinates;
    } else {
      polylineCoords = [
        [sLat, sLng],
        [dLat, dLng],
      ];
    }

    // Add polyline coordinates to bounds calculation
    polylineCoords.forEach((pt) => {
      boundsPoints.push(pt);
    });

    if (isFlightRoute) {
      // Glowing background line
      L.polyline(polylineCoords, {
        color: "#38bdf8",
        weight: 6,
        opacity: 0.35,
        lineCap: "round",
      }).addTo(layersGroup);

      // Dashed flight path
      L.polyline(polylineCoords, {
        color: "#0284c7",
        weight: 3,
        opacity: 0.95,
        dashArray: "8, 10",
        lineCap: "round",
      }).addTo(layersGroup);
    } else {
      // High-contrast outer glow
      L.polyline(polylineCoords, {
        color: "#818cf8",
        weight: 7,
        opacity: 0.45,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(layersGroup);

      // Core vibrant route line
      L.polyline(polylineCoords, {
        color: "#4f46e5",
        weight: 4.5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(layersGroup);
    }

    // 5. Fit map viewport to encompass the full route and all markers
    try {
      const bounds = L.latLngBounds(boundsPoints);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 14,
          animate: false,
        });
      }
    } catch (e) {
      console.warn("Fit bounds notice:", e);
    }
  }, [
    sLat,
    sLng,
    dLat,
    dLng,
    sourceName,
    destinationName,
    touristPlaces,
    routeCoordinates,
    isFlightRoute,
  ]);

  // Handle zooming to specific target
  const handleSelectPin = (target, place = null) => {
    setActiveTarget(target);
    setSelectedPlace(place);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (target === "source") {
      map.flyTo([sLat, sLng], 14, { duration: 1.2 });
    } else if (target === "dest") {
      map.flyTo([dLat, dLng], 14, { duration: 1.2 });
    } else if (target === "route") {
      handleFitRoute();
    } else if (place) {
      const pLat = Number(place.lat || place.latitude);
      const pLng = Number(place.lng || place.longitude);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        map.flyTo([pLat, pLng], 15, { duration: 1.2 });
      }
    }
  };

  // Re-center and fit to the complete route
  const handleFitRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const boundsPoints = [
      [sLat, sLng],
      [dLat, dLng],
      ...(routeCoordinates || []),
    ];

    try {
      const bounds = L.latLngBounds(boundsPoints);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 14,
          animate: true,
          duration: 1.0,
        });
      }
    } catch (e) {
      console.warn("Fit route error:", e);
    }
  };

  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${sLat},${sLng}&destination=${dLat},${dLng}`;

  return (
    <div className="travel-map-container">
      {/* HEADER CONTROLS */}
      <div className="travel-map-header">
        <div className="map-title-row">
          <div className="map-icon-badge">
            <FaMapMarkedAlt />
          </div>
          <div>
            <h3>Live Interactive Route Map</h3>
            <p>
              {sourceName} ➔ {destinationName}
              {routeSummary?.roadDistanceKm !== null && routeSummary?.roadDistanceKm !== undefined && (
                <span> · {routeSummary.roadDistanceKm} km ({routeSummary.roadDistanceMiles} mi)</span>
              )}
            </p>
          </div>
        </div>

        <div className="map-controls">
          <button
            type="button"
            className={`map-toggle-btn ${mapType === "m" ? "active" : ""}`}
            onClick={() => setMapType("m")}
            title="Street map view"
          >
            <FaLayerGroup /> Street
          </button>
          <button
            type="button"
            className={`map-toggle-btn ${mapType === "k" ? "active" : ""}`}
            onClick={() => setMapType("k")}
            title="Satellite imagery view"
          >
            <FaCompass /> Satellite
          </button>
          <button
            type="button"
            className="map-toggle-btn fit-btn"
            onClick={handleFitRoute}
            title="Fit view to complete route"
          >
            <FaCompressArrowsAlt /> Fit Route
          </button>
          <a
            href={googleDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="map-dir-btn"
            title="Open in Google Maps for live GPS navigation"
          >
            <FaDirections /> Live Directions ↗
          </a>
        </div>
      </div>

      {/* QUICK LOCATION & ATTRACTION PIN SELECTOR */}
      <div className="map-pins-bar">
        <span className="pins-label">
          <FaMapPin /> PINS:
        </span>
        <button
          type="button"
          className={`place-pin-chip ${activeTarget === "route" ? "active" : ""}`}
          onClick={() => handleSelectPin("route")}
        >
          {isFlightRoute ? <FaPlane className="pin-icon blue" /> : <FaCarSide className="pin-icon blue" />} Whole Route
        </button>
        <button
          type="button"
          className={`place-pin-chip ${activeTarget === "source" ? "active" : ""}`}
          onClick={() => handleSelectPin("source")}
        >
          <FaMapMarkerAlt className="pin-icon green" /> Origin: {sourceName}
        </button>
        <button
          type="button"
          className={`place-pin-chip ${activeTarget === "dest" ? "active" : ""}`}
          onClick={() => handleSelectPin("dest")}
        >
          <FaMapMarkerAlt className="pin-icon red" /> Dest: {destinationName}
        </button>

        {touristPlaces &&
          touristPlaces.slice(0, 6).map((place, idx) => (
            <button
              key={place.id || idx}
              type="button"
              className={`place-pin-chip ${
                selectedPlace?.id === place.id ? "active" : ""
              }`}
              onClick={() => handleSelectPin(place.id || idx, place)}
            >
              <FaMapMarkerAlt className="pin-icon orange" /> #{idx + 1} {place.name.split(" ")[0]}
            </button>
          ))}
      </div>

      {/* LEAFLET INTERACTIVE MAP CANVAS */}
      <div className="map-canvas-wrap">
        <div ref={mapContainerRef} className="leaflet-map-canvas" />

        {/* FLOATING ROUTE METRICS BADGE */}
        {routeSummary && (
          <div className="map-floating-route-badge">
            <span className="live-route-indicator">
              <span className="pulse-dot"></span>
              {isFlightRoute ? "FLIGHT CORRIDOR" : "LIVE ROAD ROUTE"}
            </span>
            <div className="floating-metric-values">
              <strong>
                {routeSummary.roadDistanceKm !== null && routeSummary.roadDistanceKm !== undefined
                  ? `${routeSummary.roadDistanceKm} km (${routeSummary.roadDistanceMiles} mi)`
                  : `${routeSummary.airDistanceKm} km (${routeSummary.airDistanceMiles} mi)`}
              </strong>
              <small>
                {isFlightRoute
                  ? `~${routeSummary.flightDurationText}`
                  : `~${routeSummary.drivingDurationText}`}
              </small>
            </div>
          </div>
        )}

        {/* FLOATING ZOOM CONTROLS */}
        <div className="map-floating-zoom-controls">
          <button
            type="button"
            className="floating-zoom-btn"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
          >
            <FaPlus />
          </button>
          <button
            type="button"
            className="floating-zoom-btn"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
          >
            <FaMinus />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TravelMap;
