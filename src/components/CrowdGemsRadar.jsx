import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaClock,
  FaAward,
  FaQrcode,
  FaCheckCircle,
  FaGem,
  FaUsers,
  FaEye,
  FaMapMarkerAlt,
  FaSearch,
  FaPlaneDeparture,
  FaTicketAlt,
} from "react-icons/fa";
import "./CrowdGemsRadar.css";

const DESTINATION_CROWD_DATA = {
  Tirupati: {
    name: "Tirupati & Tirumala Sacred Hills",
    googleInsight: "Based on Google Search & Popular Times data: High footfall during weekends (Fri-Sun). Most peaceful from 05:30 AM to 08:00 AM.",
    bestVisitingTime: "05:30 AM - 07:30 AM (Early Morning Darshan & Quiet Hills)",
    peakWarning: "Peak rush usually observed between 10:00 AM and 01:30 PM (2-3 hour wait times).",
    hourlyData: [
      { hour: "06:00", crowdPct: 22, level: "low", label: "Quiet" },
      { hour: "08:00", crowdPct: 48, level: "moderate", label: "Moderate" },
      { hour: "10:00", crowdPct: 88, level: "peak", label: "Busy" },
      { hour: "12:00", crowdPct: 95, level: "peak", label: "Peak Rush" },
      { hour: "14:00", crowdPct: 78, level: "peak", label: "Busy" },
      { hour: "16:00", crowdPct: 62, level: "moderate", label: "Moderate" },
      { hour: "18:00", crowdPct: 89, level: "peak", label: "Busy" },
      { hour: "20:00", crowdPct: 54, level: "moderate", label: "Moderate" },
      { hour: "22:00", crowdPct: 28, level: "low", label: "Quiet" },
    ],
    hiddenGems: [
      {
        id: "gem-tpt-1",
        title: "Kalyani Dam & Silent Forest Canopy Trail",
        location: "Rangampeta Forest Range (18km from Tirupati)",
        category: "Eco-Trail & Lake",
        points: 300,
        rewardUnlock: "Unlocks Free Airport / Station VIP Lounge Access Voucher",
        giTag: "Protected Forest Reserve",
        description: "A peaceful freshwater lake hidden inside the lush Eastern Ghats forest. Clean, quiet, and completely untouched by normal pilgrimage crowds.",
        bestTime: "06:30 AM - 09:00 AM",
      },
      {
        id: "gem-tpt-2",
        title: "Madhavam Master Woodcraft Center",
        location: "Karakambadi Road, Tirupati",
        category: "GI Traditional Handcraft",
        points: 300,
        rewardUnlock: "Unlocks 15% Hotel Dining Discount Coupon",
        giTag: "GI Certified Red Sanders Craft",
        description: "Visit traditional artisan families carving sacred wooden art by hand with generational mastery.",
        bestTime: "10:00 AM - 04:00 PM",
      },
    ],
  },
  Kakinada: {
    name: "Kakinada & Coringa Mangrove Gateway",
    googleInsight: "Based on Google Search & Popular Times data: Best experienced in morning hours during high tide. Low crowding on weekdays.",
    bestVisitingTime: "08:00 AM - 10:30 AM (Morning Wooden Boardwalk Walk)",
    peakWarning: "Moderate visitors on Sunday evenings around Beach Road (5 PM - 8 PM).",
    hourlyData: [
      { hour: "06:00", crowdPct: 15, level: "low", label: "Quiet" },
      { hour: "08:00", crowdPct: 28, level: "low", label: "Quiet" },
      { hour: "10:00", crowdPct: 52, level: "moderate", label: "Moderate" },
      { hour: "12:00", crowdPct: 45, level: "moderate", label: "Moderate" },
      { hour: "14:00", crowdPct: 38, level: "low", label: "Quiet" },
      { hour: "16:00", crowdPct: 65, level: "moderate", label: "Moderate" },
      { hour: "18:00", crowdPct: 74, level: "peak", label: "Busy" },
      { hour: "20:00", crowdPct: 30, level: "low", label: "Quiet" },
      { hour: "22:00", crowdPct: 10, level: "low", label: "Quiet" },
    ],
    hiddenGems: [
      {
        id: "gem-kkd-1",
        title: "Uppada Jamdani Pure Silk & Gold Zari Weavers",
        location: "Uppada Coastal Weaving Colony (12km from Kakinada)",
        category: "GI Handloom Heritage",
        points: 300,
        rewardUnlock: "Unlocks Free Airport VIP Lounge Pass",
        giTag: "GI Tag #122 - Uppada Jamdani",
        description: "Watch master weavers create pure gold Zari handloom sarees on traditional pit looms. Zero middleman markup.",
        bestTime: "09:00 AM - 01:00 PM",
      },
      {
        id: "gem-kkd-2",
        title: "Hope Island Natural Cyclone Barrier Spit",
        location: "Bay of Bengal (Motorboat from Kakinada Port)",
        category: "Marine Eco-Spit",
        points: 300,
        rewardUnlock: "Unlocks ₹500 Travel Wallet Bonus Credit",
        giTag: "Protected Marine Eco-Zone",
        description: "A 16km natural island sand spit safeguarding Kakinada city and hosting nesting Olive Ridley sea turtles.",
        bestTime: "07:30 AM - 11:30 AM",
      },
    ],
  },
  Kathmandu: {
    name: "Kathmandu Valley & Historic Durbar",
    googleInsight: "Based on Google Search & Popular Times data: Durbar Square and Pashupatinath are busy between 10 AM and 5 PM. Very peaceful during early morning Vedic prayers.",
    bestVisitingTime: "06:00 AM - 08:30 AM (Pashupatinath Sunrise Prayers)",
    peakWarning: "Road transit between Kathmandu & Pokhara faces monsoon delays; book domestic flights.",
    hourlyData: [
      { hour: "06:00", crowdPct: 30, level: "low", label: "Quiet" },
      { hour: "08:00", crowdPct: 48, level: "moderate", label: "Moderate" },
      { hour: "10:00", crowdPct: 75, level: "peak", label: "Busy" },
      { hour: "12:00", crowdPct: 82, level: "peak", label: "Peak Rush" },
      { hour: "14:00", crowdPct: 68, level: "moderate", label: "Moderate" },
      { hour: "16:00", crowdPct: 78, level: "peak", label: "Busy" },
      { hour: "18:00", crowdPct: 85, level: "peak", label: "Busy" },
      { hour: "20:00", crowdPct: 40, level: "moderate", label: "Moderate" },
      { hour: "22:00", crowdPct: 15, level: "low", label: "Quiet" },
    ],
    hiddenGems: [
      {
        id: "gem-ktm-1",
        title: "Kirtipur Ancient Newari Citadel & Stupa",
        location: "Kirtipur Hilltop (8km south of Kathmandu)",
        category: "Historic Citadel",
        points: 300,
        rewardUnlock: "Unlocks Free Airport VIP Lounge Pass",
        giTag: "UNESCO Tentative Zone",
        description: "Traditional stone-paved courtyards, ancient wood carving workshops, and genuine Newari family cuisine.",
        bestTime: "08:00 AM - 12:00 PM",
      },
    ],
  },
  Visakhapatnam: {
    name: "Visakhapatnam & Eastern Ghats",
    googleInsight: "Based on Google Search & Popular Times data: Beach Road and submarine museum get peak visitors from 5 PM to 8 PM. Hilltop viewpoints are most scenic at sunrise.",
    bestVisitingTime: "05:00 PM - 07:00 PM (Sunset Beach Promenade)",
    peakWarning: "Kailasagiri ropeway has 30-min weekend wait times around 4:30 PM.",
    hourlyData: [
      { hour: "06:00", crowdPct: 20, level: "low", label: "Quiet" },
      { hour: "08:00", crowdPct: 35, level: "low", label: "Quiet" },
      { hour: "10:00", crowdPct: 58, level: "moderate", label: "Moderate" },
      { hour: "12:00", crowdPct: 62, level: "moderate", label: "Moderate" },
      { hour: "14:00", crowdPct: 45, level: "moderate", label: "Moderate" },
      { hour: "16:00", crowdPct: 70, level: "peak", label: "Busy" },
      { hour: "18:00", crowdPct: 92, level: "peak", label: "Peak Rush" },
      { hour: "20:00", crowdPct: 75, level: "peak", label: "Busy" },
      { hour: "22:00", crowdPct: 30, level: "low", label: "Quiet" },
    ],
    hiddenGems: [
      {
        id: "gem-vskp-1",
        title: "Etikoppaka Organic Lacquer Toy Village",
        location: "Varaha River Banks (55km south of Vizag)",
        category: "GI Traditional Toy Craft",
        points: 300,
        rewardUnlock: "Unlocks Free Airport Lounge & FastTrack Pass",
        giTag: "GI Tag #50 - Etikoppaka Toys",
        description: "Centuries-old craft of turning soft Ankudu wood on traditional lathes with non-toxic herbal vegetable dyes.",
        bestTime: "10:00 AM - 03:30 PM",
      },
    ],
  },
};

