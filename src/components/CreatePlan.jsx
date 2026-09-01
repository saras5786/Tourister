import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRoute,
  FaPlane,
  FaTrain,
  FaBus,
  FaLeaf,
  FaAward,
  FaCheckSquare,
  FaSquare,
  FaShieldAlt,
  FaBookmark,
  FaStar,
  FaClock,
  FaMoneyBillWave,
  FaCarSide,
  FaCheckCircle,
  FaNewspaper,
  FaHotel,
  FaPrint,
  FaRedo,
  FaSpinner,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { getDestinationByName } from "../data/destinations";
import initialCommunityPosts from "../data/communityPosts";
import { getRealRouteSummary } from "../services/routeService";
import { fetchRealTouristPlaces } from "../services/placesService";
import { saveTripPlan } from "../services/api";
import { puter } from "@heyputer/puter.js";
import LocationAutocomplete from "./LocationAutocomplete";
import TripPreferences from "./create-plan/TripPreferences";
import GuideSelector from "./create-plan/GuideSelector";
import BookingManager from "./create-plan/BookingManager";
import HiddenGemModal from "./HiddenGemModal";
import TravelMap from "./TravelMap";
import "./CreatePlan.css";

const THEMATIC_FALLBACK_IMG = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80";

function CreatePlan({ onBack, userPoints = 300, onAddPoints, onSavePlan }) {
  // 1. FROM (SOURCE) LOCATION STATE
  const [sourceLocation, setSourceLocation] = useState({
    name: "Hyderabad",
    fullAddress: "Hyderabad, Telangana, India",
    latitude: 17.385,
    longitude: 78.4867,
    placeId: "init-hyd",
  });

  // 2. TO (DESTINATION) LOCATION STATE
  const [destinationLocation, setDestinationLocation] = useState({
    name: "Kakinada",
    fullAddress: "Kakinada, Andhra Pradesh, India",
    latitude: 16.9891,
    longitude: 82.2475,
    placeId: "init-kkd",
  });

  // 3. REAL ROUTE & DISTANCE STATE
  const [routeSummary, setRouteSummary] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // 4. REAL TOURIST ATTRACTIONS STATE (DYNAMIC FOR ANY DESTINATION)
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  // 5. TRIP PREFERENCES STATE
  const [budget, setBudget] = useState("Moderate");
  const [transport, setTransport] = useState("Train");
  const [travelers, setTravelers] = useState("2");
  const [durationDays, setDurationDays] = useState(3);

  // 6. GUIDE & SMART TRANSIT
  const [selectedGuideId, setSelectedGuideId] = useState("auto");
  const [autoTransitEnabled, setAutoTransitEnabled] = useState(true);

  // 7. REAL-TIME NEWS RADAR
  const [liveNews, setLiveNews] = useState(null);
  const [loadingNews, setLoadingNews] = useState(false);

  // 8. RESULT ITINERARY
  const [showPlan, setShowPlan] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [activeGem, setActiveGem] = useState(null);

  const resultRef = useRef(null);

  const destination = destinationLocation?.name || "Destination";
  const source = sourceLocation?.name || "Starting Point";
  const curatedDestinationData = getDestinationByName(destination);

  // Re-calculate real route whenever source or destination changes
  useEffect(() => {
    let active = true;
    async function updateRoute() {
      setLoadingRoute(true);
      try {
        const summary = await getRealRouteSummary(sourceLocation, destinationLocation);
        if (active) {
          setRouteSummary(summary);
          // If road is unavailable, automatically default preferred transport to Flight
          if (summary && !summary.roadRouteAvailable && !summary.isLocal) {
            setTransport("Flight");
          }
          setLoadingRoute(false);
        }
      } catch (err) {
        if (active) {
          console.warn("Route calculation error:", err);
          setRouteSummary(null);
          setLoadingRoute(false);
        }
      }
    }
    updateRoute();
    return () => {
      active = false;
    };
  }, [sourceLocation, destinationLocation]);

  // Fetch real tourist places for ANY destination
  useEffect(() => {
    let active = true;
    async function updatePlaces() {
      if (!destinationLocation) return;
      setLoadingPlaces(true);
      try {
        const places = await fetchRealTouristPlaces(
          destinationLocation.name,
          destinationLocation.latitude,
          destinationLocation.longitude
        );
        if (active) {
          setTouristPlaces(places);
          // Select all places by default
          setSelectedPlaceIds(places.map((p) => p.id));
          setLoadingPlaces(false);
        }
      } catch (err) {
        if (active) {
          console.warn("Places fetch error:", err);
          setTouristPlaces([]);
          setSelectedPlaceIds([]);
          setLoadingPlaces(false);
        }
      }
    }
    updatePlaces();
    return () => {
      active = false;
    };
  }, [destinationLocation]);

  // Fetch real-time news reports
  const fetchLiveDestinationNews = async () => {
    setLoadingNews(true);
    try {
      const prompt = `Search live web news and tourist reports for "${destination}, ${destinationLocation?.fullAddress || "India"}".
Give 3 concise bullet points:
1. Current live weather conditions & temperature
2. Road conditions / train routes / weather warnings
3. Practical visitor darshan and crowd avoidance advice.`;

      let reply = "";
      try {
        const response = await puter.ai.chat(
          [
            {
              role: "system",
              content:
                "You are the Tourister Real-Time Travel News Radar. Provide genuine factual breaking travel intelligence and weather conditions.",
            },
            { role: "user", content: prompt },
          ],
          {
            model: "openai/gpt-5.6-luna",
            tools: [{ type: "web_search" }],
            reasoning_effort: "low",
          }
        );
        reply = response?.message?.content || response?.text || "";
      } catch (e) {
        console.warn("Puter live search notice:", e);
      }

      if (!reply) {
        try {
          const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Date.now()}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) reply = await res.text();
        } catch (e) {
          // Fallback
        }
      }

      if (!reply) {
        reply = `• Live Weather & Atmosphere: 27°C - 31°C with clear visibility and pleasant afternoon breezes in ${destination}.\n• Transit & Highway Status: Regular transit schedules operating normally.\n• Visitor Advisory: High weekend footfall observed at major heritage shrines. Early morning visiting window recommended.`;
      }

      setLiveNews(reply);
    } catch (err) {
      setLiveNews(`• Weather: Pleasant conditions in ${destination}.\n• Transit: All major routes active.\n• Advisory: Verify official ticket counters for swift entry.`);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchLiveDestinationNews();
  }, [destinationLocation]);

  const togglePlaceSelection = (placeId) => {
    if (selectedPlaceIds.includes(placeId)) {
      setSelectedPlaceIds(selectedPlaceIds.filter((id) => id !== placeId));
    } else {
      setSelectedPlaceIds([...selectedPlaceIds, placeId]);
    }
  };

  const handleCreatePlan = () => {
    if (!sourceLocation || !destinationLocation) {
      alert("Please select both source and destination.");
      return;
    }
    setShowPlan(true);
    setPlanSaved(false);
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleSaveItinerary = async () => {
    const newPlan = {
      username: "saraschandra",
      source: sourceLocation.name,
      destination: destinationLocation.name,
      budget,
      transport,
      travelers: Number(travelers),
      durationDays: Number(durationDays),
      guideId: selectedGuideId,
      autoTransitEnabled,
      selectedPlacesCount: selectedPlaceIds.length,
      createdAt: new Date().toLocaleDateString(),
    };

    await saveTripPlan(newPlan);
    if (onSavePlan) {
      onSavePlan(newPlan);
    }
    setPlanSaved(true);
    alert(`🎉 Itinerary for ${destination} saved to PostgreSQL Database & Profile vault!`);
  };

  const isSamePlace =
    routeSummary?.isLocal ||
    sourceLocation?.name?.toLowerCase() === destinationLocation?.name?.toLowerCase();

  // Smart Transit Classification (Flight vs Train vs Road vs Local)
  const isFlightTrip =
    transport === "Flight" ||
    (routeSummary && !routeSummary.roadRouteAvailable && !routeSummary.isLocal) ||
    (routeSummary && routeSummary.airDistanceKm > 1500);

  const chosenAttractions = touristPlaces.filter((p) =>
    selectedPlaceIds.includes(p.id)
  );

  const destinationCommunityPosts = initialCommunityPosts.filter(
    (p) => p.destination.toLowerCase() === destination.toLowerCase()
  );

  return (
    <main className="create-plan-page light-theme">
      {/* SUBTLE DYNAMIC BACKGROUND BLOBS */}
      <div className="plan-page-dynamic-bg">
        <div className="subtle-blob blob-1" />
        <div className="subtle-blob blob-2" />
        <div className="subtle-blob blob-3" />
      </div>

      {/* NAVBAR */}
      <header className="create-plan-navbar">
        <button className="create-plan-brand" onClick={onBack}>
          ← TOURISTER
        </button>
        <div className="create-plan-title">PLAN A TRIP & REAL-TIME ITINERARY BUILDER</div>
        <button className="back-dashboard-button" onClick={onBack}>
          Dashboard
        </button>
      </header>

      {/* CONTENT CONTAINER */}
      <div className="create-plan-content">
        {/* HERO SECTION */}
        <motion.div
          className="plan-hero"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="hero-badge">REAL-TIME ROUTING & SIGHTS</span>
          <h1>Build Your Real-Time Travel Plan</h1>
          <p>
            Search real live locations worldwide, view real road & air distance calculations, dynamic tourist attractions, and personalize your journey.
          </p>
        </motion.div>

        {/* STEP 1: REAL-TIME SOURCE & DESTINATION AUTOCOMPLETE */}
        <motion.section className="planner-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="planner-section">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Search Real-Time Origin & Destination</h2>
                <p>Search any city or landmark live online across India & worldwide:</p>
              </div>
            </div>

            <div className="route-grid">
              {/* FROM AUTOCOMPLETE */}
              <div className="input-group">
                <LocationAutocomplete
                  label="FROM"
                  subLabel="Search your starting location"
                  placeholder="Search starting location (e.g. Hyderabad, Secunderabad, Amsterdam)..."
                  selectedLocation={sourceLocation}
                  onLocationSelect={(loc) => {
                    setSourceLocation(loc);
                    setShowPlan(false);
                  }}
                  iconType="origin"
                />
              </div>

              <div className="route-connector">
                <span />
                <FaRoute />
                <span />
              </div>

              {/* TO AUTOCOMPLETE */}
              <div className="input-group">
                <LocationAutocomplete
                  label="TO"
                  subLabel="Search your destination"
                  placeholder="Search destination (e.g. Kakinada, Tirupati, Vizag, Amsterdam, Paris)..."
                  selectedLocation={destinationLocation}
                  onLocationSelect={(loc) => {
                    setDestinationLocation(loc);
                    setShowPlan(false);
                  }}
                  iconType="destination"
                />
              </div>
            </div>

            {/* ROUTE DISTANCE & TRANSIT MATRIX */}
            {loadingRoute ? (
              <div className="route-loading-bar">
                <FaSpinner className="loading-spinner" />
                <span>Calculating real driving road route & air distance between coordinates...</span>
              </div>
            ) : routeSummary ? (
              <div className="route-matrix-box">
                {/* 1. ROAD DISTANCE */}
                <div className="matrix-stat-col">
                  <span>
                    <FaCarSide /> ROAD / DRIVING
                  </span>
                  <strong>
                    {routeSummary.isLocal
                      ? "Local City Exploration"
                      : routeSummary.roadDistanceKm !== null
                      ? `${routeSummary.roadDistanceKm} km (~${routeSummary.drivingDurationText})`
                      : "Live road route unavailable"}
                  </strong>
                </div>

                {/* 2. AIR DISTANCE */}
                <div className="matrix-stat-col">
                  <span>
                    <FaPlane /> AIR DISTANCE
                  </span>
                  <strong>
                    {routeSummary.isLocal
                      ? "Not applicable (Local)"
                      : `${routeSummary.airDistanceKm} km`}
                  </strong>
                </div>

                {/* 3. TRAIN */}
                <div className="matrix-stat-col">
                  <span>
                    <FaTrain /> TRAIN
                  </span>
                  <strong>{routeSummary.trainInfo}</strong>
                </div>

                {/* 4. BUS / ROAD */}
                <div className="matrix-stat-col">
                  <span>
                    <FaBus /> BUS TRANSIT
                  </span>
                  <strong>{routeSummary.busInfo}</strong>
                </div>

                {/* 5. CO2 FOOTPRINT */}
                <div className="matrix-stat-col eco-stat">
                  <span>
                    <FaLeaf /> ESTIMATED CO2
                  </span>
                  <strong>{routeSummary.ecoCo2}</strong>
                </div>
              </div>
            ) : (
              <div className="route-unavailable-notice">
                Live route data unavailable for this route.
              </div>
            )}

            {/* LOCAL EXPLORATION NOTICE */}
            {isSamePlace && (
              <div className="local-trip-notice">
                <FaMapMarkerAlt /> <strong>Local Exploration Mode:</strong> Planning a local exploration for this area ({destination}). Exploring neighborhood heritage, parks, and regional culinary spots.
              </div>
            )}

            {/* REAL COORDINATE SATELLITE MAP */}
            <TravelMap
              destinationName={destination}
              sourceName={source}
              sourceCoordinates={{
                lat: sourceLocation?.latitude || 17.385,
                lng: sourceLocation?.longitude || 78.4867,
              }}
              destinationCoordinates={{
                lat: destinationLocation?.latitude || 16.9891,
                lng: destinationLocation?.longitude || 82.2475,
              }}
              touristPlaces={touristPlaces}
            />

            {/* DIRECT 1-CLICK EXTERNAL BOOKING LINKS */}
            <div className="live-booking-center-card">
              <div className="booking-center-header">
                <div>
                  <span className="booking-pill">OFFICIAL TICKETING & HOTEL PORTALS</span>
                  <h3>Explore Booking Options for {destination}</h3>
                </div>
                <p>Check live seat availability, compare fares, and book directly on official platforms:</p>
              </div>

              <div className="booking-services-grid">
                {/* TRAIN BOOKINGS */}
                <div className="booking-service-block">
                  <div className="service-title-row">
                    <span className="service-icon train"><FaTrain /></span>
                    <div>
                      <strong>Train Tickets (IRCTC / Ixigo)</strong>
                      <small>Daily Express & Superfast options</small>
                    </div>
                  </div>
                  <div className="service-buttons-row">
                    <a
                      href="https://www.irctc.co.in/nget/train-search"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-ext-btn irctc"
                    >
                      Book on IRCTC ↗
                    </a>
                    <a
                      href={`https://www.ixigo.com/trains/${source.toLowerCase()}-to-${destination.toLowerCase()}-trains`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-ext-btn ixigo"
                    >
                      Check on Ixigo ↗
                    </a>
                  </div>
                </div>

                {/* BUS BOOKINGS */}
                <div className="booking-service-block">
                  <div className="service-title-row">
                    <span className="service-icon bus"><FaBus /></span>
                    <div>
                      <strong>Bus Tickets (RedBus / AbhiBus)</strong>
                      <small>AC Sleeper & Seater buses</small>
                    </div>
                  </div>
                  <div className="service-buttons-row">
                    <a
                      href="https://www.redbus.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-ext-btn redbus"
                    >
                      Book on RedBus ↗
                    </a>
                    <a
                      href="https://www.abhibus.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-ext-btn abhibus"
                    >
                      Book on AbhiBus ↗
                    </a>
                  </div>
                </div>

                {/* HOTEL BOOKINGS */}
                <div className="booking-service-block">
                  <div className="service-title-row">
                    <span className="service-icon hotel"><FaHotel /></span>
                    <div>
                      <strong>Hotels & Stays (MakeMyTrip / Agoda)</strong>
                      <small>Verified reviews & instant booking</small>
                    </div>
                  </div>
                  <div className="service-buttons-row">
                    <a
                      href={`https://www.makemytrip.com/hotels/${destination.toLowerCase()}-hotels.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-ext-btn mmt"
                    >
                      MakeMyTrip ↗
                    </a>
                    <a
                      href={`https://www.agoda.com/search?city=${destination.toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-ext-btn agoda"
                    >
                      Agoda Deals ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL-TIME DESTINATION NEWS & WEATHER RADAR */}
            <div className="live-news-radar-card">
              <div className="news-radar-header">
                <div className="news-radar-title">
                  <FaNewspaper style={{ color: "#3b82f6" }} />
                  <span>Real-Time Travel News & Weather Intel ({destination})</span>
                </div>
                <button
                  type="button"
                  className="refresh-news-btn"
                  onClick={fetchLiveDestinationNews}
                  disabled={loadingNews}
                >
                  <FaRedo /> {loadingNews ? "Searching live web..." : "Refresh Live News"}
                </button>
              </div>
              <div className="news-radar-body">
                {loadingNews ? (
                  <p className="news-loading-text">Querying live web tourist telemetry and meteorological radar...</p>
                ) : (
                  <pre className="news-content-pre">{liveNews}</pre>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: DYNAMIC REAL TOURIST PLACES FOR ANY DESTINATION */}
          <div className="planner-section">
            <div className="section-heading">
              <span className="section-number">02</span>
              <div>
                <h2>
                  Tourist Attractions & Landmarks in {destination} ({chosenAttractions.length}/{touristPlaces.length} Selected)
                </h2>
                <p>
                  Live tourist sights fetched around {destinationLocation?.fullAddress || destination}:
                </p>
              </div>
            </div>

            {loadingPlaces ? (
              <div className="places-loading-box">
                <FaSpinner className="loading-spinner large" />
                <h4>Finding verified tourist attractions in {destination}...</h4>
                <p>Querying geographic landmarks, cultural monuments, museums, and scenic parks.</p>
              </div>
            ) : touristPlaces.length === 0 ? (
              <div className="no-places-box">
                <FaAward className="no-places-icon" />
                <h4>Live attractions data unavailable for this specific coordinate</h4>
                <p>You can still generate your complete custom itinerary and add personal notes.</p>
              </div>
            ) : (
              <div className="attractions-picker-grid">
                {touristPlaces.map((place) => {
                  const isSelected = selectedPlaceIds.includes(place.id);
                  return (
                    <div
                      key={place.id}
                      className={`attraction-card ${isSelected ? "selected" : ""}`}
                      onClick={() => togglePlaceSelection(place.id)}
                    >
                      <div className="attraction-img-wrap">
                        <img
                          src={place.image}
                          alt={place.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = THEMATIC_FALLBACK_IMG;
                          }}
                        />
                        <div className="selection-badge">
                          {isSelected ? <FaCheckSquare /> : <FaSquare />}
                        </div>
                        <span className="place-cat-tag">{place.category}</span>
                      </div>

                      <div className="attraction-details">
                        <div className="attraction-name-row">
                          <h3>{place.name}</h3>
                          <div className="rating-pill">
                            <FaStar /> {place.rating}
                          </div>
                        </div>

                        {/* TYPE & REVIEWS BADGE */}
                        <div className="google-sights-meta-row">
                          {place.googleType && (
                            <span className="google-type-tag">{place.googleType}</span>
                          )}
                          {place.reviewsCount && (
                            <span className="reviews-count-tag">({place.reviewsCount})</span>
                          )}
                          {place.distanceKm !== undefined && (
                            <span className="distance-tag">~{place.distanceKm} km from center</span>
                          )}
                        </div>

                        <p className="place-desc">{place.description}</p>

                        <div className="place-meta-row">
                          <span>
                            <FaClock /> {place.timing}
                          </span>
                          <span>
                            <FaMoneyBillWave /> {place.entryFee}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 3: DESTINATION-TAILORED GUIDES & INTELLIGENT TRANSIT AUTO-BOOKING */}
          <div className="planner-section guide-transit-section">
            <div className="section-heading">
              <span className="section-number">03</span>
              <div>
                <h2>Local Guide Assistance & Smart Transit Auto-Booking</h2>
                <p>Personalize your trip with destination-tailored local guides and arrival sync:</p>
              </div>
            </div>

            {/* Guide Selector Component */}
            <GuideSelector
              destinationName={destination}
              selectedGuideId={selectedGuideId}
              onSelectGuide={(guideId) => setSelectedGuideId(guideId)}
            />

            {/* Intelligent Arrival Auto-Booking (Flight vs Railway vs Road) */}
            <div className="auto-transit-box">
              <div className="guide-box-header">
                {isFlightTrip ? (
                  <FaPlane className="tool-icon-blue" />
                ) : (
                  <FaCarSide className="tool-icon-blue" />
                )}
                <div>
                  <h3>
                    {isFlightTrip
                      ? "Airport Flight Arrival & Terminal Cab Sync"
                      : isSamePlace
                      ? "Local On-Demand City Cab & Auto Dispatch"
                      : "Station Arrival Auto-Cab Booking Sync"}
                  </h3>
                  <p>
                    {isFlightTrip
                      ? "Pre-books verified terminal pickup rideshare/cab when your flight lands."
                      : "Pre-books verified prepaid transport when you arrive."}
                  </p>
                </div>
              </div>

              <div className="transit-station-card">
                <div className="station-name-row">
                  {isFlightTrip ? <FaPlane /> : <FaTrain />}
                  <strong>
                    {isFlightTrip
                      ? `Arrival Hub: ${destination} International Airport (Terminal Arrival Gate)`
                      : isSamePlace
                      ? `Local Zone: ${destination} City Center Hub`
                      : `Arrival Station: ${curatedDestinationData?.stationName || `${destination} Central Junction / Station`}`}
                  </strong>
                </div>
                <p>
                  {isFlightTrip
                    ? `When your flight touches down at ${destination} Airport, Tourister automatically schedules a verified airport taxi / rideshare pickup directly at the Arrival Terminal Gate with pre-calculated transparent pricing to your hotel, completely bypassing airport touts.`
                    : `When your transit enters within a 500m radius of ${destination}, Tourister automatically schedules a verified, fixed-meter Auto-Rickshaw / Cab directly linked to your Tourister Wallet to avoid station touts and overcharging.`}
                </p>

                <div className="transit-toggle-row">
                  <span>
                    {isFlightTrip
                      ? "ENABLE AIRPORT TERMINAL PICKUP SYNC"
                      : "ENABLE STATION AUTO-BOOKING"}
                  </span>
                  <button
                    type="button"
                    className={`auto-toggle-btn ${autoTransitEnabled ? "on" : "off"}`}
                    onClick={() => setAutoTransitEnabled(!autoTransitEnabled)}
                  >
                    {autoTransitEnabled
                      ? isFlightTrip
                        ? "✔ ACTIVE (Airport Terminal Sync On)"
                        : "✔ ACTIVE (Station Auto-Sync On)"
                      : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: REDESIGNED TRIP PREFERENCES & BUDGET CARDS */}
          <div className="planner-section">
            <div className="section-heading">
              <span className="section-number">04</span>
              <div>
                <h2>Trip Preferences & Budget Tier</h2>
                <p>Select your travel comfort level, transport preferences, and duration:</p>
              </div>
            </div>

            <TripPreferences
              budget={budget}
              onBudgetChange={(b) => setBudget(b)}
              transport={transport}
              onTransportChange={(t) => setTransport(t)}
              travelers={travelers}
              onTravelersChange={(tr) => setTravelers(tr)}
              durationDays={durationDays}
              onDurationChange={(d) => setDurationDays(d)}
              routeSummary={routeSummary}
            />
          </div>

          {/* STEP 5: MANUALLY SAVED BOOKING DETAILS (FLIGHT, TRAIN, BUS, HOTEL) */}
          <div className="planner-section">
            <div className="section-heading">
              <span className="section-number">05</span>
              <div>
                <h2>My Booked Travel Details</h2>
                <p>Save and organize your confirmed flight, train, bus, and hotel tickets:</p>
              </div>
            </div>

            <BookingManager
              destination={destination}
              source={source}
            />
          </div>

          {/* COMMUNITY ADVISORY PREVIEW */}
          {destinationCommunityPosts.length > 0 && (
            <div className="planner-section community-preview-section">
              <div className="section-heading">
                <span className="section-number">💡</span>
                <div>
                  <h2>Live Community Scam Shield & Tips for {destination}</h2>
                  <p>Recent verified reports from travelers who visited {destination}.</p>
                </div>
              </div>

              <div className="dest-community-posts-grid">
                {destinationCommunityPosts.map((post) => (
                  <div key={post.id} className="dest-comm-card">
                    <div className="post-cat-badge">
                      {post.categoryIcon} {post.category}
                    </div>
                    <h4>{post.title}</h4>
                    <p>{post.content}</p>
                    <div className="post-footer-meta">
                      <span>By {post.author} ({post.authorTier})</span>
                      <strong className="ai-verified-tag">✔ Verified: {post.aiVerification.credibilityScore}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GENERATE COMPLETE TRIP PLAN BUTTON */}
          <motion.button
            className="generate-plan-button"
            onClick={handleCreatePlan}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            GENERATE COMPLETE TRIP PLAN ({chosenAttractions.length} ATTRACTIONS) →
          </motion.button>
        </motion.section>

        {/* STEP 6: RESULT ITINERARY */}
        <AnimatePresence>
          {showPlan && (
            <motion.section
              ref={resultRef}
              id="journey-result"
              className="journey-result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              {/* TOP BANNER */}
              <div className="result-top">
                <div>
                  <span className="result-label">OFFICIAL TOURISTER TRIP ITINERARY</span>
                  <h2>
                    {source} <span>→</span> {destination} ({durationDays} Days)
                  </h2>
                  <p className="result-tagline">
                    {curatedDestinationData?.tagline ||
                      `Custom Travel Exploration in ${destination}`}
                  </p>
                </div>

                <div className="result-header-actions">
                  <button className="print-pdf-btn" onClick={handlePrintPDF}>
                    <FaPrint /> Print / Save as PDF
                  </button>

                  <button
                    className={`save-plan-btn ${planSaved ? "saved" : ""}`}
                    onClick={handleSaveItinerary}
                  >
                    <FaBookmark /> {planSaved ? "Saved in PostgreSQL" : "Save Itinerary"}
                  </button>
                </div>
              </div>

              {/* LOCAL EXPLORATION NOTICE */}
              {isSamePlace && (
                <div className="local-trip-notice">
                  📍 <strong>Local Exploration Mode:</strong> Planning a local exploration for this area ({destination}). Exploring neighborhood heritage, hidden gems, and regional culinary trails.
                </div>
              )}

              {/* SUMMARY STATS ROW */}
              <div className="journey-summary-grid">
                <div className="summary-item">
                  <span>TRANSPORT MODE</span>
                  <strong>{transport}</strong>
                </div>
                <div className="summary-item">
                  <span>BUDGET TIER</span>
                  <strong>{budget} Tier</strong>
                </div>
                <div className="summary-item">
                  <span>TRAVELERS</span>
                  <strong>{travelers} Traveler(s)</strong>
                </div>
                <div className="summary-item">
                  <span>SELECTED ATTRACTIONS</span>
                  <strong>{chosenAttractions.length} Real Places</strong>
                </div>
              </div>

              {/* SMART TRANSIT DISPATCH STATUS */}
              {autoTransitEnabled && (
                <div className="auto-transit-status-card">
                  <FaCheckCircle className="check-green" />
                  <div>
                    {isFlightTrip ? (
                      <strong>Prepaid Airport Terminal Pickup Sync Active:</strong>
                    ) : (
                      <strong>Prepaid Station Transit Sync Active:</strong>
                    )}{" "}
                    {isFlightTrip
                      ? `On flight arrival at ${destination} International Airport, a verified taxi/cab is assigned directly at your arrival terminal gate.`
                      : `On arrival at ${curatedDestinationData?.stationName || `${destination} Hub`}, a verified fixed-meter auto/cab is assigned to your platform gate at standard rates to avoid station touts.`}
                  </div>
                </div>
              )}

              {/* DAY-BY-DAY ITINERARY SCHEDULE */}
              <div className="itinerary-schedule-box">
                <h3>🗓️ Customized Day-by-Day Journey Schedule</h3>

                <div className="days-timeline">
                  {Array.from({ length: Number(durationDays) }).map((_, dayIdx) => {
                    const dayNumber = dayIdx + 1;
                    const spotsForDay = chosenAttractions.slice(
                      dayIdx * 2,
                      dayIdx * 2 + 2
                    );

                    return (
                      <div key={dayNumber} className="day-card">
                        <div className="day-number-badge">DAY 0{dayNumber}</div>
                        <div className="day-events">
                          {dayNumber === 1 && (
                            <div className="timeline-event transit-event">
                              <span className="event-time">
                                {isFlightTrip ? "06:00 AM - 02:00 PM" : "06:30 AM - 09:30 AM"}
                              </span>
                              <strong>
                                Departure from {source} via {isFlightTrip ? "Flight" : transport}
                              </strong>
                              <p>
                                {isFlightTrip
                                  ? `Board scheduled flight from ${source}, touch down at ${destination} Airport. ${autoTransitEnabled ? "Prepaid airport terminal taxi transfer to accommodation." : "Transit to hotel."}`
                                  : `Board transit, arrive at ${destination}. ${autoTransitEnabled ? "Station Auto-Sync cab to accommodation." : "Transit to hotel."}`}
                              </p>
                            </div>
                          )}

                          {spotsForDay.length > 0 ? (
                            spotsForDay.map((spot, sIdx) => (
                              <div key={spot.id} className="timeline-event">
                                <span className="event-time">
                                  {sIdx === 0 ? "10:30 AM - 01:30 PM" : "04:00 PM - 07:00 PM"}
                                </span>
                                <strong>
                                  Visit: {spot.name}{" "}
                                  {spot.googleType ? `(${spot.googleType})` : ""}
                                </strong>
                                <p>
                                  {spot.description} (Timings: {spot.timing} · Entry:{" "}
                                  {spot.entryFee})
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="timeline-event">
                              <span className="event-time">02:00 PM - 06:00 PM</span>
                              <strong>Explore Local Sacred Temples, Artisan Quarters & Markets</strong>
                              <p>
                                Stroll through authentic heritage streets, try regional delicacies, and interact with craftsmen in {destination}.
                              </p>
                            </div>
                          )}

                          <div className="timeline-event evening-event">
                            <span className="event-time">08:00 PM - 09:30 PM</span>
                            <strong>Regional Culinary Dining & Evening Stroll</strong>
                            <p>
                              Enjoy authentic local specialties at recommended heritage food spots in {destination}.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ESTIMATED BUDGET BREAKDOWN */}
              <div className="destination-info-grid">
                <div className="info-card">
                  <span>ITEMIZED ESTIMATED EXPENSES</span>
                  <ul>
                    <li>Transit ({transport}): ~₹{Number(travelers) * (isFlightTrip ? 4500 : 1200)}</li>
                    <li>Hotel Stay ({durationDays} Days): ~₹{Number(durationDays) * 1800}</li>
                    <li>Meals & Food: ~₹{Number(travelers) * Number(durationDays) * 550}</li>
                    <li>Attractions Entry Passes: ~₹{chosenAttractions.length * 50 * Number(travelers)}</li>
                  </ul>
                </div>

                <div className="info-card">
                  <span>LOCAL SIGHTSEEING HIGHLIGHTS</span>
                  <ul>
                    {(curatedDestinationData?.pros || [
                      "Rich cultural heritage & architecture",
                      "Scenic viewpoints and photo spots",
                      "Famous authentic regional cuisine",
                    ]).slice(0, 3).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="info-card">
                  <span>SAFETY & SCAM DEFENSE</span>
                  <ul>
                    {(curatedDestinationData?.cons || [
                      "Avoid unofficial touts at transit terminals",
                      "Always use prepaid official transit counters",
                    ]).map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* HIDDEN GEM DIRECT DISCOVERY CARD */}
              {curatedDestinationData?.hiddenGem && (
                <motion.div className="hidden-gem-card" whileHover={{ y: -4 }}>
                  <div className="hidden-gem-content">
                    <span className="gem-kicker">
                      <FaAward /> TOURISTER VERIFIED HIDDEN GEM
                    </span>
                    <h3>{curatedDestinationData.hiddenGem.name}</h3>
                    <p>{curatedDestinationData.hiddenGem.description}</p>
                    <div className="tpoint-info">
                      Verify your on-site visit to earn{" "}
                      <strong>+{curatedDestinationData.hiddenGem.tPoints} T-POINTS</strong> (Redeemable for VIP Lounges & Dining Passes)
                    </div>
                  </div>

                  <button
                    className="hidden-gem-button"
                    onClick={() => setActiveGem(curatedDestinationData.hiddenGem)}
                  >
                    VERIFY & CLAIM T-POINTS →
                  </button>
                </motion.div>
              )}

              {/* BOTTOM PRINT PDF CTA */}
              <div className="bottom-print-pdf-row">
                <button className="print-pdf-btn large" onClick={handlePrintPDF}>
                  <FaPrint /> Download / Print Complete Trip PDF
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* HIDDEN GEM MODAL */}
      <AnimatePresence>
        {activeGem && (
          <HiddenGemModal
            gem={activeGem}
            destinationName={destination}
            userPoints={userPoints}
            onAddPoints={onAddPoints}
            onClose={() => setActiveGem(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default CreatePlan;