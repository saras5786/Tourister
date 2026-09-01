import { useState } from "react";
import {
  FaMapMarkedAlt,
  FaMapPin,
  FaCompass,
  FaDirections,
  FaLayerGroup,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./TravelMap.css";

function TravelMap({
  destinationName = "Kakinada",
  sourceName = "Hyderabad",
  sourceCoordinates = { lat: 17.385, lng: 78.4867 },
  destinationCoordinates = { lat: 16.9891, lng: 82.2475 },
  touristPlaces = [],
}) {
  const [mapType, setMapType] = useState("m"); // 'm' (roadmap) or 'k' (satellite)
  const [activeTarget, setActiveTarget] = useState("dest"); // 'source' | 'dest' | placeId
  const [selectedPlace, setSelectedPlace] = useState(null);

  let activeLat = destinationCoordinates.lat;
  let activeLng = destinationCoordinates.lng;
  let zoomLevel = 13;

  if (activeTarget === "source") {
    activeLat = sourceCoordinates.lat;
    activeLng = sourceCoordinates.lng;
  } else if (activeTarget === "dest") {
    activeLat = destinationCoordinates.lat;
    activeLng = destinationCoordinates.lng;
  } else if (selectedPlace) {
    activeLat = selectedPlace.lat;
    activeLng = selectedPlace.lng;
    zoomLevel = 15;
  }

  // Real-time map embed with accurate coordinates
  const mapEmbedUrl = `https://maps.google.com/maps?q=${activeLat},${activeLng}&z=${zoomLevel}&t=${mapType}&output=embed`;

  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${sourceCoordinates.lat},${sourceCoordinates.lng}&destination=${destinationCoordinates.lat},${destinationCoordinates.lng}`;

  return (
    <div className="travel-map-container">
      <div className="travel-map-header">
        <div className="map-title-row">
          <div className="map-icon-badge">
            <FaMapMarkedAlt />
          </div>
          <div>
            <h3>Interactive Satellite & Real Coordinate Map</h3>
            <p>
              Target: {activeLat?.toFixed(4)}° N, {activeLng?.toFixed(4)}° E · {sourceName} ➔ {destinationName}
            </p>
          </div>
        </div>

        <div className="map-controls">
          <button
            type="button"
            className={`map-toggle-btn ${mapType === "m" ? "active" : ""}`}
            onClick={() => setMapType("m")}
          >
            <FaLayerGroup /> Street Map
          </button>
          <button
            type="button"
            className={`map-toggle-btn ${mapType === "k" ? "active" : ""}`}
            onClick={() => setMapType("k")}
          >
            <FaCompass /> Satellite
          </button>
          <a
            href={googleDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="map-dir-btn"
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
          className={`place-pin-chip ${activeTarget === "source" ? "active" : ""}`}
          onClick={() => {
            setActiveTarget("source");
            setSelectedPlace(null);
          }}
        >
          <FaMapMarkerAlt className="pin-icon blue" /> Origin: {sourceName}
        </button>
        <button
          type="button"
          className={`place-pin-chip ${activeTarget === "dest" ? "active" : ""}`}
          onClick={() => {
            setActiveTarget("dest");
            setSelectedPlace(null);
          }}
        >
          <FaMapMarkerAlt className="pin-icon red" /> Destination: {destinationName}
        </button>

        {touristPlaces &&
          touristPlaces.slice(0, 6).map((place) => (
            <button
              key={place.id}
              type="button"
              className={`place-pin-chip ${
                selectedPlace?.id === place.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveTarget(place.id);
                setSelectedPlace(place);
              }}
            >
              <FaMapMarkerAlt className="pin-icon orange" /> {place.name.split(" ")[0]} {place.name.split(" ")[1] || ""}
            </button>
          ))}
      </div>

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
      </div>
    </div>
  );
}

export default TravelMap;
