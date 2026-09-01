import { useState, useEffect, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaCity,
  FaPlane,
  FaTrain,
  FaCompass,
} from "react-icons/fa";
import "./LocationAutocomplete.css";

// Common Indian & International travel aliases for instant fuzzy matching
const KNOWN_ALIASES = {
  hyd: "Hyderabad, Telangana, India",
  kkd: "Kakinada, Andhra Pradesh, India",
  vizag: "Visakhapatnam, Andhra Pradesh, India",
  chennai: "Chennai, Tamil Nadu, India",
  blr: "Bengaluru, Karnataka, India",
  bangalore: "Bengaluru, Karnataka, India",
  delhi: "New Delhi, Delhi, India",
  ndls: "New Delhi Railway Station, Delhi, India",
  mumbai: "Mumbai, Maharashtra, India",
  bom: "Chhatrapati Shivaji Maharaj International Airport, Mumbai, India",
  tpt: "Tirupati, Andhra Pradesh, India",
  tirupati: "Tirupati, Andhra Pradesh, India",
  goa: "Goa, India",
  vns: "Varanasi, Uttar Pradesh, India",
  varanasi: "Varanasi, Uttar Pradesh, India",
  ktm: "Kathmandu, Nepal",
  kat: "Kathmandu, Nepal",
  dxb: "Dubai, United Arab Emirates",
  dubai: "Dubai, United Arab Emirates",
  pune: "Pune, Maharashtra, India",
  kolkata: "Kolkata, West Bengal, India",
  ccu: "Kolkata, West Bengal, India",
  jaipur: "Jaipur, Rajasthan, India",
  kochi: "Kochi, Kerala, India",
  cochin: "Kochi, Kerala, India",
  madurai: "Madurai, Tamil Nadu, India",
};

// Curated default recommendations for empty focus
const DEFAULT_POPULAR_PLACES = [
  {
    name: "Hyderabad",
    fullAddress: "Hyderabad, Telangana, India",
    latitude: 17.385,
    longitude: 78.4867,
    placeId: "def-hyd",
    type: "city",
  },
  {
    name: "Kakinada",
    fullAddress: "Kakinada, Andhra Pradesh, India",
    latitude: 16.9891,
    longitude: 82.2475,
    placeId: "def-kkd",
    type: "city",
  },
  {
    name: "Tirupati",
    fullAddress: "Tirupati, Andhra Pradesh, India",
    latitude: 13.6288,
    longitude: 79.4192,
    placeId: "def-tpt",
    type: "city",
  },
  {
    name: "Visakhapatnam",
    fullAddress: "Visakhapatnam, Andhra Pradesh, India",
    latitude: 17.6868,
    longitude: 83.2185,
    placeId: "def-vizag",
    type: "city",
  },
  {
    name: "Bengaluru",
    fullAddress: "Bengaluru, Karnataka, India",
    latitude: 12.9716,
    longitude: 77.5946,
    placeId: "def-blr",
    type: "city",
  },
  {
    name: "Chennai",
    fullAddress: "Chennai, Tamil Nadu, India",
    latitude: 13.0827,
    longitude: 80.2707,
    placeId: "def-chn",
    type: "city",
  },
  {
    name: "Kathmandu",
    fullAddress: "Kathmandu, Bagmati Province, Nepal",
    latitude: 27.7172,
    longitude: 85.324,
    placeId: "def-ktm",
    type: "city",
  },
  {
    name: "Dubai",
    fullAddress: "Dubai, United Arab Emirates",
    latitude: 25.2048,
    longitude: 55.2708,
    placeId: "def-dxb",
    type: "city",
  },
];

