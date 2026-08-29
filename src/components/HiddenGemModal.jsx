import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaQrcode, FaMapMarkerAlt, FaCheckCircle, FaAward, FaLock, FaTimes, FaShieldAlt, FaClock } from "react-icons/fa";
import "./HiddenGemModal.css";

function HiddenGemModal({ gem, destinationName, onAddPoints, onClose }) {
  const [step, setStep] = useState("info"); // 'info' | 'locating' | 'qr-ready' | 'scanned' | 'success'
  const [timeLeft, setTimeLeft] = useState(60);
  const [securityToken, setSecurityToken] = useState("");

  const isClaimedLocally = () => {
    const claimedList = JSON.parse(localStorage.getItem("tourister_claimed_gems") || "[]");
    return Boolean(gem && claimedList.includes(gem.id));
  };

  const [alreadyClaimed, setAlreadyClaimed] = useState(isClaimedLocally);

  // Live countdown for dynamic anti-fake QR
  useEffect(() => {
    let interval = null;
    if (step === "qr-ready") {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setSecurityToken(`T-GEM-${gem?.id?.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, gem]);

  const handleStartVerification = () => {
    setStep("locating");
    setTimeout(() => {
      setSecurityToken(`T-GEM-${gem?.id?.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`);
      setTimeLeft(60);
      setStep("qr-ready");
    }, 1600);
  };

  const handleSimulateArtisanScan = () => {
    setStep("scanned");
    setTimeout(() => {
      // Award T-Points
      onAddPoints(gem.tPoints, gem.name, gem.badgeAwarded);
      const claimedList = JSON.parse(localStorage.getItem("tourister_claimed_gems") || "[]");
      if (!claimedList.includes(gem.id)) {
        claimedList.push(gem.id);
        localStorage.setItem("tourister_claimed_gems", JSON.stringify(claimedList));
      }
      setAlreadyClaimed(true);
      setStep("success");
    }, 1400);
  };

  if (!gem) return null;

  return (
    <div className="gem-modal-backdrop" onClick={onClose}>
      <motion.div
        className="gem-modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.35 }}
      >
        <button className="gem-close-btn" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        {/* HEADER */}
        <div className="gem-modal-header">
          <div className="gem-badge-pill">
            <FaAward /> TOURISTER VERIFIED HIDDEN GEM
          </div>
          <h2>{gem.name}</h2>
          <p className="gem-location">
            <FaMapMarkerAlt /> {gem.location} ({destinationName})
          </p>
        </div>

        {/* CONTENT STATES */}
        <div className="gem-modal-body">
          {step === "info" && (
            <div className="gem-info-view">
              <div className="gem-points-banner">
                <div className="points-number">+{gem.tPoints}</div>
                <div className="points-label">
                  <strong>T-POINTS REWARD</strong>
                  <span>Awarded on verified artisan check-in</span>
                </div>
              </div>

              <div className="gem-story">
                <h3>About This Cultural Experience</h3>
                <p>{gem.description}</p>
              </div>

              <div className="gem-security-notice">
                <FaShieldAlt className="shield-icon" />
                <div>
                  <strong>Anti-Cheat Verification Rule:</strong>
                  <p>{gem.rule}</p>
                </div>
              </div>

              <div className="gem-action-row">
                {alreadyClaimed ? (
                  <div className="already-claimed-notice">
                    <FaCheckCircle /> You have already discovered and verified this Hidden Gem! (+{gem.tPoints} T-Points Earned)
                  </div>
                ) : (
                  <button className="gem-claim-btn" onClick={handleStartVerification}>
                    <FaMapMarkerAlt /> I Am at the Location (Verify GPS Check-In) →
                  </button>
                )}
              </div>
            </div>
          )}

          {step === "locating" && (
            <div className="gem-locating-view">
              <div className="radar-spinner">
                <div className="radar-circle" />
                <div className="radar-circle delay-1" />
                <div className="radar-scanner" />
                <FaMapMarkerAlt className="radar-pin" />
              </div>
              <h3>Verifying Physical Presence...</h3>
              <p>Validating geofenced coordinates near {gem.location}...</p>
              <span className="locating-tag">Cryptographic GPS Handshake</span>
            </div>
          )}

          {step === "qr-ready" && (
            <div className="gem-qr-view">
              <div className="qr-security-banner">
                <FaLock /> LIVE TIME-STAMPED TOURIST CHECK-IN PASS
              </div>

              <div className="qr-container">
                <div className="qr-frame">
                  <svg className="generated-qr-svg" viewBox="0 0 160 160" width="160" height="160">
                    <rect width="160" height="160" fill="#ffffff" rx="8" />
                    <rect x="15" y="15" width="35" height="35" fill="#171725" rx="4" />
                    <rect x="22" y="22" width="21" height="21" fill="#ffffff" rx="2" />
                    <rect x="27" y="27" width="11" height="11" fill="#7060e5" />

                    <rect x="110" y="15" width="35" height="35" fill="#171725" rx="4" />
                    <rect x="117" y="22" width="21" height="21" fill="#ffffff" rx="2" />
                    <rect x="122" y="27" width="11" height="11" fill="#7060e5" />

                    <rect x="15" y="110" width="35" height="35" fill="#171725" rx="4" />
                    <rect x="22" y="117" width="21" height="21" fill="#ffffff" rx="2" />
                    <rect x="27" y="122" width="11" height="11" fill="#7060e5" />

                    <circle cx="65" cy="25" r="4" fill="#171725" />
                    <circle cx="80" cy="25" r="4" fill="#7060e5" />
                    <circle cx="95" cy="25" r="4" fill="#171725" />
                    <circle cx="65" cy="40" r="4" fill="#171725" />
                    <circle cx="80" cy="55" r="4" fill="#ec4899" />
                    <circle cx="95" cy="40" r="4" fill="#171725" />

                    <rect x="60" y="70" width="40" height="20" fill="#7060e5" rx="3" />
                    <text x="80" y="84" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      TOURISTER
                    </text>

                    <circle cx="25" cy="75" r="4" fill="#171725" />
                    <circle cx="40" cy="85" r="4" fill="#7060e5" />
                    <circle cx="120" cy="75" r="4" fill="#171725" />
                    <circle cx="135" cy="85" r="4" fill="#ec4899" />

                    <circle cx="65" cy="115" r="4" fill="#171725" />
                    <circle cx="80" cy="130" r="4" fill="#7060e5" />
                    <circle cx="95" cy="115" r="4" fill="#171725" />
                    <circle cx="115" cy="130" r="4" fill="#171725" />
                    <circle cx="135" cy="120" r="4" fill="#171725" />
                  </svg>
                </div>

                <div className="qr-countdown">
                  <FaClock /> QR expires in: <strong>{timeLeft}s</strong>
                </div>
                <div className="qr-token-code">Token: {securityToken}</div>
              </div>

              <div className="qr-instructions">
                <p>
                  Show this dynamic QR code to the <strong>authorized local artisan or checkpoint staff</strong>. They will scan it to verify your visit.
                </p>
              </div>

              <div className="artisan-scan-simulator">
                <span>Checkpoint Simulation:</span>
                <button className="simulate-artisan-btn" onClick={handleSimulateArtisanScan}>
                  <FaQrcode /> [Simulate Artisan Scanner Device Scanning Your QR]
                </button>
              </div>
            </div>
          )}

          {step === "scanned" && (
            <div className="gem-locating-view">
              <div className="radar-spinner">
                <div className="radar-circle" />
                <FaCheckCircle className="radar-pin verified" />
              </div>
              <h3>Artisan Checkpoint Scanning...</h3>
              <p>Validating cryptotoken against Tourister Tourism Ledger...</p>
            </div>
          )}

          {step === "success" && (
            <div className="gem-success-view">
              <motion.div
                className="success-trophy-circle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <FaAward />
              </motion.div>

              <h2>Hidden Gem Discovered!</h2>
              <p className="success-subtitle">Your on-site visit has been verified and registered on the Tourism Ledger.</p>

              <div className="success-stats-box">
                <div className="stat-card">
                  <span>POINTS EARNED</span>
                  <strong>+{gem.tPoints} T-Points</strong>
                </div>
                <div className="stat-card">
                  <span>BADGE UNLOCKED</span>
                  <strong>{gem.badgeAwarded || "Explorer Pioneer"}</strong>
                </div>
              </div>

              <p className="wallet-credited-msg">
                ✨ Successfully credited to your <strong>Tourister Wallet</strong>! You can redeem these points for local artisan discounts, free eco-passes, and travel vouchers.
              </p>

              <button className="gem-finish-btn" onClick={onClose}>
                Done & Return to Trip →
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default HiddenGemModal;
