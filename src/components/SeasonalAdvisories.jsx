import { useState } from "react";
import {
  FaBullhorn,
  FaCalendarTimes,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaSearch,
  FaCloudRain,
  FaSun,
  FaSnowflake,
  FaWind,
} from "react-icons/fa";
import travelNewsArticles, { seasonalGuideMatrix } from "../data/travelNews";
import "./SeasonalAdvisories.css";

function SeasonalAdvisories({ onBack }) {
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNews = travelNewsArticles.filter((item) => {
    const matchesCat = filterCategory === "All" || item.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesSearch =
      item.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main className="advisory-page">
      <header className="advisory-navbar">
        <button className="advisory-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="advisory-nav-title">
          <FaBullhorn className="speaker-icon" /> TRAVEL NEWS & SEASONAL ADVISORY HUB
        </div>
        <div className="live-status-pill">
          <span className="live-pulse" /> Real-Time Weather & Safety Sync
        </div>
      </header>

      <div className="advisory-container">
        {/* HERO */}
        <section className="advisory-hero">
          <div className="hero-kicker">
            <FaCalendarTimes /> OFFICIAL SAFETY & SEASONAL GUIDELINES
          </div>
          <h1>
            When To Visit & <span>When NOT To Travel</span>
          </h1>
          <p>
            Real-time breaking advisories (Nepal monsoon floods, mountain roadblocks, extreme heatwaves) and smart seasonal recommendations to keep your journey safe, smooth, and scam-free.
          </p>
        </section>

        {/* NEPAL FLOOD EMERGENCY SPOTLIGHT BANNER */}
        <section className="nepal-emergency-banner">
          <div className="banner-badge">
            <FaExclamationTriangle /> CRITICAL MONSOON TRAVEL WARNING
          </div>
          <div className="banner-content">
            <h2>🚨 Kathmandu & Pokhara (Nepal): Monsoon Floods & Landslides</h2>
            <p>
              Heavy monsoon rains have triggered landslides along the Prithvi Highway near Mugling. <strong>DO NOT travel by road between Kathmandu and Pokhara</strong> right now. Use 25-minute domestic air transit (Buddha Air / Yeti Airlines) to avoid 16-hour hazardous delays.
            </p>
          </div>
        </section>

        {/* FILTER BAR */}
        <div className="advisory-filters-row">
          <div className="filter-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search destination, weather, or advisory (e.g. Nepal, Goa, Araku, Dubai)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-chips">
            {["All", "Emergency", "Seasonal", "Driving", "Marine"].map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${filterCategory === cat ? "active" : ""}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* BREAKING ARTICLES GRID */}
        <section className="advisory-articles-grid">
          {filteredNews.map((news) => (
            <div key={news.id} className={`advisory-card badge-${news.badgeColor}`}>
              <div className="card-top-bar">
                <span className="card-region-tag">{news.region}</span>
                <span className={`priority-badge ${news.badgeColor}`}>{news.priority}</span>
              </div>

              <h3>{news.headline}</h3>
              <p className="news-summary">{news.summary}</p>
              <p className="news-details">{news.details}</p>

              <div className="avoid-box">
                <span className="avoid-label">
                  <FaCalendarTimes /> ACTION TO AVOID:
                </span>
                <p>{news.avoidAction}</p>
              </div>

              <div className="safe-alt-box">
                <span className="safe-label">
                  <FaCalendarCheck /> RECOMMENDED ALTERNATIVE:
                </span>
                <p>{news.safeAlternatives}</p>
              </div>
            </div>
          ))}
        </section>

        {/* SEASONAL MATRIX TABLE */}
        <section className="seasonal-matrix-section">
          <div className="section-title-wrap">
            <h2>📅 Complete Seasonal Travel Matrix: Best vs Worst Months</h2>
            <p>Know exactly which month to avoid and when to plan your trip for maximum enjoyment.</p>
          </div>

          <div className="matrix-table-wrap">
            <table className="seasonal-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>
                    <FaSun style={{ color: "#16a34a" }} /> Best Time to Visit
                  </th>
                  <th>
                    <FaCloudRain style={{ color: "#dc2626" }} /> When NOT to Go (Avoid)
                  </th>
                  <th>Risk Factor</th>
                  <th>Tourister AI Advice</th>
                </tr>
              </thead>
              <tbody>
                {seasonalGuideMatrix.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.destination}</strong>
                    </td>
                    <td className="best-cell">
                      <FaCalendarCheck className="cell-icon green" /> {item.bestMonths}
                    </td>
                    <td className="worst-cell">
                      <FaCalendarTimes className="cell-icon red" /> {item.worstMonths}
                    </td>
                    <td>
                      <span className={`risk-pill ${item.riskFactor.includes("High") || item.riskFactor.includes("Extreme") ? "high" : "mod"}`}>
                        {item.riskFactor}
                      </span>
                    </td>
                    <td>{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* WEATHER SYNC TIPS */}
        <section className="weather-tips-grid">
          <div className="wt-card">
            <FaCloudRain className="wt-icon blue" />
            <div>
              <strong>Monsoon Protocols (June - Sept)</strong>
              <span>Check river flood alerts before mountain trekking; keep waterproof dry-bags for electronics.</span>
            </div>
          </div>
          <div className="wt-card">
            <FaSun className="wt-icon orange" />
            <div>
              <strong>Summer Heat Shield (April - June)</strong>
              <span>Carry electrolyte hydration packs; schedule temple visits during morning 5:30 AM - 8:30 AM.</span>
            </div>
          </div>
          <div className="wt-card">
            <FaSnowflake className="wt-icon purple" />
            <div>
              <strong>Winter Freeze & Fog (Nov - Feb)</strong>
              <span>Equip vehicle with high-beam amber fog lamps on mountain ghats; verify highway pass status.</span>
            </div>
          </div>
          <div className="wt-card">
            <FaWind className="wt-icon teal" />
            <div>
              <strong>Coastal Cyclone Alerts</strong>
              <span>Obey red flag warnings; avoid private fishing boats during turbulent high-tide phases.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SeasonalAdvisories;
