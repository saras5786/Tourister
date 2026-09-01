import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaKey,
  FaAward,
  FaShieldAlt,
  FaMapMarkedAlt,
  FaCog,
  FaCheckCircle,
  FaLock,
  FaLeaf,
  FaRoute,
  FaSignOutAlt,
} from "react-icons/fa";
import "./UserProfile.css";

function UserProfile({
  onBack,
  username = "Tourister",
  email = "user@tourister.com",
  userPoints = 300,
  userPassword = "",
  onUpdatePassword,
  savedPlans = [],
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'security' | 'badges' | 'plans' | 'settings'

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // Settings State
  const [ecoMode, setEcoMode] = useState(true);
  const [scamAlerts, setScamAlerts] = useState(true);
  const [sosAutoBroadcast, setSosAutoBroadcast] = useState(true);

  const getTier = () => {
    if (userPoints >= 600) return { name: "Legend Tourister", color: "#fbbf24", icon: "👑" };
    if (userPoints >= 300) return { name: "Gold Pioneer", color: "#f59e0b", icon: "🏆" };
    if (userPoints >= 150) return { name: "Silver Voyager", color: "#94a3b8", icon: "⭐" };
    return { name: "Bronze Explorer", color: "#d97706", icon: "🧭" };
  };

  const tier = getTier();

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (currentPassword !== userPassword && userPassword !== "") {
      setPasswordMsg({
        type: "error",
        text: "Current password does not match our records.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    if (onUpdatePassword) {
      onUpdatePassword(newPassword);
    }

    setPasswordMsg({
      type: "success",
      text: "Password updated successfully!",
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const badges = [
    {
      id: "b1",
      title: "Heritage Artisan Pioneer",
      desc: "Discovered and scanned Etikoppaka Lacquer Craft Village",
      icon: "🎨",
      unlocked: true,
    },
    {
      id: "b2",
      title: "Scam Shield Guardian",
      desc: "Reported or verified an active tourist scam warning",
      icon: "🛡️",
      unlocked: true,
    },
    {
      id: "b3",
      title: "Eco Voyager",
      desc: "Chose low-carbon transit for an intercity journey",
      icon: "🌿",
      unlocked: true,
    },
    {
      id: "b4",
      title: "Royal Bidri Craftsman",
      desc: "Completed Chowmahalla secret Bidriware workshop",
      icon: "👑",
      unlocked: userPoints >= 250,
    },
    {
      id: "b5",
      title: "Pancharama Scholar",
      desc: "Verified on-site visit to Draksharamam Heritage Crypts",
      icon: "🏛️",
      unlocked: userPoints >= 500,
    },
  ];

  return (
    <main className="profile-page">
      {/* NAVBAR */}
      <header className="profile-navbar">
        <button className="profile-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="profile-nav-title">TOURISTER PROFILE & SETTINGS</div>
        <div className="profile-badge-pill">
          {tier.icon} {tier.name}
        </div>
      </header>

      <div className="profile-container">
        {/* SIDEBAR TABS */}
        <aside className="profile-sidebar">
          <div className="user-summary-card">
            <div className="profile-avatar-large">
              {(username || "T").substring(0, 2).toUpperCase()}
            </div>
            <h2>{username}</h2>
            <p className="user-email">{email}</p>
            <div className="tier-tag" style={{ borderColor: tier.color, color: tier.color }}>
              {tier.icon} {tier.name}
            </div>

            <div className="sidebar-points-box">
              <span>ACTIVE T-POINTS</span>
              <strong>{userPoints} Points</strong>
            </div>
          </div>

          <nav className="profile-nav-menu">
            <button
              className={activeTab === "overview" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab("overview")}
            >
              <FaUser /> Profile Overview & Stats
            </button>
            <button
              className={activeTab === "security" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab("security")}
            >
              <FaKey /> Change Password & Security
            </button>
            <button
              className={activeTab === "badges" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab("badges")}
            >
              <FaAward /> Badges & Achievements ({badges.filter((b) => b.unlocked).length})
            </button>
            <button
              className={activeTab === "plans" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab("plans")}
            >
              <FaMapMarkedAlt /> Saved Itineraries
            </button>
            <button
              className={activeTab === "settings" ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab("settings")}
            >
              <FaCog /> Travel Preferences
            </button>
            {onLogout && (
              <button
                className="nav-item logout-btn"
                onClick={onLogout}
                style={{ marginTop: "16px", color: "#ef4444" }}
              >
                <FaSignOutAlt /> Log Out
              </button>
            )}
          </nav>
        </aside>

        {/* MAIN PROFILE CONTENT AREA */}
        <section className="profile-main-content">
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === "overview" && (
            <motion.div
              className="tab-view-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="section-head">
                <h2>Traveler Overview</h2>
                <p>Track your lifetime journey metrics and verified heritage milestones.</p>
              </div>

              <div className="stats-metric-grid">
                <div className="metric-box">
                  <FaRoute className="metric-icon blue" />
                  <div className="metric-val">1,240 km</div>
                  <div className="metric-lbl">Total Simulated Distance</div>
                </div>

                <div className="metric-box">
                  <FaAward className="metric-icon yellow" />
                  <div className="metric-val">{userPoints} T-Points</div>
                  <div className="metric-lbl">Anti-Fake GPS Points</div>
                </div>

                <div className="metric-box">
                  <FaLeaf className="metric-icon green" />
                  <div className="metric-val">0.18 t</div>
                  <div className="metric-lbl">Carbon Footprint Saved</div>
                </div>

                <div className="metric-box">
                  <FaShieldAlt className="metric-icon purple" />
                  <div className="metric-val">5 Warnings</div>
                  <div className="metric-lbl">Tourist Scams Avoided</div>
                </div>
              </div>

              <div className="verified-id-card">
                <div className="id-card-top">
                  <div className="id-brand">TOURISTER VERIFIED TRAVELER PASSPORT</div>
                  <FaCheckCircle className="id-check" />
                </div>
                <div className="id-grid">
                  <div>
                    <span>TOURIST ID</span>
                    <strong>TOUR-{username.toUpperCase()}-882</strong>
                  </div>
                  <div>
                    <span>STATUS</span>
                    <strong className="status-active">Verified On-Chain</strong>
                  </div>
                  <div>
                    <span>MEMBER SINCE</span>
                    <strong>2026</strong>
                  </div>
                  <div>
                    <span>TIER LEVEL</span>
                    <strong>{tier.name}</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: CHANGE PASSWORD & SECURITY */}
          {activeTab === "security" && (
            <motion.div
              className="tab-view-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="section-head">
                <h2>Change Password & Account Security</h2>
                <p>Update your password by entering your current and new credentials below.</p>
              </div>

              <div className="password-card">
                {passwordMsg.text && (
                  <div className={`password-alert ${passwordMsg.type}`}>
                    {passwordMsg.type === "success" ? <FaCheckCircle /> : <FaLock />}{" "}
                    {passwordMsg.text}
                  </div>
                )}

                <form className="password-form" onSubmit={handlePasswordChange}>
                  <div className="input-field">
                    <label>CURRENT PASSWORD</label>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-field">
                    <label>NEW PASSWORD</label>
                    <input
                      type="password"
                      placeholder="Enter new password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-field">
                    <label>CONFIRM NEW PASSWORD</label>
                    <input
                      type="password"
                      placeholder="Re-type your new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="save-password-btn">
                    Update Password →
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 3: BADGES & ACHIEVEMENTS */}
          {activeTab === "badges" && (
            <motion.div
              className="tab-view-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="section-head">
                <h2>Badges & Heritage Milestones</h2>
                <p>Earn prestige badges by discovering hidden gems and contributing to safe travel.</p>
              </div>

              <div className="badges-list-grid">
                {badges.map((b) => (
                  <div key={b.id} className={`badge-card ${b.unlocked ? "unlocked" : "locked"}`}>
                    <div className="badge-emoji-box">{b.icon}</div>
                    <div className="badge-details">
                      <h3>{b.title}</h3>
                      <p>{b.desc}</p>
                      <span className={`badge-status-tag ${b.unlocked ? "unlocked" : "locked"}`}>
                        {b.unlocked ? "✔ Unlocked & Verified" : "🔒 Locked (Explore More Gems)"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: SAVED ITINERARIES */}
          {activeTab === "plans" && (
            <motion.div
              className="tab-view-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="section-head">
                <h2>Saved Journey Itineraries</h2>
                <p>Access your saved trip plans generated with Create My Plan and Tourister Assistant.</p>
              </div>

              {savedPlans && savedPlans.length > 0 ? (
                <div className="saved-plans-list">
                  {savedPlans.map((plan, idx) => (
                    <div key={idx} className="saved-plan-item">
                      <div className="plan-item-info">
                        <h3>{plan.source} → {plan.destination}</h3>
                        <p>{plan.transport} · {plan.budget} · {plan.travelers} Traveler(s)</p>
                      </div>
                      <button className="view-saved-plan-btn" onClick={() => alert("Loading plan details in Create My Plan...")}>
                        Open Itinerary →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-plans-box">
                  <FaMapMarkedAlt className="empty-icon" />
                  <h3>No saved plans yet</h3>
                  <p>Generate your first customized trip itinerary using <strong>Create My Plan</strong>!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === "settings" && (
            <motion.div
              className="tab-view-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="section-head">
                <h2>Traveler Preferences</h2>
                <p>Customize your Tourister simulation preferences and security notifications.</p>
              </div>

              <div className="settings-options-list">
                <div className="setting-toggle-row">
                  <div>
                    <strong>Eco-Friendly Carbon Optimization</strong>
                    <p>Prioritize electric trains, buses, and eco-certified stays in itinerary recommendations.</p>
                  </div>
                  <button
                    className={`toggle-switch ${ecoMode ? "on" : "off"}`}
                    onClick={() => setEcoMode(!ecoMode)}
                  >
                    {ecoMode ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="setting-toggle-row">
                  <div>
                    <strong>Real-Time Tourist Scam Shield Alerts</strong>
                    <p>Receive proactive notifications when entering areas with active tout warnings.</p>
                  </div>
                  <button
                    className={`toggle-switch ${scamAlerts ? "on" : "off"}`}
                    onClick={() => setScamAlerts(!scamAlerts)}
                  >
                    {scamAlerts ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="setting-toggle-row">
                  <div>
                    <strong>Emergency SOS Auto-Broadcast Coordinates</strong>
                    <p>Automatically attach live GPS coordinates when triggering Emergency SOS simulator.</p>
                  </div>
                  <button
                    className={`toggle-switch ${sosAutoBroadcast ? "on" : "off"}`}
                    onClick={() => setSosAutoBroadcast(!sosAutoBroadcast)}
                  >
                    {sosAutoBroadcast ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </main>
  );
}

export default UserProfile;
