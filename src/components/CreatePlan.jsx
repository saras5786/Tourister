import { useState } from "react";
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
  FaCalendarAlt,
  FaUsers,
  FaBookmark,
  FaStar,
  FaClock,
  FaMoneyBillWave,
  FaCarSide,
  FaLanguage,
  FaCheckCircle,
} from "react-icons/fa";
import destinationsList, { sourceCities, getDestinationByName, getRouteInfo } from "../data/destinations";
import initialCommunityPosts from "../data/communityPosts";
import HiddenGemModal from "./HiddenGemModal";
import TravelMap from "./TravelMap";
import "./CreatePlan.css";

function CreatePlan({ onBack, userPoints = 300, onAddPoints, onSavePlan }) {
  const [source, setSource] = useState("Hyderabad");
  const [destination, setDestination] = useState("Tirupati");
  const [budget, setBudget] = useState("Moderate (₹₹)");
  const [transport, setTransport] = useState("Train");
  const [travelers, setTravelers] = useState("2");
  const [durationDays, setDurationDays] = useState("3");
  
  // Mother tongue & guide selection
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedGuideId, setSelectedGuideId] = useState("auto-match");
  
  // Smart Station Auto-Booking feature
  const [autoTransitEnabled, setAutoTransitEnabled] = useState(true);

  // Selected places within 200km radius
  const [selectedPlaces, setSelectedPlaces] = useState(() => {
    const initialData = getDestinationByName("Tirupati");
    return initialData?.touristPlaces ? initialData.touristPlaces.map((p) => p.id) : [];
  });

  const [showPlan, setShowPlan] = useState(false);
  const [activeGem, setActiveGem] = useState(null);
  const [planSaved, setPlanSaved] = useState(false);

  const destinationData = getDestinationByName(destination);
  const routeInfo = getRouteInfo(source, destination);

  // Destination-specific community posts
  const destinationCommunityPosts = initialCommunityPosts.filter(
    (post) => post.destination.toLowerCase() === destination.toLowerCase()
  );

  const handleDestinationChange = (newDest) => {
    setDestination(newDest);
    const data = getDestinationByName(newDest);
    if (data && data.touristPlaces) {
      setSelectedPlaces(data.touristPlaces.map((p) => p.id));
    } else {
      setSelectedPlaces([]);
    }
    setShowPlan(false);
    setPlanSaved(false);
  };

  const togglePlaceSelection = (placeId) => {
    if (selectedPlaces.includes(placeId)) {
      if (selectedPlaces.length === 1) {
        alert("Please keep at least 1 attraction selected for your itinerary.");
        return;
      }
      setSelectedPlaces(selectedPlaces.filter((id) => id !== placeId));
    } else {
      setSelectedPlaces([...selectedPlaces, placeId]);
    }
  };

  const handleCreatePlan = () => {
    if (!source || !destination) {
      alert("Please select both source and destination.");
      return;
    }
    setShowPlan(true);
    setPlanSaved(false);
  };

  const handleSaveItinerary = () => {
    const newPlan = {
      source,
      destination,
      budget,
      transport,
      travelers,
      durationDays,
      guide: selectedGuideId,
      autoTransit: autoTransitEnabled,
      selectedPlacesCount: selectedPlaces.length,
      createdAt: new Date().toLocaleDateString(),
    };
    if (onSavePlan) {
      onSavePlan(newPlan);
    }
    setPlanSaved(true);
    alert(`🎉 Itinerary for ${destination} saved to your Profile vault!`);
  };

  const isSamePlace = source === destination;

  // Filtered guides by mother tongue
  const availableGuides = (destinationData?.guides || []).filter((g) => {
    if (selectedLanguage === "All") return true;
    return g.motherTongue === selectedLanguage || g.languages.includes(selectedLanguage);
  });

  // Generate simulated AI Day Schedule from selected attractions
  const chosenAttractions = destinationData?.touristPlaces.filter((p) =>
    selectedPlaces.includes(p.id)
  ) || [];

  return (
    <main className="create-plan-page light-theme">
      {/* NAVBAR */}
      <header className="create-plan-navbar">
        <button className="create-plan-brand" onClick={onBack}>
          ← TOURISTER
        </button>
        <div className="create-plan-title">PLAN A TRIP & SMART ITINERARY BUILDER</div>
        <button className="back-dashboard-button" onClick={onBack}>
          Dashboard
        </button>
      </header>

      {/* CONTENT */}
      <div className="create-plan-content">
        {/* HERO */}
        <motion.div
          className="plan-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="plan-eyebrow">SMART TOURISM JOURNEY PLANNER</div>
          <h1>
            Design Your Perfect Journey, <span>Intelligently.</span>
          </h1>
          <p>
            Select your origin & destination to calculate distances and CO2 emissions, pick sacred temples and heritage spots within a 200km radius, select a guide in your mother tongue, and sync automatic station transit!
          </p>
        </motion.div>

        {/* STEP 1: ROUTE & DISTANCE MATRIX */}
        <motion.section
          className="planner-card"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* 01: ROUTE */}
          <div className="planner-section">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Select Origin & Destination</h2>
                <p>Choose your starting city and where you want to travel.</p>
              </div>
            </div>

            <div className="route-grid">
              <div className="input-group">
                <label>ORIGIN (SOURCE CITY)</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  {sourceCities.map((city) => (
                    <option key={city} value={city.split(" (")[0]}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="route-connector">
                <span />
                <FaRoute />
                <span />
              </div>

              <div className="input-group">
                <label>DESTINATION (TEMPLES & HERITAGE)</label>
                <select
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                >
                  {destinationsList.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.state}) - {d.tagline}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROUTE DISTANCE & TRANSIT MATRIX DISPLAY */}
            {routeInfo && (
              <div className="route-matrix-box">
                <div className="matrix-stat-col">
                  <span>DISTANCE</span>
                  <strong>{routeInfo.distance === 0 ? "Local City Trip" : `${routeInfo.distance} km`}</strong>
                </div>

                <div className="matrix-stat-col">
                  <span>
                    <FaPlane /> FLIGHT
                  </span>
                  <strong>{routeInfo.flight}</strong>
                </div>

                <div className="matrix-stat-col">
                  <span>
                    <FaTrain /> TRAIN
                  </span>
                  <strong>{routeInfo.train}</strong>
                </div>

                <div className="matrix-stat-col">
                  <span>
                    <FaBus /> BUS / ROAD
                  </span>
                  <strong>{routeInfo.bus}</strong>
                </div>

                <div className="matrix-stat-col eco-stat">
                  <span>
                    <FaLeaf /> ESTIMATED CO2
                  </span>
                  <strong>{routeInfo.eco}</strong>
                </div>
              </div>
            )}

            {/* PREBUILT GOOGLE / SATELLITE MAP EMBED */}
            {destinationData && (
              <TravelMap
                destinationName={destination}
                coordinates={destinationData.coordinates}
                touristPlaces={destinationData.touristPlaces}
                source={source}
              />
            )}

            {/* DESTINATION LOCAL FARE CHART & ANTI-RIPOFF GUIDE */}
            {destinationData?.localFareChart && (
              <div className="local-fare-chart-box">
                <div className="fare-chart-header">
                  <div className="fare-header-icon">
                    <FaCarSide />
                  </div>
                  <div className="fare-header-titles">
                    <h3>Official Local Transit Fare Chart & Anti-Ripoff Guide ({destination})</h3>
                    <p>Standard regulated rates for autos, taxis, and public transit to protect tourists from overcharging.</p>
                  </div>
                  <div className="currency-pill">
                    Currency: <strong>{destinationData.localFareChart.currency}</strong>
                  </div>
                </div>

                {/* STANDARD RATES MATRIX */}
                <div className="fare-rates-grid">
                  <div className="fare-rate-card">
                    <span className="rate-title">🛺 Auto-Rickshaw Base</span>
                    <strong className="rate-val">{destinationData.localFareChart.baseAutoRate}</strong>
                    <span className="rate-sub">Standard Metered / Fixed Base</span>
                  </div>

                  <div className="fare-rate-card">
                    <span className="rate-title">🚕 AC / Non-AC Cab Base</span>
                    <strong className="rate-val">{destinationData.localFareChart.baseCabRate}</strong>
                    <span className="rate-sub">City Taxi / App Rides</span>
                  </div>

                  <div className="fare-rate-card">
                    <span className="rate-title">🚌 Shared Public Transit</span>
                    <strong className="rate-val">{destinationData.localFareChart.sharedTransit}</strong>
                    <span className="rate-sub">City Bus / E-Rickshaw</span>
                  </div>

                  <div className="fare-rate-card">
                    <span className="rate-title">⭐ Full-Day Sightseeing</span>
                    <strong className="rate-val">{destinationData.localFareChart.fullDaySightseeing}</strong>
                    <span className="rate-sub">8 Hours / 80 Km Package</span>
                  </div>
                </div>

                {/* ROUTE BENCHMARKS TABLE */}
                {destinationData.localFareChart.keyRoutes && (
                  <div className="fare-routes-table-wrap">
                    <h4>📍 Standard Route Price Benchmarks from Railway Stations & Airports</h4>
                    <div className="fare-table-scroll">
                      <table className="fare-routes-table">
                        <thead>
                          <tr>
                            <th>From (Hub / Station)</th>
                            <th>To (Attraction / Temple)</th>
                            <th>Fair Auto Fare</th>
                            <th>Fair Cab Fare</th>
                            <th>Overcharging Alert</th>
                          </tr>
                        </thead>
                        <tbody>
                          {destinationData.localFareChart.keyRoutes.map((route, rIdx) => (
                            <tr key={rIdx}>
                              <td><strong>{route.from}</strong></td>
                              <td>{route.to}</td>
                              <td className="auto-cell">🛺 {route.autoFare}</td>
                              <td className="cab-cell">🚕 {route.cabFare}</td>
                              <td className="ripoff-cell">⚠️ {route.toutRipoffAlert}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ANTI-RIPOFF ADVISORY */}
                <div className="fare-ripoff-tip">
                  <FaShieldAlt className="shield-tip-icon" />
                  <div>
                    <strong>Anti-Overcharging Protection Rule:</strong>
                    <span> {destinationData.localFareChart.antiRipoffTip}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 02: 200KM RADIUS ATTRACTION PICKER */}
          {destinationData && destinationData.touristPlaces && (
            <div className="planner-section">
              <div className="section-heading">
                <span className="section-number">02</span>
                <div>
                  <h2>
                    Temples & Tourist Attractions within 200km of {destination} ({chosenAttractions.length}/{destinationData.touristPlaces.length} Selected)
                  </h2>
                  <p>
                    Select the places you want to include in your customized Tourister AI itinerary.
                  </p>
                </div>
              </div>

              <div className="attractions-picker-grid">
                {destinationData.touristPlaces.map((place) => {
                  const isSelected = selectedPlaces.includes(place.id);
                  return (
                    <div
                      key={place.id}
                      className={`attraction-card ${isSelected ? "selected" : ""}`}
                      onClick={() => togglePlaceSelection(place.id)}
                    >
                      <div className="attraction-img-wrap">
                        <img src={place.image} alt={place.name} />
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

                        <p className="place-desc">{place.description}</p>

                        {/* LIVE CROWD METER */}
                        <div className="crowd-meter-box">
                          <div className="crowd-label-row">
                            <span className={`crowd-badge ${place.crowdPercent > 75 ? "rush" : place.crowdPercent > 50 ? "mod" : "peace"}`}>
                              👥 {place.crowdLevel || "Moderate Rush"} ({place.crowdPercent || 60}%)
                            </span>
                            <span className="crowd-time-hint">Best: {place.bestTimeToVisit || "Early Morning"}</span>
                          </div>
                          <div className="crowd-track">
                            <div
                              className={`crowd-bar-fill ${place.crowdPercent > 75 ? "rush" : place.crowdPercent > 50 ? "mod" : "peace"}`}
                              style={{ width: `${place.crowdPercent || 60}%` }}
                            />
                          </div>
                        </div>

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
            </div>
          )}

          {/* 03: MOTHER TONGUE GUIDE SELECTION & STATION AUTO-BOOKING */}
          <div className="planner-section">
            <div className="section-heading">
              <span className="section-number">03</span>
              <div>
                <h2>Local Guide in Mother Tongue & Smart Station Auto-Booking</h2>
                <p>Select certified local guides who speak your native language and enable auto-cab booking on arrival.</p>
              </div>
            </div>

            <div className="custom-tools-grid">
              {/* Mother Tongue Guide Selector */}
              <div className="guide-selector-box">
                <div className="guide-box-header">
                  <FaLanguage className="tool-icon-purple" />
                  <div>
                    <h3>Select Tour Guide by Mother Tongue</h3>
                    <p>Communicate comfortably in your native regional language.</p>
                  </div>
                </div>

                <div className="lang-filter-chips">
                  {["All", "Telugu", "Tamil", "Hindi", "Bengali", "Malayalam", "Gujarati", "English"].map((lang) => (
                    <button
                      type="button"
                      key={lang}
                      className={`lang-chip ${selectedLanguage === lang ? "active" : ""}`}
                      onClick={() => setSelectedLanguage(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div className="guides-list">
                  <label className="guide-radio-item">
                    <input
                      type="radio"
                      name="guide-choice"
                      value="auto-match"
                      checked={selectedGuideId === "auto-match"}
                      onChange={() => setSelectedGuideId("auto-match")}
                    />
                    <div className="guide-info-text">
                      <strong>✨ Auto-Match Best Verified Guide ({destination})</strong>
                      <span>Tourister AI matches the highest-rated heritage guide automatically</span>
                    </div>
                  </label>

                  {availableGuides.map((g) => (
                    <label key={g.id} className="guide-radio-item">
                      <input
                        type="radio"
                        name="guide-choice"
                        value={g.id}
                        checked={selectedGuideId === g.id}
                        onChange={() => setSelectedGuideId(g.id)}
                      />
                      <div className="guide-info-text">
                        <strong>
                          {g.name} <span className="guide-native-tag">Native: {g.motherTongue}</span>
                        </strong>
                        <span>{g.specialization} · Speaks: {g.languages.join(", ")} · ★ {g.rating} ({g.fee})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Station Auto-Transit Sync */}
              <div className="auto-transit-box">
                <div className="guide-box-header">
                  <FaCarSide className="tool-icon-blue" />
                  <div>
                    <h3>Smart Station Arrival Auto-Cab Booking</h3>
                    <p>Pre-books verified prepaid transport when you reach the station.</p>
                  </div>
                </div>

                <div className="transit-station-card">
                  <div className="station-name-row">
                    <FaTrain />
                    <strong>Arrival Hub: {destinationData?.stationName || `${destination} Junction`}</strong>
                  </div>
                  <p>
                    When your GPS enters within a 500m radius of {destinationData?.stationName}, Tourister automatically schedules a verified, fixed-meter Auto-Rickshaw / Cab directly linked to your Tourister Wallet to avoid station touts and overcharging.
                  </p>

                  <div className="transit-toggle-row">
                    <span>ENABLE STATION AUTO-BOOKING</span>
                    <button
                      type="button"
                      className={`auto-toggle-btn ${autoTransitEnabled ? "on" : "off"}`}
                      onClick={() => setAutoTransitEnabled(!autoTransitEnabled)}
                    >
                      {autoTransitEnabled ? "✔ ACTIVE (Auto-Sync On)" : "OFF"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 04: TRAVEL PREFERENCES */}
          <div className="planner-section">
            <div className="section-heading">
              <span className="section-number">04</span>
              <div>
                <h2>Trip Duration & Budget Configuration</h2>
                <p>Set your travel dates, party size, and comfort tier.</p>
              </div>
            </div>

            <div className="preferences-grid">
              <div className="input-group">
                <label>
                  <FaMoneyBillWave /> BUDGET TYPE
                </label>
                <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="Budget Friendly (₹)">Budget Friendly (₹ - ₹2,500/day)</option>
                  <option value="Moderate (₹₹)">Moderate (₹₹ - ₹5,000/day)</option>
                  <option value="Premium Luxury (₹₹₹)">Premium Luxury (₹₹₹ - ₹10,000+/day)</option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  <FaTrain /> MODE OF TRANSPORT
                </label>
                <select value={transport} onChange={(e) => setTransport(e.target.value)}>
                  <option value="Train">Express Superfast Train (Eco-Friendly)</option>
                  <option value="Flight">Commercial Flight</option>
                  <option value="Bus">AC Sleeper Bus</option>
                  <option value="Car">Private Chauffeur Cab</option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  <FaUsers /> NUMBER OF TRAVELERS
                </label>
                <select value={travelers} onChange={(e) => setTravelers(e.target.value)}>
                  <option value="1">1 Solo Traveler</option>
                  <option value="2">2 Travelers (Couple/Friends)</option>
                  <option value="3">3 Travelers</option>
                  <option value="4">4 Travelers (Family)</option>
                  <option value="5+">5+ Group Travelers</option>
                </select>
              </div>

              <div className="input-group">
                <label>
                  <FaCalendarAlt /> TRIP DURATION
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                >
                  <option value="1">1 Day Express Pilgrimage / Tour</option>
                  <option value="2">2 Days (Weekend Getaway)</option>
                  <option value="3">3 Days (Comprehensive)</option>
                  <option value="4">4 Days Extended</option>
                  <option value="5">5 Days Full Exploration</option>
                </select>
              </div>
            </div>
          </div>

          {/* DESTINATION COMMUNITY ADVISORY PREVIEW */}
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
                      <strong className="ai-verified-tag">✔ AI Credibility: {post.aiVerification.credibilityScore}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GENERATE PLAN BUTTON */}
          <motion.button
            className="generate-plan-button"
            onClick={handleCreatePlan}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            GENERATE AI TRIP ITINERARY ({chosenAttractions.length} PLACES) →
          </motion.button>
        </motion.section>

        {/* STEP 5: RESULT ITINERARY */}
        <AnimatePresence>
          {showPlan && destinationData && (
            <motion.section
              className="journey-result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              {/* TOP BANNER */}
              <div className="result-top">
                <div>
                  <span className="result-label">SIMULATED CUSTOM TOURISTER ITINERARY</span>
                  <h2>
                    {source} <span>→</span> {destination} ({durationDays} Days)
                  </h2>
                  <p className="result-tagline">{destinationData.tagline}</p>
                </div>

                <div className="result-header-actions">
                  <div className="journey-status">PLAN GENERATED</div>
                  <button
                    className={`save-plan-btn ${planSaved ? "saved" : ""}`}
                    onClick={handleSaveItinerary}
                  >
                    <FaBookmark /> {planSaved ? "Saved in Vault" : "Save Itinerary"}
                  </button>
                </div>
              </div>

              {/* LOCAL TRIP NOTICE IF SAME PLACE */}
              {isSamePlace && (
                <div className="local-trip-notice">
                  📍 <strong>Local City Exploration Mode:</strong> Since your starting city and destination are the same ({destination}), Tourister focuses on local neighborhood heritage, hidden gems, and regional culinary trails.
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
                  <strong>{budget}</strong>
                </div>
                <div className="summary-item">
                  <span>TRAVELERS</span>
                  <strong>{travelers} Traveler(s)</strong>
                </div>
                <div className="summary-item">
                  <span>SELECTED SPOTS</span>
                  <strong>{chosenAttractions.length} Attractions</strong>
                </div>
              </div>

              {/* SMART TRANSIT DISPATCH STATUS */}
              {autoTransitEnabled && (
                <div className="auto-transit-status-card">
                  <FaCheckCircle className="check-green" />
                  <div>
                    <strong>Auto-Transit Synchronized:</strong> On arrival at {destinationData.stationName}, a prepaid local auto/cab will be automatically dispatched to your platform gate at fixed government meter rates.
                  </div>
                </div>
              )}

              {/* ACTIVE ADVISORY / WARNING */}
              {destinationData.warning && destinationData.warning.active && (
                <div className="travel-alert">
                  <div className="alert-title">
                    <FaShieldAlt /> {destinationData.warning.type}
                  </div>
                  <p>{destinationData.warning.message}</p>
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
                              <span className="event-time">06:30 AM - 09:30 AM</span>
                              <strong>Departure from {source} via {transport}</strong>
                              <p>Board transit, arrive at {destinationData.stationName}. {autoTransitEnabled ? "Auto-Transit cab booked to hotel." : "Transit to hotel."}</p>
                            </div>
                          )}

                          {spotsForDay.length > 0 ? (
                            spotsForDay.map((spot, sIdx) => (
                              <div key={spot.id} className="timeline-event">
                                <span className="event-time">
                                  {sIdx === 0 ? "10:30 AM - 01:30 PM" : "04:00 PM - 07:00 PM"}
                                </span>
                                <strong>Visit: {spot.name}</strong>
                                <p>{spot.description} ({spot.timing}) - {spot.entryFee}</p>
                              </div>
                            ))
                          ) : (
                            <div className="timeline-event">
                              <span className="event-time">02:00 PM - 06:00 PM</span>
                              <strong>Explore Local Sacred Temples, Artisan Quarters & Markets</strong>
                              <p>Stroll through authentic heritage streets, try regional delicacies, and interact with craftsmen.</p>
                            </div>
                          )}

                          <div className="timeline-event evening-event">
                            <span className="event-time">08:00 PM - 09:30 PM</span>
                            <strong>Regional Culinary Dining & Evening Aarti</strong>
                            <p>Enjoy authentic local specialties at recommended heritage food spots in {destination}.</p>
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
                  <span>BUDGET ESTIMATE BREAKDOWN</span>
                  <ul>
                    <li>Transport ({transport}): ~₹{Number(travelers) * 1200}</li>
                    <li>Stays & Lodging: ~₹{Number(durationDays) * 1800}</li>
                    <li>Food & Regional Dining: ~₹{Number(travelers) * Number(durationDays) * 750}</li>
                    <li>Attractions Entry Fees: ~₹{chosenAttractions.length * 80 * Number(travelers)}</li>
                  </ul>
                </div>

                <div className="info-card">
                  <span>LOCAL TOURIST TIPS</span>
                  <ul>
                    {destinationData.pros.slice(0, 3).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="info-card">
                  <span>SAFETY & SCAM DEFENSE</span>
                  <ul>
                    {destinationData.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* HIDDEN GEM DIRECT DISCOVERY CARD */}
              {destinationData.hiddenGem && (
                <motion.div className="hidden-gem-card" whileHover={{ y: -4 }}>
                  <div className="hidden-gem-content">
                    <span className="gem-kicker">
                      <FaAward /> TOURISTER VERIFIED HIDDEN GEM
                    </span>
                    <h3>{destinationData.hiddenGem.name}</h3>
                    <p>{destinationData.hiddenGem.description}</p>
                    <div className="tpoint-info">
                      Verify your on-site visit to earn{" "}
                      <strong>+{destinationData.hiddenGem.tPoints} T-POINTS</strong> (Redeemable for VIP Lounges & Artisan Discounts)
                    </div>
                  </div>

                  <button
                    className="hidden-gem-button"
                    onClick={() => setActiveGem(destinationData.hiddenGem)}
                  >
                    VERIFY & CLAIM T-POINTS →
                  </button>
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* HIDDEN GEM ANTI-FAKE QR MODAL */}
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