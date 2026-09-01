import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaPlane,
  FaTrain,
  FaBus,
  FaCarSide,
  FaUser,
  FaUserFriends,
  FaUsers,
  FaCalendarAlt,
  FaCrown,
  FaMagic,
  FaWallet,
} from "react-icons/fa";
import "./TripPreferences.css";

const BUDGET_OPTIONS = [
  {
    id: "Budget",
    title: "Budget",
    icon: FaWallet,
    desc: "Comfortable homestays + affordable local transit",
    color: "#10b981",
    tag: "Saver",
  },
  {
    id: "Moderate",
    title: "Moderate",
    icon: FaMagic,
    desc: "3-star comfortable stays + AC cabs & express trains",
    color: "#3b82f6",
    tag: "Popular",
  },
  {
    id: "Premium",
    title: "Premium",
    icon: FaCrown,
    desc: "Luxury heritage resorts + chauffeur driven transit",
    color: "#8b5cf6",
    tag: "Luxury",
  },
];

const TRANSPORT_MODES = [
  {
    id: "Flight",
    title: "Flight",
    icon: FaPlane,
    color: "#6366f1",
  },
  {
    id: "Train",
    title: "Train",
    icon: FaTrain,
    color: "#3b82f6",
  },
  {
    id: "Bus",
    title: "Bus",
    icon: FaBus,
    color: "#ec4899",
  },
  {
    id: "Car / Road",
    title: "Road / Car",
    icon: FaCarSide,
    color: "#f59e0b",
  },
];

const TRAVELER_OPTIONS = [
  { id: "1", label: "1 Solo", icon: FaUser },
  { id: "2", label: "2 Couple / Friends", icon: FaUserFriends },
  { id: "4", label: "3-4 Small Group", icon: FaUsers },
  { id: "6", label: "5+ Group", icon: FaUsers },
];

const DURATION_OPTIONS = [
  { id: "1", label: "1 Day" },
  { id: "2", label: "2 Days" },
  { id: "3", label: "3 Days" },
  { id: "5", label: "4-5 Days" },
  { id: "7", label: "1 Week" },
  { id: "custom", label: "Custom" },
];

function TripPreferences({
  budget,
  onBudgetChange,
  transport,
  onTransportChange,
  travelers,
  onTravelersChange,
  durationDays,
  onDurationChange,
  routeSummary,
}) {
  const [isCustomDuration, setIsCustomDuration] = useState(
    !["1", "2", "3", "5", "7"].includes(String(durationDays))
  );
  const [customDaysInput, setCustomDaysInput] = useState(
    ["1", "2", "3", "5", "7"].includes(String(durationDays)) ? "4" : String(durationDays)
  );

  const handleDurationClick = (optId) => {
    if (optId === "custom") {
      setIsCustomDuration(true);
      onDurationChange(Number(customDaysInput) || 4);
    } else {
      setIsCustomDuration(false);
      onDurationChange(Number(optId));
    }
  };

  const handleCustomDaysChange = (val) => {
    const num = Math.max(1, Math.min(30, Number(val) || 1));
    setCustomDaysInput(String(num));
    onDurationChange(num);
  };

  // One-line live route estimates for transport cards
  const getTransportSubtitle = (transId) => {
    if (!routeSummary) return "Live estimate pending";
    if (transId === "Flight") {
      return routeSummary.isLocal ? "Not needed for local exploration" : routeSummary.flightInfo;
    }
    if (transId === "Train") {
      return routeSummary.trainInfo;
    }
    if (transId === "Bus") {
      return routeSummary.busInfo;
    }
    if (transId === "Car / Road") {
      return routeSummary.roadDistanceKm
        ? `${routeSummary.roadDistanceKm} km (${routeSummary.drivingDurationText})`
        : "Live road route unavailable";
    }
    return "";
  };

  return (
    <div className="trip-preferences-container">
      {/* 1. BUDGET TYPE CARDS */}
      <div className="pref-sub-section">
        <label className="pref-section-title">
          <FaMoneyBillWave className="pref-icon green" />
          <span>BUDGET TIER</span>
        </label>

        <div className="budget-cards-grid">
          {BUDGET_OPTIONS.map((b) => {
            const isSelected = budget.toLowerCase().includes(b.title.toLowerCase());
            const Icon = b.icon;

            return (
              <motion.button
                key={b.id}
                type="button"
                className={`budget-option-card ${isSelected ? "selected" : ""}`}
                style={{ "--budget-color": b.color }}
                onClick={() => onBudgetChange(b.title)}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="budget-card-header">
                  <div className="budget-icon-wrap">
                    <Icon />
                  </div>
                  <span className="budget-tag">{b.tag}</span>
                </div>

                <h4 className="budget-title">{b.title}</h4>
                <p className="budget-desc">{b.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. MODE OF TRANSPORT CARDS */}
      <div className="pref-sub-section">
        <label className="pref-section-title">
          <FaPlane className="pref-icon blue" />
          <span>PREFERRED TRANSPORT MODE</span>
        </label>

        <div className="transport-cards-grid">
          {TRANSPORT_MODES.map((t) => {
            const isSelected = transport.toLowerCase().includes(t.id.toLowerCase().split(" ")[0]);
            const Icon = t.icon;
            const subtitle = getTransportSubtitle(t.id);

            return (
              <motion.button
                key={t.id}
                type="button"
                className={`transport-option-card ${isSelected ? "selected" : ""}`}
                style={{ "--trans-color": t.color }}
                onClick={() => onTransportChange(t.id)}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="trans-card-top">
                  <div className="trans-icon-box">
                    <Icon />
                  </div>
                  <strong className="trans-name">{t.title}</strong>
                </div>

                <div className="trans-live-info" title={subtitle}>
                  {subtitle}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. NUMBER OF TRAVELERS & 4. TRIP DURATION */}
      <div className="travelers-duration-row">
        {/* TRAVELERS */}
        <div className="pref-sub-section flex-1">
          <label className="pref-section-title">
            <FaUsers className="pref-icon purple" />
            <span>NUMBER OF TRAVELERS</span>
          </label>

          <div className="pills-flex-grid">
            {TRAVELER_OPTIONS.map((t) => {
              const isSelected = String(travelers) === t.id;
              const Icon = t.icon;

              return (
                <button
                  key={t.id}
                  type="button"
                  className={`pill-option-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => onTravelersChange(t.id)}
                >
                  <Icon className="pill-btn-icon" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DURATION */}
        <div className="pref-sub-section flex-1">
          <label className="pref-section-title">
            <FaCalendarAlt className="pref-icon orange" />
            <span>TRIP DURATION</span>
          </label>

          <div className="pills-flex-grid">
            {DURATION_OPTIONS.map((d) => {
              const isSelected =
                (d.id === "custom" && isCustomDuration) ||
                (!isCustomDuration && String(durationDays) === d.id);

              return (
                <button
                  key={d.id}
                  type="button"
                  className={`pill-option-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => handleDurationClick(d.id)}
                >
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* CUSTOM DAYS INPUT */}
          {isCustomDuration && (
            <motion.div
              className="custom-duration-input-box"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <label>Enter Custom Duration (Days):</label>
              <div className="custom-input-wrapper">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customDaysInput}
                  onChange={(e) => handleCustomDaysChange(e.target.value)}
                />
                <span>Days</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripPreferences;
