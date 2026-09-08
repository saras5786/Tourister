import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { puter } from "@heyputer/puter.js";
import {
  FaMoneyBillWave,
  FaHotel,
  FaTrain,
  FaUtensils,
  FaTicketAlt,
  FaShieldAlt,
  FaLightbulb,
  FaCalculator,
  FaBed,
  FaUsers,
  FaCalendarAlt,
  FaPlane,
  FaBus,
  FaCar,
  FaShoppingBag,
  FaCopy,
  FaCheck,
  FaSyncAlt,
  FaBalanceScale,
  FaChartPie,
  FaCoins,
} from "react-icons/fa";
import "./BudgetEstimator.css";

// Default currency rates with live API synchronization
const INITIAL_CURRENCIES = {
  INR: { symbol: "₹", rate: 1, label: "INR (₹)" },
  USD: { symbol: "$", rate: 0.0118, label: "USD ($)" },
  EUR: { symbol: "€", rate: 0.0108, label: "EUR (€)" },
  GBP: { symbol: "£", rate: 0.0093, label: "GBP (£)" },
  AED: { symbol: "AED", rate: 0.0433, label: "AED" },
  SGD: { symbol: "S$", rate: 0.0157, label: "SGD (S$)" },
};

const HOTEL_TIERS = [
  {
    id: "budget",
    name: "Budget Homestay / Hostel",
    ratePerNight: 950,
    desc: "Clean verified rooms, local homestays & dharamsalas",
    icon: "🏠",
  },
  {
    id: "standard",
    name: "3-Star Comfort Hotel",
    ratePerNight: 2400,
    desc: "AC rooms with breakfast, temple/beach shuttle",
    icon: "🏨",
  },
  {
    id: "luxury",
    name: "4-Star & Heritage Resort",
    ratePerNight: 5800,
    desc: "Luxury suites, swimming pool, gourmet dining & spa",
    icon: "👑",
  },
];

const TRANSPORT_MODES = [
  { id: "train", name: "Express Train (AC 3-Tier)", costPerPerson: 1150, icon: FaTrain },
  { id: "bus", name: "AC Sleeper Bus", costPerPerson: 980, icon: FaBus },
  { id: "flight", name: "Direct Domestic Flight", costPerPerson: 3950, icon: FaPlane },
  { id: "cab", name: "Private Road Cab / Rental", costPerPerson: 2300, icon: FaCar },
];

const FOOD_TIERS = [
  { id: "street", label: "Authentic Local & Street Food", costPerDay: 350, desc: "Traditional messes, tiffin & banana leaf thalis" },
  { id: "casual", label: "Casual Dining & Cafes", costPerDay: 750, desc: "Family AC restaurants & cafe meals" },
  { id: "fine", label: "Fine Dining & Heritage Feasts", costPerDay: 1650, desc: "Multi-course regional feasts & buffet dinners" },
];

