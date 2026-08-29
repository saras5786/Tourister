import { useState } from "react";
import {
  FaMapMarkedAlt,
  FaMapPin,
  FaCompass,
  FaDirections,
  FaExpandAlt,
  FaLayerGroup,
} from "react-icons/fa";
import "./TravelMap.css";

function TravelMap({
  destinationName = "Kakinada",
  coordinates = { lat: 16.9891, lng: 82.2475 },
  touristPlaces = [],
  source = "Hyderabad",
}) {
  const [mapType, setMapType] = useState("m"); // 'm' (roadmap) or 'k' (satellite)
  const [selectedPin, setSelectedPin] = useState(null);
  const [zoomLevel] = useState(13);

  const activeLat = selectedPin ? selectedPin.lat : coordinates.lat;
  const activeLng = selectedPin ? selectedPin.lng : coordinates.lng;

  // Embedded Interactive OpenStreetMap / Google Map URL
  const mapEmbedUrl = `https://maps.google.com/maps?q=${activeLat},${activeLng}&z=${zoomLevel}&t=${mapType}&output=embed`;

  return (
    <div className="travel-map-container">
      <div className="travel-map-header">
        <div className="map-title-row">
          <div className="map-icon-badge">
            <FaMapMarkedAlt />
          </div>
          <div>
            <h3>Interactive Satellite & Route Map: {destinationName}</h3>
            <p>Live coordinates: {activeLat.toFixed(4)}° N, {activeLng.toFixed(4)}° E · {source} → {destinationName}</p>
          </div>
        </div>

        <div className="map-controls">
          <button
            className={`map-toggle-btn ${mapType === "m" ? "active" : ""}`}
            onClick={() => setMapType("m")}
          >
            <FaLayerGroup /> Street Map
          </button>
          <button
            className={`map-toggle-btn ${mapType === "k" ? "active" : ""}`}
            onClick={() => setMapType("k")}
          >
            <FaCompass /> Satellite
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destinationName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-dir-btn"
          >
            <FaDirections /> Open in Google Maps ↗
          </a>
        </div>
      </div>

      {/* ATTRACTION QUICK PINS BAR */}
      {touristPlaces && touristPlaces.length > 0 && (
        <div className="map-pins-bar">
          <span className="pins-label">
            <FaMapPin /> PLACES ON MAP:
          </span>
          <button
            className={`place-pin-chip ${!selectedPin ? "active" : ""}`}
            onClick={() => setSelectedPin(null)}
          >
            📍 {destinationName} (City Center)
          </button>
          {touristPlaces.map((place) => (
            <button
              key={place.id}
              className={`place-pin-chip ${selectedPin?.id === place.id ? "active" : ""}`}
              onClick={() => setSelectedPin(place)}
            >
              🏛️ {place.name.split(" ")[0]} {place.name.split(" ")[1] || ""} ({place.distanceKm}km)
            </button>
          ))}
        </div>
      )}

      {/* MAP EMBED IFRAME */}
      <div className="map-iframe-wrap">
        <iframe
          title={`Map of ${destinationName}`}
          src={mapEmbedUrl}
          width="100%"
          height="380"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="map-live-tag">
          <span className="live-pulsing-dot" /> LIVE GPS MAPPED
        </div>
        <button
          className="map-expand-btn"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPin?.name || destinationName)}`, "_blank")}
        >
          <FaExpandAlt /> Fullscreen
        </button>
      </div>
    </div>
  );
}

export default TravelMap;
