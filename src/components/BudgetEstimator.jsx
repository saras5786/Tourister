import { useState } from "react";
import { motion } from "framer-motion";
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
} from "react-icons/fa";
import "./BudgetEstimator.css";

const CURRENCY_RATES = {
  INR: { symbol: "₹", rate: 1, label: "INR (₹)" },
  USD: { symbol: "$", rate: 0.012, label: "USD ($)" },
  EUR: { symbol: "€", rate: 0.011, label: "EUR (€)" },
};

const HOTEL_TIERS = [
  { id: "budget", name: "Budget Homestay / Guest House", ratePerNight: 900, desc: "Clean & verified rooms near attractions" },
  { id: "standard", name: "3-Star Comfort Hotel", ratePerNight: 2200, desc: "AC rooms with breakfast & temple/beach view" },
  { id: "luxury", name: "4-Star & Heritage Resort", ratePerNight: 5500, desc: "Luxury amenities, pool & fine dining" },
];

const TRANSPORT_MODES = [
  { id: "train", name: "Express Train (AC 3-Tier)", costPerPerson: 1100 },
  { id: "bus", name: "AC Sleeper Bus", costPerPerson: 950 },
  { id: "flight", name: "Direct Flight", costPerPerson: 3800 },
  { id: "cab", name: "Private Road Cab (Roundtrip)", costPerPerson: 2200 },
];