function LocationAutocomplete({
  label = "LOCATION",
  subLabel = "Search location",
  placeholder = "Search real cities, airports, stations...",
  selectedLocation = null,
  onLocationSelect,
  iconType = "origin", // 'origin' | 'destination'
}) {
  const [query, setQuery] = useState(selectedLocation?.name || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync external selectedLocation changes
  useEffect(() => {
    if (selectedLocation?.name) {
      setQuery(selectedLocation.name);
    }
  }, [selectedLocation]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Real-time Geocoding Search with Mapbox API & Fallback
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    // Cancel previous stale request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setHasSearched(true);

    const timer = setTimeout(async () => {
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        const normalizedQuery = KNOWN_ALIASES[trimmed.toLowerCase()] || trimmed;
        let results = [];

        // 1. Try Mapbox Geocoding API if token is provided & not default placeholder
        if (
          token &&
          token !== "YOUR_MAPBOX_PUBLIC_TOKEN" &&
          token.startsWith("pk.") &&
          !token.includes("demo_token_or_replace")
        ) {
          try {
            const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              normalizedQuery
            )}.json?access_token=${token}&autocomplete=true&limit=8`;

            const res = await fetch(mapboxUrl, {
              signal: abortController.signal,
            });

            if (res.ok) {
              const data = await res.json();
              if (data?.features && data.features.length > 0) {
                results = data.features.map((feat) => {
                  const placeName = feat.text || feat.place_name.split(",")[0];
                  return {
                    name: placeName,
                    fullAddress: feat.place_name,
                    latitude: feat.center[1],
                    longitude: feat.center[0],
                    placeId: feat.id || `mb-${Math.random()}`,
                    type: feat.place_type?.[0] || "place",
                  };
                });
              }
            }
          } catch (e) {
            if (e.name !== "AbortError") {
              console.warn("Mapbox geocoding call failed, trying Photon fallback:", e);
            }
          }
        }

        // 2. Resilient OpenStreetMap Photon Geocoding fallback
        if (results.length === 0 && !abortController.signal.aborted) {
          try {
            const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
              normalizedQuery
            )}&limit=8`;
            const res = await fetch(photonUrl, {
              signal: abortController.signal,
            });

            if (res.ok) {
              const data = await res.json();
              if (data?.features && data.features.length > 0) {
                results = data.features.map((feat) => {
                  const props = feat.properties || {};
                  const coords = feat.geometry?.coordinates || [0, 0];
                  const primaryName = props.name || props.city || trimmed;
                  const parts = [
                    props.name,
                    props.city !== props.name ? props.city : null,
                    props.state,
                    props.country,
                  ].filter(Boolean);

                  return {
                    name: primaryName,
                    fullAddress: parts.join(", "),
                    latitude: coords[1],
                    longitude: coords[0],
                    placeId: props.osm_id ? `osm-${props.osm_id}` : `photon-${Math.random()}`,
                    type: props.type || (props.city ? "city" : "place"),
                  };
                });
              }
            }
          } catch (e) {
            if (e.name !== "AbortError") {
              console.warn("Photon fallback notice:", e);
            }
          }
        }

        // 3. Fallback to matching curated cities if external APIs return empty
        if (results.length === 0 && !abortController.signal.aborted) {
          results = DEFAULT_POPULAR_PLACES.filter(
            (p) =>
              p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
              p.fullAddress.toLowerCase().includes(trimmed.toLowerCase())
          );
        }

        if (!abortController.signal.aborted) {
          setSuggestions(results);
          setLoading(false);
          setHighlightedIndex(-1);
          setIsOpen(true);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Location autocomplete error:", err);
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (query.trim().length < 2 && suggestions.length === 0) {
      setSuggestions(DEFAULT_POPULAR_PLACES);
    }
  };

  const handleSelect = (location) => {
    setQuery(location.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onLocationSelect) {
      onLocationSelect({
        name: location.name,
        fullAddress: location.fullAddress,
        latitude: location.latitude,
        longitude: location.longitude,
        placeId: location.placeId,
      });
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Determine icon based on place type
  const getPlaceIcon = (type) => {
    if (type === "airport") return <FaPlane className="place-icon airport" />;
    if (type === "train" || type === "station") return <FaTrain className="place-icon train" />;
    if (type === "city") return <FaCity className="place-icon city" />;
    return <FaMapMarkerAlt className="place-icon pin" />;
  };

  return (
    <div className="location-autocomplete-container" ref={containerRef}>
      {/* LABEL ROW */}
      <div className="autocomplete-label-row">
        <span className={`label-badge ${iconType === "origin" ? "origin-badge" : "dest-badge"}`}>
          {label}
        </span>
        <span className="label-subtext">{subLabel}</span>
      </div>

      {/* INPUT FIELD CONTAINER */}
      <div className={`autocomplete-input-box ${isOpen ? "focused" : ""}`}>
        <div className={`leading-pin ${iconType === "origin" ? "origin-pin" : "dest-pin"}`}>
          <FaMapMarkerAlt />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="real-autocomplete-input"
          autoComplete="off"
          spellCheck="false"
        />

        <div className="trailing-actions">
          {loading && <FaSpinner className="loading-spinner" />}
          {!loading && query && (
            <button
              type="button"
              className="clear-query-btn"
              onClick={handleClear}
              title="Clear input"
            >
              <FaTimes />
            </button>
          )}
          {!loading && !query && <FaSearch className="search-hint-icon" />}
        </div>
      </div>

      {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
      {isOpen && (
        <div className="autocomplete-results-dropdown">
          {loading && suggestions.length === 0 && (
            <div className="dropdown-status-row">
              <FaSpinner className="loading-spinner inline" />
              <span>Searching real-time location database...</span>
            </div>
          )}

          {!loading && suggestions.length === 0 && hasSearched && (
            <div className="dropdown-empty-row">
              <FaCompass className="empty-icon" />
              <div className="empty-text">
                <strong>No locations found</strong>
                <span>Try searching with a different spelling or city name</span>
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <ul className="suggestions-list" role="listbox">
              {suggestions.map((item, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected = selectedLocation?.name === item.name;

                return (
                  <li
                    key={item.placeId || index}
                    role="option"
                    aria-selected={isSelected}
                    className={`suggestion-item ${isHighlighted ? "highlighted" : ""} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="item-icon-box">{getPlaceIcon(item.type)}</div>

                    <div className="item-details">
                      <div className="item-main-name">{item.name}</div>
                      <div className="item-secondary-address">
                        {item.fullAddress || `${item.name}, India`}
                      </div>
                    </div>

                    {item.latitude && item.longitude && (
                      <div className="item-coords-badge">
                        {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;