function BudgetEstimator({ onBack }) {
  // Primary Travel Inputs
  const [origin, setOrigin] = useState("Hyderabad");
  const [destination, setDestination] = useState("Tirupati");
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [selectedHotel, setSelectedHotel] = useState("standard");
  const [selectedTransport, setSelectedTransport] = useState("train");
  const [foodTier, setFoodTier] = useState("casual");

  // Granular Real-Time Sliders
  const [sightseeingBudget, setSightseeingBudget] = useState(400); // per traveler
  const [shoppingBudget, setShoppingBudget] = useState(600); // per traveler
  const [localAutoDaily, setLocalAutoDaily] = useState(450); // per day

  // Currency & Real-Time Exchange Rate Engine
  const [currency, setCurrency] = useState("INR");
  const [currencyRates, setCurrencyRates] = useState(INITIAL_CURRENCIES);
  const [liveRatesActive, setLiveRatesActive] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(false);

  // Active View Tab ('breakdown' | 'compare' | 'cashflow')
  const [viewMode, setViewMode] = useState("breakdown");

  // AI Savings Advice
  const [savingTips, setSavingTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // 1. Fetch Real-Time Live Exchange Rates
  const refreshLiveRates = async () => {
    setFetchingRates(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/INR", {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setCurrencyRates((prev) => ({
            INR: { ...prev.INR, rate: 1 },
            USD: { ...prev.USD, rate: data.rates.USD || prev.USD.rate },
            EUR: { ...prev.EUR, rate: data.rates.EUR || prev.EUR.rate },
            GBP: { ...prev.GBP, rate: data.rates.GBP || prev.GBP.rate },
            AED: { ...prev.AED, rate: data.rates.AED || prev.AED.rate },
            SGD: { ...prev.SGD, rate: data.rates.SGD || prev.SGD.rate },
          }));
          setLiveRatesActive(true);
        }
      }
    } catch (e) {
      console.warn("Live currency rates offline, using benchmark rates:", e);
    } finally {
      setFetchingRates(false);
    }
  };

  useEffect(() => {
    refreshLiveRates();
  }, []);

  const curr = currencyRates[currency] || currencyRates.INR;
  const hotelObj = HOTEL_TIERS.find((h) => h.id === selectedHotel) || HOTEL_TIERS[1];
  const transportObj = TRANSPORT_MODES.find((t) => t.id === selectedTransport) || TRANSPORT_MODES[0];
  const foodObj = FOOD_TIERS.find((f) => f.id === foodTier) || FOOD_TIERS[1];

  // 2. Real-Time Math Engine
  const roomsCount = Math.ceil(travelers / 2);
  const nightsCount = days > 1 ? days - 1 : 1;
  const hotelTotal = hotelObj.ratePerNight * nightsCount * roomsCount;
  const transportTotal = transportObj.costPerPerson * travelers;
  const foodTotal = foodObj.costPerDay * days * travelers;
  const localTransitTotal = localAutoDaily * days;
  const activitiesTotal = sightseeingBudget * travelers;
  const shoppingTotal = shoppingBudget * travelers;
  const contingencyBuffer = Math.round((hotelTotal + transportTotal + foodTotal) * 0.07);

  const grandTotalINR =
    hotelTotal +
    transportTotal +
    foodTotal +
    localTransitTotal +
    activitiesTotal +
    shoppingTotal +
    contingencyBuffer;

  const grandTotalConverted = Math.round(grandTotalINR * curr.rate);
  const perPersonConverted = Math.round(grandTotalConverted / Math.max(1, travelers));

  // Category Breakdown
  const categories = [
    {
      name: `Stay (${roomsCount} Room${roomsCount > 1 ? "s" : ""}, ${nightsCount} Night${nightsCount > 1 ? "s" : ""})`,
      amount: hotelTotal,
      icon: FaHotel,
      color: "#3b82f6",
      pct: Math.round((hotelTotal / grandTotalINR) * 100),
    },
    {
      name: `Transit (${transportObj.name})`,
      amount: transportTotal,
      icon: transportObj.icon,
      color: "#8b5cf6",
      pct: Math.round((transportTotal / grandTotalINR) * 100),
    },
    {
      name: `Food & Dining (${foodObj.label})`,
      amount: foodTotal,
      icon: FaUtensils,
      color: "#f59e0b",
      pct: Math.round((foodTotal / grandTotalINR) * 100),
    },
    {
      name: "Local Auto & Metro Sightseeing",
      amount: localTransitTotal,
      icon: FaMoneyBillWave,
      color: "#06b6d4",
      pct: Math.round((localTransitTotal / grandTotalINR) * 100),
    },
    {
      name: "Entry Tickets & VIP Darshan",
      amount: activitiesTotal,
      icon: FaTicketAlt,
      color: "#10b981",
      pct: Math.round((activitiesTotal / grandTotalINR) * 100),
    },
    {
      name: "GI Crafts & Souvenir Shopping",
      amount: shoppingTotal,
      icon: FaShoppingBag,
      color: "#ec4899",
      pct: Math.round((shoppingTotal / grandTotalINR) * 100),
    },
    {
      name: "Contingency & Medical Buffer",
      amount: contingencyBuffer,
      icon: FaShieldAlt,
      color: "#64748b",
      pct: Math.round((contingencyBuffer / grandTotalINR) * 100),
    },
  ];

  // 3-Way Side-by-Side Comparison Calculation
  const compareTiers = [
    {
      title: "Backpacker / Shoestring",
      hotel: "Budget Homestay (₹950)",
      transport: "AC Bus / Sleeper Train",
      food: "Local Mess & Street Food (₹350/day)",
      totalINR:
        950 * nightsCount * roomsCount +
        950 * travelers +
        350 * days * travelers +
        300 * days +
        200 * travelers +
        500,
      highlight: "Maximum Savings",
      color: "#10b981",
    },
    {
      title: "Balanced Smart Explorer",
      hotel: "3-Star AC Hotel (₹2,400)",
      transport: "AC 3-Tier Train / Road Cab",
      food: "Casual Dining (₹750/day)",
      totalINR: grandTotalINR,
      highlight: "Recommended Balance",
      color: "#3b82f6",
      isCurrent: true,
    },
    {
      title: "Luxury & Heritage Vacation",
      hotel: "4/5-Star Resort (₹5,800)",
      transport: "Direct Flight",
      food: "Gourmet Buffets (₹1,650/day)",
      totalINR:
        5800 * nightsCount * roomsCount +
        3950 * travelers +
        1650 * days * travelers +
        900 * days +
        800 * travelers +
        2500,
      highlight: "Premium Comfort",
      color: "#8b5cf6",
    },
  ];

  // 1-Click Copy Summary
  const handleCopySummary = () => {
    const text =
      `✈️ TOURISTER TRIP BUDGET ESTIMATE\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 Route: ${origin} ➔ ${destination}\n` +
      `🗓️ Duration: ${days} Days · 👥 Travelers: ${travelers}\n` +
      `🏨 Hotel: ${hotelObj.name} (${roomsCount} Room(s), ${nightsCount} Night(s))\n` +
      `🚆 Transit: ${transportObj.name}\n` +
      `🍲 Food Tier: ${foodObj.label}\n\n` +
      `💰 Total Estimated Cost: ${curr.symbol}${grandTotalConverted.toLocaleString()} ${currency}\n` +
      `👤 Per Person: ${curr.symbol}${perPersonConverted.toLocaleString()} ${currency}\n\n` +
      `📊 Category Breakdown:\n` +
      categories
        .map(
          (c) =>
            `• ${c.name}: ${curr.symbol}${Math.round(c.amount * curr.rate).toLocaleString()} (${c.pct}%)`
        )
        .join("\n") +
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nGenerated in Real Time with Tourister AI`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
  };

  // AI Savings Tip Generator
  const handleGetSavingsTips = async () => {
    setLoadingTips(true);
    try {
      const prompt = `Give 4 ultra-practical, insider money-saving hacks for someone traveling from ${origin} to ${destination} for ${days} days with ${travelers} people choosing ${hotelObj.name} and ${transportObj.name}. Mention local booking hacks, timing tips, meal tricks, and transit avoidance. Use clean bullet points.`;

      const response = await puter.ai.chat([{ role: "user", content: prompt }], {
        model: "openai/gpt-5.6-luna",
        reasoning_effort: "low",
      });

      const reply = response?.message?.content || response?.text;
      setSavingTips(reply);
    } catch (e) {
      setSavingTips(
        `• 🚆 **Transit Hack:** Book Tatkal or Advance quota on Superfast Express trains to skip dynamic surge fares on private road cabs.\n` +
          `• 🏨 **Stay Tip:** Check verified heritage homestays 1.5km outside the central temple or beach cluster for 35% lower room rates with free breakfast.\n` +
          `• 🍲 **Dining Secret:** Enjoy breakfast and lunch at traditional heritage messes serving unlimited banana leaf thalis for ₹120-140/person.\n` +
          `• 🛺 **Local Commute:** Use prepaid station auto booths or fixed-meter rides to avoid tourist highway surcharges.`
      );
    } finally {
      setLoadingTips(false);
    }
  };

  return (
    <main className="budget-page">
      {/* HEADER NAVBAR */}
      <header className="budget-navbar">
        <button className="budget-back-btn" onClick={onBack}>
          ← Dashboard
        </button>

        <div className="budget-nav-title">
          <FaCalculator className="nav-icon" />
          <span>REAL-TIME TRIP BUDGET ESTIMATOR</span>
        </div>

        {/* LIVE MULTI-CURRENCY SWITCHER */}
        <div className="currency-selector-wrapper">
          <div className="currency-selector">
            {Object.keys(currencyRates).map((c) => (
              <button
                key={c}
                className={`currency-btn ${currency === c ? "active" : ""}`}
                onClick={() => setCurrency(c)}
              >
                {currencyRates[c].label}
              </button>
            ))}
          </div>
          <button
            className="refresh-rates-btn"
            onClick={refreshLiveRates}
            title="Update Live Forex Rates"
            disabled={fetchingRates}
          >
            <FaSyncAlt className={fetchingRates ? "spin" : ""} />
            <small>{liveRatesActive ? "Live Rates" : "Standard"}</small>
          </button>
        </div>
      </header>

      <div className="budget-container">
        {/* HERO BANNER */}
        <section className="budget-hero">
          <div className="budget-pill">
            <FaCoins /> REAL-TIME DYNAMIC EXPENSE ENGINE
          </div>
          <h1>
            Estimate Your <span>Trip Expenses Live</span>
          </h1>
          <p>
            Adjust days, number of travelers, hotel tiers, and transport in real time. Costs automatically recalculate instantly with live currency conversion.
          </p>
        </section>

        {/* INTERACTIVE CONTROLS CARD */}
        <div className="budget-inputs-card">
          {/* ORIGIN & DESTINATION */}
          <div className="input-group">
            <label>STARTING CITY (FROM)</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Hyderabad"
            />
          </div>

          <div className="input-group">
            <label>DESTINATION (TO)</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tirupati"
            />
          </div>

          {/* DURATION DAYS STEPPER & SLIDER */}
          <div className="input-group">
            <div className="label-with-val">
              <label><FaCalendarAlt /> DURATION</label>
              <strong>{days} Days ({nightsCount} Night{nightsCount > 1 ? "s" : ""})</strong>
            </div>
            <div className="stepper-slider-combo">
              <div className="number-stepper">
                <button onClick={() => setDays(Math.max(1, days - 1))}>-</button>
                <span>{days} Days</span>
                <button onClick={() => setDays(days + 1)}>+</button>
              </div>
              <input
                type="range"
                min="1"
                max="21"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="budget-slider"
              />
            </div>
          </div>

          {/* TRAVELERS STEPPER & SLIDER */}
          <div className="input-group">
            <div className="label-with-val">
              <label><FaUsers /> TRAVELERS</label>
              <strong>{travelers} People ({roomsCount} Room{roomsCount > 1 ? "s" : ""})</strong>
            </div>
            <div className="stepper-slider-combo">
              <div className="number-stepper">
                <button onClick={() => setTravelers(Math.max(1, travelers - 1))}>-</button>
                <span>{travelers} Person{travelers > 1 ? "s" : ""}</span>
                <button onClick={() => setTravelers(travelers + 1)}>+</button>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="budget-slider"
              />
            </div>
          </div>

          {/* ACCOMMODATION SELECTION */}
          <div className="input-group full-width">
            <label><FaBed /> WHERE DO YOU PREFER TO STAY?</label>
            <div className="hotel-tiers-grid">
              {HOTEL_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  className={`hotel-tier-card ${selectedHotel === tier.id ? "active" : ""}`}
                  onClick={() => setSelectedHotel(tier.id)}
                >
                  <div className="hotel-tier-top">
                    <span className="tier-badge-icon">{tier.icon}</span>
                    <div>
                      <strong>{tier.name}</strong>
                      <span className="tier-price">
                        {curr.symbol}
                        {Math.round(tier.ratePerNight * curr.rate).toLocaleString()}/night
                      </span>
                    </div>
                  </div>
                  <p>{tier.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* TRANSPORT MODE SELECTION */}
          <div className="input-group full-width">
            <label><FaTrain /> HOW WOULD YOU LIKE TO TRAVEL?</label>
            <div className="transport-modes-grid">
              {TRANSPORT_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    className={`transport-mode-btn ${selectedTransport === mode.id ? "active" : ""}`}
                    onClick={() => setSelectedTransport(mode.id)}
                  >
                    <Icon className="trans-btn-icon" />
                    <strong>{mode.name}</strong>
                    <span>
                      ~{curr.symbol}
                      {Math.round(mode.costPerPerson * curr.rate).toLocaleString()}/person
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DINING PREFERENCES */}
          <div className="input-group full-width">
            <label><FaUtensils /> FOOD & DINING PREFERENCE</label>
            <div className="food-tiers-grid">
              {FOOD_TIERS.map((f) => (
                <button
                  key={f.id}
                  className={`food-tier-btn ${foodTier === f.id ? "active" : ""}`}
                  onClick={() => setFoodTier(f.id)}
                >
                  <div className="food-tier-info">
                    <strong>{f.label}</strong>
                    <small>{f.desc}</small>
                  </div>
                  <span className="food-rate">
                    {curr.symbol}
                    {Math.round(f.costPerDay * curr.rate).toLocaleString()}/day
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* GRANULAR SLIDERS (SIGHTSEEING, SHOPPING, LOCAL COMMUTE) */}
          <div className="custom-sliders-row full-width">
            <div className="slider-box">
              <div className="slider-label-row">
                <span><FaTicketAlt /> Entry Tickets & Darshan:</span>
                <strong>{curr.symbol}{Math.round(sightseeingBudget * curr.rate)}/person</strong>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="50"
                value={sightseeingBudget}
                onChange={(e) => setSightseeingBudget(Number(e.target.value))}
              />
            </div>

            <div className="slider-box">
              <div className="slider-label-row">
                <span><FaShoppingBag /> Local Crafts & Souvenirs:</span>
                <strong>{curr.symbol}{Math.round(shoppingBudget * curr.rate)}/person</strong>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={shoppingBudget}
                onChange={(e) => setShoppingBudget(Number(e.target.value))}
              />
            </div>

            <div className="slider-box">
              <div className="slider-label-row">
                <span><FaCar /> Daily Local Auto / Metro:</span>
                <strong>{curr.symbol}{Math.round(localAutoDaily * curr.rate)}/day</strong>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={localAutoDaily}
                onChange={(e) => setLocalAutoDaily(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* VIEW MODE SWITCHER TABS */}
        <div className="view-mode-tabs">
          <button
            className={`view-tab ${viewMode === "breakdown" ? "active" : ""}`}
            onClick={() => setViewMode("breakdown")}
          >
            <FaChartPie /> Cost Breakdown & Meters
          </button>
          <button
            className={`view-tab ${viewMode === "compare" ? "active" : ""}`}
            onClick={() => setViewMode("compare")}
          >
            <FaBalanceScale /> 3-Way Tier Comparison (Budget vs Lux)
          </button>
          <button
            className={`view-tab ${viewMode === "cashflow" ? "active" : ""}`}
            onClick={() => setViewMode("cashflow")}
          >
            <FaCalendarAlt /> Day-by-Day Estimated Cashflow
          </button>
        </div>

        {/* RESULTS OVERVIEW & BREAKDOWN GRID */}
        <div className="budget-results-grid">
          {/* TOTAL ESTIMATED CARD */}
          <motion.div
            className="total-summary-card"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="summary-top-tag">REAL-TIME ESTIMATED QUOTE</div>
            <h2 className="summary-amount">
              {curr.symbol}
              {grandTotalConverted.toLocaleString()}
            </h2>
            <p className="summary-subtext">
              For {travelers} traveler{travelers > 1 ? "s" : ""} · {days} days from {origin} to {destination}
            </p>

            <div className="per-person-badge">
              <span>{curr.symbol}{perPersonConverted.toLocaleString()}</span> per person
            </div>

            <div className="quote-action-buttons">
              <button
                className="action-pill-btn copy"
                onClick={handleCopySummary}
              >
                {copiedSummary ? <><FaCheck /> Copied Quote</> : <><FaCopy /> Copy Full Quote</>}
              </button>

              <button
                className="action-pill-btn advice"
                onClick={handleGetSavingsTips}
                disabled={loadingTips}
              >
                <FaLightbulb /> {loadingTips ? "Finding Hacks..." : "AI Savings Hacks"}
              </button>
            </div>
          </motion.div>

          {/* VIEW 1: CATEGORY METERS */}
          {viewMode === "breakdown" && (
            <div className="category-breakdown-card">
              <div className="breakdown-card-header">
                <h3>Detailed Real-Time Cost Breakdown</h3>
                <span className="live-pill">Live Recalculation</span>
              </div>
              <div className="categories-list">
                {categories.map((cat, idx) => {
                  const Icon = cat.icon;
                  const convertedAmount = Math.round(cat.amount * curr.rate);
                  return (
                    <div key={idx} className="category-item">
                      <div className="category-item-top">
                        <div className="category-name-group">
                          <div
                            className="cat-icon"
                            style={{ background: `${cat.color}18`, color: cat.color }}
                          >
                            <Icon />
                          </div>
                          <strong>{cat.name}</strong>
                        </div>
                        <div className="category-item-val">
                          <span>
                            {curr.symbol}
                            {convertedAmount.toLocaleString()}
                          </span>
                          <small>({cat.pct}%)</small>
                        </div>
                      </div>
                      <div className="meter-track">
                        <motion.div
                          className="meter-fill"
                          style={{ background: cat.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(4, cat.pct))}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.04 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: 3-WAY SIDE-BY-SIDE TIER COMPARISON */}
          {viewMode === "compare" && (
            <div className="comparison-container-card">
              <div className="breakdown-card-header">
                <h3>Side-by-Side Budget Tier Comparison</h3>
                <small>Updates live as you change days or travelers</small>
              </div>
              <div className="comparison-cards-grid">
                {compareTiers.map((tier, idx) => {
                  const convTotal = Math.round(tier.totalINR * curr.rate);
                  const convPerPerson = Math.round(convTotal / travelers);
                  return (
                    <div
                      key={idx}
                      className={`compare-tier-card ${tier.isCurrent ? "active-plan" : ""}`}
                      style={{ borderTop: `4px solid ${tier.color}` }}
                    >
                      <span className="tier-tag" style={{ color: tier.color }}>
                        {tier.highlight}
                      </span>
                      <h4>{tier.title}</h4>

                      <div className="tier-price-row">
                        <strong>
                          {curr.symbol}
                          {convTotal.toLocaleString()}
                        </strong>
                        <small>{curr.symbol}{convPerPerson.toLocaleString()} /person</small>
                      </div>

                      <ul className="tier-features">
                        <li>🏨 {tier.hotel}</li>
                        <li>🚆 {tier.transport}</li>
                        <li>🍲 {tier.food}</li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: DAY-BY-DAY CASHFLOW */}
          {viewMode === "cashflow" && (
            <div className="cashflow-timeline-card">
              <div className="breakdown-card-header">
                <h3>Estimated Day-by-Day Cashflow Plan</h3>
                <small>Anticipated daily expenses for {days} days</small>
              </div>
              <div className="timeline-flow-list">
                {Array.from({ length: days }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  const isFirstDay = dayNum === 1;
                  const isLastDay = dayNum === days;
                  const dayStay = hotelObj.ratePerNight * roomsCount;
                  const dayFood = foodObj.costPerDay * travelers;
                  const daySight = (sightseeingBudget / days) * travelers;
                  const dayTransit = isFirstDay || isLastDay ? (transportTotal / 2) : localAutoDaily;
                  const dayTotalINR = dayStay + dayFood + daySight + dayTransit;

                  return (
                    <div key={dayNum} className="cashflow-step">
                      <div className="day-badge">Day {dayNum}</div>
                      <div className="day-content">
                        <strong>
                          {isFirstDay
                            ? "Departure, Station Transit & Hotel Check-in"
                            : isLastDay
                            ? "Final Sightseeing, Souvenirs & Return Journey"
                            : "Full Day Sightseeing & Regional Cuisine"}
                        </strong>
                        <div className="day-chips">
                          <span>🏨 Stay: {curr.symbol}{Math.round(dayStay * curr.rate)}</span>
                          <span>🍲 Meals: {curr.symbol}{Math.round(dayFood * curr.rate)}</span>
                          <span>🛺 Commute: {curr.symbol}{Math.round(dayTransit * curr.rate)}</span>
                        </div>
                      </div>
                      <div className="day-cost-val">
                        ~{curr.symbol}
                        {Math.round(dayTotalINR * curr.rate).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI SAVINGS HACKS BOX */}
        {savingTips && (
          <motion.div
            className="ai-financial-advice"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="advice-header">
              <FaLightbulb style={{ color: "#f59e0b" }} />
              <h3>Custom Money-Saving Hacks for {origin} ➔ {destination}</h3>
            </div>
            <pre className="advice-content">{savingTips}</pre>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default BudgetEstimator;