function BudgetEstimator({ onBack }) {
  const [origin, setOrigin] = useState("Hyderabad");
  const [destination, setDestination] = useState("Tirupati");
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [selectedHotel, setSelectedHotel] = useState("standard");
  const [selectedTransport, setSelectedTransport] = useState("train");
  const [currency, setCurrency] = useState("INR");

  const [savingTips, setSavingTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);

  const hotelObj = HOTEL_TIERS.find((h) => h.id === selectedHotel) || HOTEL_TIERS[1];
  const transportObj = TRANSPORT_MODES.find((t) => t.id === selectedTransport) || TRANSPORT_MODES[0];
  const curr = CURRENCY_RATES[currency];

  // Number of hotel rooms needed (1 room for every 2 travelers)
  const roomsCount = Math.ceil(travelers / 2);
  const hotelTotal = hotelObj.ratePerNight * (days > 1 ? days - 1 : 1) * roomsCount;
  const transportTotal = transportObj.costPerPerson * travelers;
  const localAutoTotal = 500 * days;
  const foodTotal = 550 * days * travelers;
  const activitiesTotal = 350 * travelers;
  const bufferTotal = 1000;

  const grandTotalINR = hotelTotal + transportTotal + localAutoTotal + foodTotal + activitiesTotal + bufferTotal;
  const grandTotalConverted = Math.round(grandTotalINR * curr.rate);
  const perPersonConverted = Math.round(grandTotalConverted / travelers);

  const categories = [
    { name: `Hotel (${roomsCount} Room${roomsCount > 1 ? "s" : ""}, ${days - 1 > 0 ? days - 1 : 1} Night${days > 2 ? "s" : ""})`, amount: hotelTotal, icon: FaHotel, color: "#3b82f6", pct: Math.round((hotelTotal / grandTotalINR) * 100) },
    { name: `Travel (${transportObj.name})`, amount: transportTotal, icon: FaTrain, color: "#8b5cf6", pct: Math.round((transportTotal / grandTotalINR) * 100) },
    { name: "Local Autos & Cabs", amount: localAutoTotal, icon: FaMoneyBillWave, color: "#06b6d4", pct: Math.round((localAutoTotal / grandTotalINR) * 100) },
    { name: "Food & Regional Meals", amount: foodTotal, icon: FaUtensils, color: "#f59e0b", pct: Math.round((foodTotal / grandTotalINR) * 100) },
    { name: "Entry Tickets & Darshan", amount: activitiesTotal, icon: FaTicketAlt, color: "#10b981", pct: Math.round((activitiesTotal / grandTotalINR) * 100) },
    { name: "Emergency Buffer", amount: bufferTotal, icon: FaShieldAlt, color: "#ec4899", pct: Math.round((bufferTotal / grandTotalINR) * 100) },
  ];

  const handleGetSavingsTips = async () => {
    setLoadingTips(true);
    try {
      const prompt = `Give 3 simple, practical, friendly money-saving tips for someone traveling from ${origin} to ${destination} for ${days} days with ${travelers} people staying in a ${hotelObj.name}. Mention specific local hacks like booking government buses, meal places, or ticket tricks. Keep it in simple, friendly bullet points.`;
      
      const response = await puter.ai.chat(
        [{ role: "user", content: prompt }],
        { model: "openai/gpt-5.6-luna", reasoning_effort: "low" }
      );

      const reply = response?.message?.content || response?.text;
      setSavingTips(reply);
    } catch (e) {
      console.warn("Savings tip fallback:", e);
      setSavingTips(
        `• 🚆 **Travel Hack:** Book Superfast Express train tickets 2 weeks in advance to secure regular fares and avoid last-minute surge rates.\n` +
        `• 🏨 **Hotel Tip:** Choose verified guest houses or homestays located within 2km of the central temple / beach for easy walking access.\n` +
        `• 🍲 **Dining Hack:** Enjoy authentic morning breakfast and lunch at iconic heritage messes serving unlimited banana leaf thalis for just ₹120-150.`
      );
    } finally {
      setLoadingTips(false);
    }
  };

  return (
    <main className="budget-page">
      {/* HEADER */}
      <header className="budget-navbar">
        <button className="budget-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="budget-nav-title">
          <FaCalculator className="nav-icon" />
          <span>INTERACTIVE TRIP BUDGET CALCULATOR</span>
        </div>
        <div className="currency-selector">
          {Object.keys(CURRENCY_RATES).map((c) => (
            <button
              key={c}
              className={`currency-btn ${currency === c ? "active" : ""}`}
              onClick={() => setCurrency(c)}
            >
              {CURRENCY_RATES[c].label}
            </button>
          ))}
        </div>
      </header>

      <div className="budget-container">
        {/* HERO */}
        <section className="budget-hero">
          <div className="budget-pill">
            <span>REALISTIC EXPENSE PLANNER</span>
          </div>
          <h1>
            Estimate Your <span>Trip Budget</span>
          </h1>
          <p>
            Choose where you're going, which hotel you prefer, how many days you're staying, and how many people are traveling to see your total cost breakdown.
          </p>
        </section>

        {/* CONTROLS CARD */}
        <div className="budget-inputs-card">
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

          <div className="input-group">
            <label>NUMBER OF DAYS</label>
            <div className="number-stepper">
              <button onClick={() => setDays(Math.max(1, days - 1))}>-</button>
              <span>{days} Days</span>
              <button onClick={() => setDays(days + 1)}>+</button>
            </div>
          </div>

          <div className="input-group">
            <label>NUMBER OF PEOPLE</label>
            <div className="number-stepper">
              <button onClick={() => setTravelers(Math.max(1, travelers - 1))}>-</button>
              <span>{travelers} Traveler{travelers > 1 ? "s" : ""}</span>
              <button onClick={() => setTravelers(travelers + 1)}>+</button>
            </div>
          </div>

          {/* HOTEL SELECTION */}
          <div className="input-group full-width">
            <label><FaBed /> WHERE DO YOU WANT TO STAY?</label>
            <div className="hotel-tiers-grid">
              {HOTEL_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  className={`hotel-tier-card ${selectedHotel === tier.id ? "active" : ""}`}
                  onClick={() => setSelectedHotel(tier.id)}
                >
                  <div className="hotel-tier-top">
                    <strong>{tier.name}</strong>
                    <span className="tier-price">₹{tier.ratePerNight}/night</span>
                  </div>
                  <p>{tier.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* TRANSPORT MODE SELECTION */}
          <div className="input-group full-width">
            <label><FaTrain /> HOW DO YOU WANT TO TRAVEL?</label>
            <div className="transport-modes-grid">
              {TRANSPORT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  className={`transport-mode-btn ${selectedTransport === mode.id ? "active" : ""}`}
                  onClick={() => setSelectedTransport(mode.id)}
                >
                  <strong>{mode.name}</strong>
                  <span>~₹{mode.costPerPerson}/person</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS OVERVIEW & BREAKDOWN */}
        <div className="budget-results-grid">
          {/* TOTAL CARD */}
          <motion.div
            className="total-summary-card"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="summary-label">TOTAL ESTIMATED TRIP COST</span>
            <h2 className="summary-amount">
              {curr.symbol}
              {grandTotalConverted.toLocaleString()}
            </h2>
            <p className="summary-subtext">
              For {travelers} traveler{travelers > 1 ? "s" : ""} · {days} days from {origin} to {destination}
            </p>
            <div className="per-person-badge">
              {curr.symbol}
              {perPersonConverted.toLocaleString()} per person
            </div>

            <button
              className="ai-optimize-btn"
              onClick={handleGetSavingsTips}
              disabled={loadingTips}
            >
              <FaLightbulb /> {loadingTips ? "Finding Money-Saving Tips..." : "Get Money-Saving Tips"}
            </button>
          </motion.div>

          {/* CATEGORY METERS */}
          <div className="category-breakdown-card">
            <h3>Detailed Cost Breakdown</h3>
            <div className="categories-list">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                const convertedAmount = Math.round(cat.amount * curr.rate);
                return (
                  <div key={idx} className="category-item">
                    <div className="category-item-top">
                      <div className="category-name-group">
                        <div className="cat-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                          <Icon />
                        </div>
                        <strong>{cat.name}</strong>
                      </div>
                      <div className="category-item-val">
                        <span>{curr.symbol}{convertedAmount.toLocaleString()}</span>
                        <small>({cat.pct}%)</small>
                      </div>
                    </div>
                    <div className="meter-track">
                      <motion.div
                        className="meter-fill"
                        style={{ background: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.pct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SAVINGS TIPS BOX */}
        {savingTips && (
          <motion.div
            className="ai-financial-advice"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="advice-header">
              <FaLightbulb style={{ color: "#f59e0b" }} />
              <h3>Helpful Money-Saving Tips for Your Trip</h3>
            </div>
            <pre className="advice-content">{savingTips}</pre>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default BudgetEstimator;
