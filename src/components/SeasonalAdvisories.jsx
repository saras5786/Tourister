import { useState, useEffect } from "react";
import {
  FaBullhorn,
  FaCalendarTimes,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaSearch,
  FaRedo,
  FaSpinner,
  FaClock,
  FaGlobeAmericas,
  FaShieldAlt,
} from "react-icons/fa";
import travelNewsArticles, { seasonalGuideMatrix } from "../data/travelNews";
import { fetchLiveTravelNews } from "../services/newsService";
import "./SeasonalAdvisories.css";

function SeasonalAdvisories({ onBack }) {
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [liveNewsList, setLiveNewsList] = useState([]);
  const [loadingLiveNews, setLoadingLiveNews] = useState(false);
  const [customDestinationSearch, setCustomDestinationSearch] = useState("");

  const loadNews = async (dest = "") => {
    setLoadingLiveNews(true);
    try {
      const liveItems = await fetchLiveTravelNews(dest || "All Destinations");
      setLiveNewsList(liveItems);
    } catch (e) {
      console.warn("Failed to fetch live travel news:", e);
    } finally {
      setLoadingLiveNews(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Merge live items with baseline verified repository
  const combinedArticles = [
    ...liveNewsList,
    ...travelNewsArticles.filter(
      (base) => !liveNewsList.some((live) => live.id === base.id)
    ),
  ];

  const filteredNews = combinedArticles.filter((item) => {
    const matchesCat =
      filterCategory === "All" ||
      item.category.toLowerCase().includes(filterCategory.toLowerCase());
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      item.headline.toLowerCase().includes(query) ||
      item.region.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      (item.details && item.details.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <main className="advisory-page">
      {/* NAVBAR */}
      <header className="advisory-navbar">
        <button className="advisory-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="advisory-nav-title">
          <FaBullhorn className="speaker-icon" /> TRAVEL NEWS & LIVE ADVISORY RADAR
        </div>
        <div className="live-status-pill">
          <span className="live-pulse" /> Live Web Telemetry & Weather Radar
        </div>
      </header>

      <div className="advisory-container">
        {/* HERO */}
        <section className="advisory-hero">
          <div className="hero-kicker">
            <FaCalendarTimes /> REAL-TIME TRAVEL INTELLIGENCE & WHEN NOT TO TRAVEL
          </div>
          <h1>
            Live Travel News & <span>Seasonal Safety Radar</span>
          </h1>
          <p>
            Real-time breaking advisories (monsoon floods, mountain roadblocks, extreme weather warnings, airport statuses) and smart seasonal guidelines to keep your journey safe, smooth, and scam-free.
          </p>

          {/* LIVE DESTINATION SEARCH & REFRESH BAR */}
          <div className="live-news-search-bar">
            <div className="live-search-input-wrap">
              <FaGlobeAmericas className="search-globe-icon" />
              <input
                type="text"
                placeholder="Search live breaking news for any city (e.g. Nepal, Goa, Tirupati, Araku, Dubai, Paris)..."
                value={customDestinationSearch}
                onChange={(e) => setCustomDestinationSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadNews(customDestinationSearch);
                }}
              />
            </div>
            <button
              className="refresh-live-feed-btn"
              onClick={() => loadNews(customDestinationSearch)}
              disabled={loadingLiveNews}
            >
              {loadingLiveNews ? (
                <>
                  <FaSpinner className="spin-icon" /> Searching Live Web...
                </>
              ) : (
                <>
                  <FaRedo /> Fetch Live News
                </>
              )}
            </button>
          </div>
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
              placeholder="Filter current news bulletins..."
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

        {/* LOADING STATE */}
        {loadingLiveNews && (
          <div className="news-loading-banner">
            <FaSpinner className="spin-icon large" />
            <div>
              <strong>Gathering Real-Time Travel News & Weather Telemetry...</strong>
              <p>Scanning official meteorological radar, highway status, and airport reports.</p>
            </div>
          </div>
        )}

        {/* BREAKING ARTICLES GRID */}
        <section className="advisory-articles-grid">
          {filteredNews.map((news) => (
            <div
              key={news.id}
              className={`advisory-card badge-${news.badgeColor || "blue"}`}
            >
              <div className="card-top-bar">
                <span className="card-region-tag">{news.region}</span>
                <div className="card-top-right">
                  {news.timestamp && (
                    <span className="news-timestamp-tag">
                      <FaClock /> {news.timestamp}
                    </span>
                  )}
                  <span className={`priority-badge ${news.badgeColor || "blue"}`}>
                    {news.priority || "INFO"}
                  </span>
                </div>
              </div>

              <h3>{news.headline}</h3>
              <p className="news-summary">{news.summary}</p>
              {news.details && <p className="news-details">{news.details}</p>}

              {news.avoidAction && (
                <div className="avoid-box">
                  <span className="avoid-label">
                    <FaCalendarTimes /> ACTION TO AVOID:
                  </span>
                  <p>{news.avoidAction}</p>
                </div>
              )}

              {news.safeAlternatives && (
                <div className="safe-alt-box">
                  <span className="safe-label">
                    <FaCalendarCheck /> RECOMMENDED ALTERNATIVE:
                  </span>
                  <p>{news.safeAlternatives}</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* SEASONAL MATRIX OVERVIEW */}
        <section className="seasonal-matrix-section">
          <div className="matrix-header">
            <h2>🌍 Seasonal Travel Matrix: Best & Worst Months</h2>
            <p>Know exactly when destinations are ideal and when severe weather hits.</p>
          </div>

          <div className="matrix-cards-grid">
            {seasonalGuideMatrix.map((item, idx) => (
              <div key={idx} className="matrix-card">
                <div className="matrix-card-top">
                  <h3>{item.destination}</h3>
                  <span className="matrix-type">{item.type}</span>
                </div>

                <div className="matrix-row ideal">
                  <div className="m-label">
                    <FaCalendarCheck /> BEST MONTHS
                  </div>
                  <strong>{item.bestMonths}</strong>
                  <p>{item.bestReason}</p>
                </div>

                <div className="matrix-row avoid">
                  <div className="m-label">
                    <FaCalendarTimes /> AVOID MONTHS
                  </div>
                  <strong>{item.avoidMonths}</strong>
                  <p>{item.avoidReason}</p>
                </div>

                <div className="matrix-hazards">
                  <span>Hazards:</span> {item.hazards}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default SeasonalAdvisories;