function CrowdGemsRadar({ onBack, onAddPoints }) {
  const [selectedDest, setSelectedDest] = useState("Tirupati");
  const [activeTab, setActiveTab] = useState("crowd");
  const [scannedGems, setScannedGems] = useState([]);
  const [scanningGemId, setScanningGemId] = useState(null);

  const destData = DESTINATION_CROWD_DATA[selectedDest] || DESTINATION_CROWD_DATA["Tirupati"];

  const handleScanQR = (gemId, points) => {
    setScanningGemId(gemId);
    setTimeout(() => {
      setScannedGems((prev) => [...prev, gemId]);
      setScanningGemId(null);
      if (onAddPoints) {
        onAddPoints(points);
      }
      alert(`🎉 Congratulations! You earned +${points} T-Points! Check your Tourister Wallet to claim your VIP Lounge Pass & Coupons.`);
    }, 1000);
  };

  return (
    <main className="radar-page">
      {/* HEADER */}
      <header className="radar-navbar">
        <button className="radar-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="radar-nav-title">
          <FaUsers className="nav-icon" />
          <span>VISUAL CROWD RADAR & HIDDEN GEMS</span>
        </div>
        <div className="radar-dest-select">
          <select value={selectedDest} onChange={(e) => setSelectedDest(e.target.value)}>
            {Object.keys(DESTINATION_CROWD_DATA).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="radar-container">
        {/* HERO */}
        <section className="radar-hero">
          <div className="radar-pill">
            <span>LIVE CROWD TIMINGS & REWARD POINTS</span>
          </div>
          <h1>
            Popular Visiting Times <span>& Secret Hidden Spots</span>
          </h1>
          <p>
            Check real Google Popular Times to visit places when they are quiet and peaceful. Visit verified hidden gems to earn T-Points and unlock free VIP Lounge access and hotel coupons!
          </p>
        </section>

        {/* T-POINTS EXPLANATION BANNER */}
        <div className="tpoints-explain-banner">
          <div className="tpoints-banner-icon">
            <FaGem />
          </div>
          <div className="tpoints-banner-text">
            <strong>How do T-Points Work?</strong>
            <p>
              When you physically visit verified artisan workshops and hidden gems, scan the on-site Tourister QR code to earn <strong>+300 T-Points per place</strong>. Use your T-Points in the <strong>Tourister Wallet</strong> to unlock free Airport & Railway VIP Lounge Passes, express fast-track vouchers, and exclusive hotel dining coupons!
            </p>
          </div>
          <div className="tpoints-banner-perk">
            <span><FaPlaneDeparture /> Free VIP Lounge Access</span>
            <span><FaTicketAlt /> Discount Coupons</span>
          </div>
        </div>

        {/* TABS */}
        <div className="radar-tabs-row">
          <button
            className={`radar-tab-btn ${activeTab === "crowd" ? "active" : ""}`}
            onClick={() => setActiveTab("crowd")}
          >
            <FaClock /> Google Popular Times & Crowd Curve
          </button>
          <button
            className={`radar-tab-btn ${activeTab === "gems" ? "active" : ""}`}
            onClick={() => setActiveTab("gems")}
          >
            <FaGem /> Secret Gems to Earn T-Points (+300 Pts Each)
          </button>
        </div>

        {/* TAB 1: CROWD DENSITY */}
        {activeTab === "crowd" && (
          <motion.div
            className="crowd-density-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="crowd-header">
              <div>
                <h2>{destData.name}</h2>
                <p className="google-insight-text">
                  <FaSearch style={{ color: "#3b82f6" }} /> {destData.googleInsight}
                </p>
              </div>
              <div className="best-window-box">
                <FaEye style={{ color: "#10b981" }} />
                <div>
                  <small>MOST PEACEFUL TIME TO VISIT</small>
                  <strong>{destData.bestVisitingTime}</strong>
                </div>
              </div>
            </div>

            {/* HOURLY BAR CHART */}
            <div className="hourly-chart-wrapper">
              <div className="chart-legend">
                <span className="legend-item"><span className="dot green" /> Peaceful (&lt;35% crowded)</span>
                <span className="legend-item"><span className="dot yellow" /> Normal Rush (35-70%)</span>
                <span className="legend-item"><span className="dot red" /> Busy / Peak Hours (&gt;70%)</span>
              </div>

              <div className="chart-bars-grid">
                {destData.hourlyData.map((item, idx) => (
                  <div key={idx} className="bar-column">
                    <span className="bar-pct">{item.label}</span>
                    <div className="bar-track">
                      <motion.div
                        className={`bar-fill ${item.level}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${item.crowdPct}%` }}
                        transition={{ duration: 0.7, delay: idx * 0.05 }}
                      />
                    </div>
                    <span className="bar-hour">{item.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="crowd-peak-note">
              <strong>💡 Pro Traveler Tip:</strong> {destData.peakWarning}
            </div>
          </motion.div>
        )}

        {/* TAB 2: HIDDEN GEMS */}
        {activeTab === "gems" && (
          <motion.div
            className="gems-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {destData.hiddenGems.map((gem) => {
              const isClaimed = scannedGems.includes(gem.id);
              const isScanning = scanningGemId === gem.id;

              return (
                <div key={gem.id} className="gem-card">
                  <div className="gem-card-header">
                    <span className="gem-category">{gem.category}</span>
                    <span className="gi-badge">
                      <FaAward /> {gem.giTag}
                    </span>
                  </div>

                  <h3>{gem.title}</h3>
                  <div className="gem-loc">
                    <FaMapMarkerAlt /> {gem.location}
                  </div>

                  <p className="gem-desc">{gem.description}</p>

                  <div className="gem-reward-badge">
                    <FaGem style={{ color: "#ec4899" }} />
                    <span><strong>Reward:</strong> {gem.rewardUnlock}</span>
                  </div>

                  <div className="gem-footer">
                    <div className="gem-time">
                      <FaClock /> Best: {gem.bestTime}
                    </div>

                    <button
                      className={`claim-points-btn ${isClaimed ? "claimed" : ""}`}
                      onClick={() => handleScanQR(gem.id, gem.points)}
                      disabled={isClaimed || isScanning}
                    >
                      {isClaimed ? (
                        <>
                          <FaCheckCircle /> +{gem.points} T-Pts Earned
                        </>
                      ) : isScanning ? (
                        "Scanning Location QR..."
                      ) : (
                        <>
                          <FaQrcode /> Scan On-Site QR (+{gem.points} Pts)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default CrowdGemsRadar;
