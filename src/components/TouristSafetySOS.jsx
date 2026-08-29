import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShieldAlt,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaHospital,
  FaUserShield,
  FaBroadcastTower,
  FaCheckCircle,
} from "react-icons/fa";
import "./TouristSafetySOS.css";

function TouristSafetySOS({ onBack, destination = "Hyderabad" }) {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosStatus, setSosStatus] = useState("idle");

  const handleTriggerSOS = () => {
    setSosTriggered(true);
    setSosStatus("broadcasting");
    setTimeout(() => {
      setSosStatus("dispatched");
    }, 2000);
  };

  const emergencyContacts = [
    { title: "National Tourist Helpline", number: "1363 (24x7 Multi-lingual)", icon: FaPhoneAlt, desc: "Ministry of Tourism instant assistance" },
    { title: "Emergency Police Response", number: "112", icon: FaUserShield, desc: "Immediate police intervention & location beacon" },
    { title: "Ambulance & Medical Emergency", number: "108", icon: FaHospital, desc: "Nearest trauma care & medical ambulance" },
    { title: "Women Tourist Safety Cell", number: "1091", icon: FaShieldAlt, desc: "Dedicated 24/7 rapid protection squad" },
  ];

  return (
    <main className="safety-sos-page">
      <header className="safety-navbar">
        <button className="safety-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="safety-nav-title">
          <FaShieldAlt className="shield-red" /> TOURIST SOS & SAFETY COMMAND
        </div>
        <div className="safe-status-pill">Active GPS Protection</div>
      </header>

      <div className="safety-container">
        {/* HERO SOS TRIGGER */}
        <section className="sos-hero-card">
          <div className="sos-alert-badge">
            <FaExclamationTriangle /> EMERGENCY RAPID ASSISTANCE
          </div>
          <h1>
            Need Immediate Help in <span>{destination}</span>?
          </h1>
          <p>
            Pressing the Emergency SOS button immediately broadcasts your simulated GPS coordinates to the nearest Tourist Police Station and registered emergency contacts.
          </p>

          <div className="sos-button-wrapper">
            <motion.button
              className={`big-sos-btn ${sosTriggered ? "active" : ""}`}
              onClick={handleTriggerSOS}
              whileTap={{ scale: 0.94 }}
              animate={sosTriggered ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: sosTriggered ? Infinity : 0, duration: 1.2 }}
            >
              <div className="sos-inner-ring">
                <FaBroadcastTower className="sos-tower-icon" />
                <span>EMERGENCY SOS</span>
                <small>1-Click Instant Broadcast</small>
              </div>
            </motion.button>
          </div>

          <AnimatePresence>
            {sosTriggered && (
              <motion.div
                className="sos-dispatch-banner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {sosStatus === "broadcasting" ? (
                  <div className="dispatch-text">
                    <FaBroadcastTower className="spin" /> Broadcasting location coordinates (17.3850° N, 78.4867° E) to Tourist Control Room...
                  </div>
                ) : (
                  <div className="dispatch-text success">
                    <FaCheckCircle /> Emergency Alert Dispatched! Tourist Police Patrol #HYD-42 has been routed to your beacon. Stay in a well-lit area.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* EMERGENCY DIRECTORY */}
        <section className="emergency-directory">
          <h2>Official Emergency Hotlines</h2>
          <div className="hotlines-grid">
            {emergencyContacts.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="hotline-card">
                  <div className="hotline-icon">
                    <Icon />
                  </div>
                  <div className="hotline-details">
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                    <a href={`tel:${c.number.split(" ")[0]}`} className="call-btn">
                      <FaPhoneAlt /> Call {c.number}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TOURIST SAFETY TIPS */}
        <section className="safety-tips-box">
          <h3>Safe Tourism Best Practices</h3>
          <div className="tips-list-grid">
            <div className="tip-item">
              <strong>✔ Use Official Prepaid Transport</strong>
              <p>Always book rides via authorized airport/station prepaid counters or ride-hailing apps to prevent overcharging.</p>
            </div>
            <div className="tip-item">
              <strong>✔ Verify Gem & Craft Certificates</strong>
              <p>Purchase handlooms and souvenirs exclusively from Government-recognized emporiums or verified artisan guilds.</p>
            </div>
            <div className="tip-item">
              <strong>✔ Digital Vault Copies</strong>
              <p>Keep offline digital scans of passport, ID card, and tickets inside your Tourister profile vault.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TouristSafetySOS;
