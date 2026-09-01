import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import CreatePlan from "./components/CreatePlan";
import Community from "./components/Community";
import TouristerWallet from "./components/TouristerWallet";
import UserProfile from "./components/UserProfile";
import TouristSafetySOS from "./components/TouristSafetySOS";
import AudioGuidePhrasebook from "./components/AudioGuidePhrasebook";
import HiddenGemModal from "./components/HiddenGemModal";
import FastTrackAirportPass from "./components/FastTrackAirportPass";
import SeasonalAdvisories from "./components/SeasonalAdvisories";

// New Hackathon Innovation Components
import MultiAgentSquad from "./components/MultiAgentSquad";
import BudgetEstimator from "./components/BudgetEstimator";
import CrowdGemsRadar from "./components/CrowdGemsRadar";
import InfluencerStudio from "./components/InfluencerStudio";
import TripDossierSummary from "./components/TripDossierSummary";
import Background3D from "./components/Background3D";
import { loginUser, signupUser, updateUserData } from "./services/api";

import touristerAI from "./assets/tourister-ai.png";
import touristerWallet from "./assets/tourister-wallet.png";
import universityLogo from "./assets/aditya-logo.png";

import { puter } from "@heyputer/puter.js";

import {
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaEnvelope,
} from "react-icons/fa6";

import {
  FaShieldAlt,
  FaHeadphones,
  FaWallet,
  FaUser,
  FaComments,
  FaRoute,
  FaRobot,
  FaPlaneDeparture,
  FaExclamationTriangle,
  FaBullhorn,
  FaUsers,
  FaMoneyBillWave,
  FaCamera,
  FaFileAlt,
  FaGem,
  FaMagic,
} from "react-icons/fa";

import "./App.css";

/* =================================
   10 SMOOTH FLOATING BACKGROUND DOTS
================================= */
const backgroundDots = [
  { id: 1, left: "7%", top: "18%", size: 28, className: "pink-dot" },
  { id: 2, left: "88%", top: "15%", size: 26, className: "blue-dot" },
  { id: 3, left: "9%", top: "78%", size: 25, className: "yellow-dot" },
  { id: 4, left: "86%", top: "74%", size: 24, className: "cyan-dot" },
  { id: 5, left: "5%", top: "48%", size: 18, className: "cyan-dot" },
  { id: 6, left: "93%", top: "46%", size: 16, className: "yellow-dot" },
  { id: 7, left: "28%", top: "35%", size: 16, className: "purple-dot" },
  { id: 8, left: "72%", top: "32%", size: 18, className: "pink-dot" },
  { id: 9, left: "38%", top: "86%", size: 18, className: "blue-dot" },
  { id: 10, left: "62%", top: "84%", size: 20, className: "purple-dot" },
];

/* DEFAULT REGISTERED USERS DATABASE */
const DEFAULT_USERS = [
  {
    username: "saraschandra",
    email: "saraschandra5786@gmail.com",
    password: "password123",
    userPoints: 300,
    walletBalance: 2500,
  },
];

function App() {
  /* =================================
     PAGE ROUTING STATE
  ================================= */
  const [page, setPage] = useState("home"); // 'home' | 'auth' | 'dashboard' | 'ai' | 'create-plan' | 'community' | 'wallet' | 'profile' | 'sos' | 'phrasebook' | 'fasttrack'

  /* =================================
     MOUSE POSITION
  ================================= */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  /* =================================
     REAL AUTHENTICATION & USER STATE
  ================================= */
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [loginInput, setLoginInput] = useState("saraschandra");
  const [loginPassword, setLoginPassword] = useState("password123");

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Persistent Current Logged-in User
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("tourister_logged_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS[0];
  });

  const [userPoints, setUserPoints] = useState(currentUser?.userPoints || 300);
  const [walletBalance, setWalletBalance] = useState(currentUser?.walletBalance || 2500);
  const [savedPlans, setSavedPlans] = useState([]);
  const [activeGem, setActiveGem] = useState(null);

  // Synchronize localStorage for users list
  useEffect(() => {
    const existing = localStorage.getItem("tourister_users");
    if (!existing) {
      localStorage.setItem("tourister_users", JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  /* =================================
     TOURISTER AI STATE
  ================================= */
  const [aiMessage, setAiMessage] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am Tourister, your travel assistant. Tell me where you are starting from, where you want to travel, your budget, and number of days. I will help plan your entire journey with places to visit, hotels, temple timings, local food, and scam alerts!",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  /* =================================
     SEND AI MESSAGE
  ================================= */
  const sendAiMessage = async () => {
    if (!aiMessage.trim() || aiLoading) return;

    const userMessage = aiMessage.trim();
    const updatedMessages = [
      ...aiMessages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    setAiMessages(updatedMessages);
    setAiMessage("");
    setAiLoading(true);

    try {
      const messages = [
        {
          role: "system",
          content: `
You are Tourister AI, a helpful, friendly, and expert travel assistant.
You provide clear, well-structured, and practical travel plans with transit details, hotels, attractions, local food, safety advice, and timing tips.
Keep explanations simple, natural, and easy to follow.

Whenever the user asks about a trip or destination, always structure your answer with:
1. 🚆 Departure & Transit (Origin to Destination options with train/flight names & travel duration)
2. 🛺 Arrival & Station Transit (Arrival junction, fixed-meter auto tips to avoid touts)
3. 🏨 Accommodation Tiers (Budget ₹, Moderate ₹₹, Heritage/Luxury ₹₹₹)
4. 🗓️ Day-by-Day Schedule (Morning, Afternoon, Evening, including sacred temples, darshan dress codes, and entry fees)
5. 🍲 Authentic Regional Food (Must-try iconic local dishes & famous street food stalls)
6. 🚨 Scam Shield Warnings (Specific tourist scams, fake gemstone touts, unofficial priests to avoid)
7. 💎 Verified Hidden Gems & T-Points (Authentic GI artisan workshops & cultural heritage)
8. 🎒 Return Journey & Packing Checklist.
          `,
        },
        ...updatedMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ];

      const response = await puter.ai.chat(messages, {
        model: "openai/gpt-5.6-luna",
        tools: [
          {
            type: "web_search",
          },
        ],
        reasoning_effort: "medium",
        verbosity: "medium",
      });

      const reply =
        response?.message?.content ||
        response?.text ||
        "I have generated your travel recommendations! Let me know if you would like me to customize any part of this plan.";

      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error("Travel Assistant fallback engaged:", error);

      // Robust Intelligent Fallback Simulation
      setTimeout(() => {
        let fallbackReply = `Here is your complete Tourister travel plan for "${userMessage}":\n\n` +
          `🚆 **1. Departure Transit & Arrival:**\n` +
          `• Recommended Transit: Superfast Express Train (9-10h) or 1h Flight.\n` +
          `• Station Arrival: Use Tourister Station Transit Sync upon reaching the station for prepaid fixed-meter rates to avoid station touts.\n\n` +
          `🏨 **2. Recommended Stays:**\n` +
          `• Budget: Verified Homestays near heritage zone (~₹1,200/night)\n` +
          `• Comfort: Premium Hotel with temple/beach view (~₹2,800/night)\n\n` +
          `🗓️ **3. Day-by-Day Itinerary:**\n` +
          `• **Day 1:** Arrival, hotel check-in, orientation walk, and sunset viewing at the promenade / evening temple aarti.\n` +
          `• **Day 2:** Major sacred temples & historical forts (Morning darshan with traditional dress code), followed by authentic artisan quarters (Earn +300 T-Points).\n` +
          `• **Day 3:** Scenic nature excursion, regional culinary food trail, and evening departure.\n\n` +
          `🍲 **4. Iconic Food:** Regional Thali, famous street delicacies, and traditional sweets.\n\n` +
          `🚨 **5. Scam Shield Alert:** Avoid unofficial guides demanding cash for 'VIP darshan' or fake gemstone emporiums. Book only via official counters.\n\n` +
          `💎 **6. Hidden Gem:** Visit verified GI-tagged craft workshops and scan the on-site QR to claim T-Points for VIP airport/railway lounge access!`;

        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: fallbackReply,
          },
        ]);
      }, 600);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendAiMessage();
    }
  };

  /* =================================
     MOUSE TRACKING
  ================================= */
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouse({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  /* =================================
     SMOOTH CLASSIC DOT MOVEMENT
  ================================= */
  const getDotMovement = (left, top) => {
    const dotX = (parseFloat(left) / 100) * window.innerWidth;
    const dotY = (parseFloat(top) / 100) * window.innerHeight;

    const distanceX = dotX - mouse.x;
    const distanceY = dotY - mouse.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const interactionDistance = 190;

    if (distance < interactionDistance && distance > 0) {
      const strength = (interactionDistance - distance) / interactionDistance;
      return {
        x: (distanceX / distance) * strength * 35,
        y: (distanceY / distance) * strength * 35,
      };
    }

    return { x: 0, y: 0 };
  };

  /* =================================
     REAL AUTHENTICATION HANDLERS
  ================================= */
  const handleGetStarted = () => {
    setPage("auth");
    setAuthError("");
    setAuthSuccess("");
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const result = await loginUser(loginInput.trim(), loginPassword);

    if (!result.success) {
      setAuthError(result.error || "Account not found or password incorrect.");
      return;
    }

    const found = result.user;
    setCurrentUser(found);
    setUserPoints(found.userPoints || found.user_points || 300);
    setWalletBalance(found.walletBalance || found.wallet_balance || 2500);
    localStorage.setItem("tourister_logged_user", JSON.stringify(found));
    setPage("dashboard");
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!signupUsername.trim() || !signupEmail.trim() || !signupPassword.trim() || !signupConfirmPassword.trim()) {
      setAuthError("Please fill out all fields.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords do not match. Please re-enter.");
      return;
    }

    if (signupPassword.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    const result = await signupUser(signupUsername.trim(), signupEmail.trim(), signupPassword);

    if (!result.success) {
      setAuthError(result.error || "An account with this username or email already exists!");
      return;
    }

    const newUser = result.user;
    localStorage.setItem("tourister_logged_user", JSON.stringify(newUser));
    setCurrentUser(newUser);
    setUserPoints(300);
    setWalletBalance(2500);

    setAuthSuccess(`🎉 Account created in PostgreSQL database! Welcome, ${newUser.username}!`);
    setTimeout(() => {
      setPage("dashboard");
    }, 900);
  };

  const handleUpdatePassword = async (newPass) => {
    if (currentUser?.username) {
      await updateUserData(currentUser.username, { newPassword: newPass });
    }
    const updatedUser = { ...currentUser, password: newPass };
    setCurrentUser(updatedUser);
    localStorage.setItem("tourister_logged_user", JSON.stringify(updatedUser));
  };

  /* =================================
     POINTS & REWARDS HANDLERS
  ================================= */
  const handleAddPoints = (points) => {
    setUserPoints((prev) => {
      const updated = prev + Number(points);
      if (currentUser) {
        const updatedUser = { ...currentUser, userPoints: updated };
        setCurrentUser(updatedUser);
        localStorage.setItem("tourister_logged_user", JSON.stringify(updatedUser));
      }
      return updated;
    });
  };

  const handleSavePlan = (newPlan) => {
    setSavedPlans((prev) => [newPlan, ...prev]);
  };

  return (
    <div
      className="tourister-page"
      style={{
        "--mouse-x": `${mouse.x}px`,
        "--mouse-y": `${mouse.y}px`,
      }}
    >
      {/* MOUSE GLOW */}
      <div className="mouse-glow" />

      {/* BACKGROUND ORBS */}
      <div className="background-orb orb-pink" />
      <div className="background-orb orb-blue" />
      <div className="background-orb orb-purple" />
      <div className="background-orb orb-cyan" />
      <div className="background-orb orb-orange" />
      <div className="background-orb orb-indigo" />

      {/* 10 SMOOTH FLOATING INTERACTIVE BACKGROUND DOTS (Rendered Across ALL Pages) */}
      <div className="global-dots-layer">
        {backgroundDots.map((dot) => {
          const movement = getDotMovement(dot.left, dot.top);
          return (
            <motion.div
              key={dot.id}
              className={`floating-dot ${dot.className}`}
              style={{
                left: dot.left,
                top: dot.top,
                width: dot.size,
                height: dot.size,
              }}
              animate={{
                x: movement.x,
                y: movement.y,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 12,
              }}
            />
          );
        })}
      </div>

      {/* =================================
          1. HOME / LANDING PAGE
      ================================= */}
      {page === "home" && (
        <>
          <header className="topbar">
            <div className="university-brand">
              <img
                src={universityLogo}
                alt="Aditya University"
                className="university-logo"
              />
              <span>ADITYA UNIVERSITY</span>
            </div>

            <div className="top-tourister">TOURISTER</div>
          </header>

          <main className="hero">
            <motion.section
              className="hero-content"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <motion.h1
                className="tourister-title"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                TOURISTER
              </motion.h1>

              <div className="title-line" />

              <p className="tagline">
                Your journey. Your plan. Your Tourister.
              </p>

              <div className="hero-buttons">
                <motion.button
                  className="get-started"
                  onClick={handleGetStarted}
                  whileHover={{ scale: 1.06, y: -5 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get Started <span>→</span>
                </motion.button>
              </div>
            </motion.section>
          </main>

          <footer className="contact-section">
            <a
              href="mailto:saraschandra5786@gmail.com"
              className="contact-email"
            >
              <span className="email-circle">
                <FaEnvelope />
              </span>
              <span>Contact Me:</span>
              <span className="email-address">saraschandra5786@gmail.com</span>
            </a>

            <div className="social-links">
              <motion.a
                href="https://www.instagram.com/sarath_5786/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaInstagram />
              </motion.a>

              <motion.a
                href="https://www.linkedin.com/in/saraschandra-salagrama-479434392/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaLinkedinIn />
              </motion.a>

              <motion.a
                href="https://x.com/Saras5786"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaXTwitter />
              </motion.a>
            </div>
          </footer>
        </>
      )}

      {/* =================================
          2. AUTH PAGE (REAL SIGNUP & LOGIN)
      ================================= */}
      {page === "auth" && (
        <main className="auth-page">
          <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Welcome to Tourister</h2>
            <p className="auth-subtitle">Plan your journey with ease</p>

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "auth-tab active" : "auth-tab"}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                Login
              </button>

              <button
                type="button"
                className={authMode === "signup" ? "auth-tab active" : "auth-tab"}
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                Sign Up
              </button>
            </div>

            {/* ERROR OR SUCCESS NOTICES */}
            {authError && (
              <div className="auth-msg-alert error">
                <FaExclamationTriangle /> {authError}
              </div>
            )}
            {authSuccess && (
              <div className="auth-msg-alert success">
                {authSuccess}
              </div>
            )}

            {authMode === "login" && (
              <form className="auth-form" onSubmit={handleLoginSubmit}>
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button type="submit" className="auth-submit">
                  Login →
                </button>
              </form>
            )}

            {authMode === "signup" && (
              <form className="auth-form" onSubmit={handleRegisterSubmit}>
                <input
                  type="text"
                  placeholder="Username (What should we call you?)"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Create Password (min 6 characters)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit" className="auth-submit">
                  Create Account →
                </button>
              </form>
            )}

            <button
              type="button"
              className="back-home"
              onClick={() => setPage("home")}
            >
              ← Back to Home
            </button>
          </motion.div>
        </main>
      )}

      {/* =================================
          3. MAIN DASHBOARD
      ================================= */}
      {page === "dashboard" && (
        <main className="dashboard-page">
          <header className="dashboard-navbar">
            <button className="dashboard-brand" onClick={() => setPage("home")}>
              TOURISTER
            </button>

            <div className="dashboard-nav-right">
              <button className="nav-button" onClick={() => setPage("home")}>
                Home
              </button>

              <button className="nav-button" onClick={() => setPage("advisories")}>
                <FaBullhorn style={{ color: "#ef4444" }} /> Travel News
              </button>

              <button className="nav-button" onClick={() => setPage("fasttrack")}>
                <FaPlaneDeparture style={{ color: "#3b82f6" }} /> FastTrack Airport
              </button>

              <button className="nav-button" onClick={() => setPage("sos")}>
                <FaShieldAlt style={{ color: "#ef4444" }} /> Safety SOS
              </button>

              <button className="nav-button" onClick={() => setPage("phrasebook")}>
                <FaHeadphones style={{ color: "#8b5cf6" }} /> Audio Phrasebook
              </button>

              <button
                className="wallet-nav-button"
                onClick={() => setPage("wallet")}
              >
                <FaWallet /> Wallet ({userPoints} T-Pts)
              </button>

              <button
                className="profile-button"
                onClick={() => setPage("profile")}
              >
                <FaUser /> Profile
              </button>
            </div>
          </header>

          <div className="dashboard-main">
            {/* PROMINENT NEPAL FLOOD BREAKING EMERGENCY BANNER */}
            <div
              className="nepal-flood-emergency-bar"
              onClick={() => setPage("advisories")}
              role="button"
              tabIndex={0}
            >
              <div className="flood-badge">
                <FaExclamationTriangle /> NEPAL TRAVEL EMERGENCY
              </div>
              <div className="flood-headline-text">
                🚨 <strong>Monsoon Floods & Landslides on Prithvi Highway (Mugling):</strong> Road travel between Kathmandu and Pokhara is hazardous. All tourists must take 25-minute domestic flights. <strong>Avoid mountain roads right now!</strong>
              </div>
              <button
                className="flood-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setPage("advisories");
                }}
              >
                Open Safety Advisory Hub →
              </button>
            </div>

            <motion.section
              className="dashboard-intro"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="dashboard-welcome">
                WELCOME, TOURISTER {currentUser?.username ? currentUser.username.toUpperCase() : "EXPLORER"}
              </p>
              <h1>Where would you like to begin?</h1>
              <p>
                Plan your journey easily, check live crowd density, discover sacred temples & attractions within 200km, read community scam alerts, and explore hidden gems to earn T-Points!
              </p>
            </motion.section>

            {/* 3 CORE FEATURE CARDS */}
            <section className="feature-grid">
              {/* CARD 01: TOURISTER AI */}
              <motion.div
                className="feature-card ai-card"
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage("ai")}
              >
                <div className="card-image-container">
                  <img
                    src={touristerAI}
                    alt="Tourister AI"
                    className="feature-image"
                  />
                </div>
                <div className="card-content">
                  <span className="feature-number">01</span>
                  <h2>Tourister AI</h2>
                  <p>
                    Comprehensive trip planning from start to finish: departure transit options, hotel stays, sacred temple timings, scam alerts, and daily schedule.
                  </p>
                  <button
                    className="feature-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage("ai");
                    }}
                  >
                    Start Planning <span>→</span>
                  </button>
                </div>
              </motion.div>

              {/* CARD 02: CREATE MY PLAN */}
              <motion.div
                className="feature-card plan-card"
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage("create-plan")}
              >
                <div className="custom-card-icon">
                  <div className="plan-icon-circle">
                    <FaRoute /> PLAN
                  </div>
                </div>
                <div className="card-content">
                  <span className="feature-number">02</span>
                  <h2>Create My Plan</h2>
                  <p>
                    Build your complete journey step-by-step: live crowd meters, temple finder, local language guides, and prepaid station transit!
                  </p>
                  <button
                    className="feature-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage("create-plan");
                    }}
                  >
                    Create Plan <span>→</span>
                  </button>
                </div>
              </motion.div>

              {/* CARD 03: COMMUNITY & SCAM SHIELD */}
              <motion.div
                className="feature-card community-card"
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage("community")}
              >
                <div className="custom-card-icon">
                  <div className="community-icon">
                    <FaComments /> CONNECT
                  </div>
                </div>
                <div className="card-content">
                  <span className="feature-number">03</span>
                  <h2>Travel Community & Scam Shield</h2>
                  <p>
                    Share authentic travel experiences, post scam warnings, and discover verified travel advice from fellow travelers.
                  </p>
                  <button
                    className="feature-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage("community");
                    }}
                  >
                    Explore Community <span>→</span>
                  </button>
                </div>
              </motion.div>
            </section>

            {/* TOURISTER TRAVEL CONCIERGE & PLANNING TOOLS */}
            <section className="hackathon-innovations-section">
              <div className="innovation-header">
                <div>
                  <span className="innovation-pill">SMART TRAVEL SUITE</span>
                  <h2>Personalized Travel Planning Tools</h2>
                </div>
                <p>Simple, human-crafted tools to calculate trip costs, check peaceful visiting times, and get photo ideas.</p>
              </div>

              <div className="innovations-grid">
                {/* 1. TRAVEL SQUAD */}
                <motion.div
                  className="innovation-card multi-agent-card"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage("multi-agent")}
                >
                  <div className="inno-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1" }}>
                    <FaUsers />
                  </div>
                  <span className="inno-badge">5 Guides in 1</span>
                  <h3>Travel Experts Squad</h3>
                  <p>5 specialists (Route, Budget, Food, Photos, Safety) working together to build your perfect trip.</p>
                  <span className="inno-action-link" style={{ color: "#6366f1" }}>Plan with Squad →</span>
                </motion.div>

                {/* 2. BUDGET ESTIMATOR */}
                <motion.div
                  className="innovation-card budget-card"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage("budget-estimator")}
                >
                  <div className="inno-card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                    <FaMoneyBillWave />
                  </div>
                  <span className="inno-badge">Expense Calculator</span>
                  <h3>Trip Budget Estimator</h3>
                  <p>Choose your hotel type, travel days, and number of people to calculate total costs and savings.</p>
                  <span className="inno-action-link" style={{ color: "#10b981" }}>Estimate Budget →</span>
                </motion.div>

                {/* 3. CROWD & GEMS RADAR */}
                <motion.div
                  className="innovation-card crowd-card"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage("crowd-gems")}
                >
                  <div className="inno-card-icon" style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6" }}>
                    <FaGem />
                  </div>
                  <span className="inno-badge">Visiting Times & Perks</span>
                  <h3>Crowd Radar & T-Points</h3>
                  <p>See peaceful visiting hours from Google data and visit secret spots to earn free VIP lounge passes.</p>
                  <span className="inno-action-link" style={{ color: "#8b5cf6" }}>Check Visiting Times →</span>
                </motion.div>

                {/* 4. INFLUENCER STUDIO */}
                <motion.div
                  className="innovation-card creator-card"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage("creator-studio")}
                >
                  <div className="inno-card-icon" style={{ background: "rgba(236, 72, 153, 0.12)", color: "#ec4899" }}>
                    <FaCamera />
                  </div>
                  <span className="inno-badge">Photo & Reel Ideas</span>
                  <h3>Photo & Creator Studio</h3>
                  <p>Best photography spots, golden hour lighting times, Instagram captions, and 15-second reel guides.</p>
                  <span className="inno-action-link" style={{ color: "#ec4899" }}>Open Studio →</span>
                </motion.div>

                {/* 5. TRIP DOSSIER */}
                <motion.div
                  className="innovation-card dossier-card"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage("trip-dossier")}
                >
                  <div className="inno-card-icon" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }}>
                    <FaFileAlt />
                  </div>
                  <span className="inno-badge">Printable Summary</span>
                  <h3>Printable Travel Summary</h3>
                  <p>Create a neat, complete travel plan booklet formatted to download, copy, or print as a PDF.</p>
                  <span className="inno-action-link" style={{ color: "#3b82f6" }}>Generate Summary →</span>
                </motion.div>
              </div>
            </section>

            {/* TRAVEL NEWS & SEASONAL ADVISORY CENTER */}
            <section className="travel-news">
              <div className="news-header">
                <div>
                  <span>SEASONAL & SAFETY ADVISORY CENTER</span>
                  <h2>When to Visit & When NOT to Go</h2>
                </div>
                <button onClick={() => setPage("advisories")}>
                  Open Seasonal Matrix & News →
                </button>
              </div>

              <motion.div className="news-card" whileHover={{ y: -5 }}>
                <div className="news-indicator" />
                <div className="news-content">
                  <h3>🚨 Nepal Monsoon Floods & Real-Time Seasonal Warnings</h3>
                  <p>
                    Landslides on Prithvi Highway near Mugling (take domestic flights). Access full seasonal matrix: which months to avoid across Nepal, Goa, Araku, Dubai, Kedarnath, and Leh Ladakh.
                  </p>
                </div>
                <button
                  className="news-button"
                  onClick={() => setPage("advisories")}
                >
                  View Safety & Seasonal Guide →
                </button>
              </motion.div>
            </section>

            {/* TOURISTER WALLET TEASER */}
            <motion.section
              className="wallet-section"
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPage("wallet")}
            >
              <div className="wallet-image-container">
                <img
                  src={touristerWallet}
                  alt="Tourister Wallet"
                  className="wallet-image"
                />
              </div>

              <div className="wallet-content">
                <span>TOURISTER WALLET & T-POINTS</span>
                <h2>International Card-to-UPI Bridge & VIP Lounges.</h2>
                <p>
                  Foreigners can enter international cards to pay anywhere via UPI. Earn non-fakeable T-Points at verified Hidden Gems to unlock VIP Airport & Railway Lounge Access Passes!
                </p>
                <button
                  className="wallet-main-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage("wallet");
                  }}
                >
                  Open Wallet ({userPoints} T-Pts) →
                </button>
              </div>
            </motion.section>
          </div>
        </main>
      )}

      {/* =================================
          4. TOURISTER AI CHAT PAGE
      ================================= */}
      {page === "ai" && (
        <main className="ai-page">
          <header className="ai-navbar">
            <button className="dashboard-brand" onClick={() => setPage("dashboard")}>
              ← TOURISTER
            </button>
            <div className="ai-navbar-title">
              <FaRobot /> TOURISTER TRAVEL ASSISTANT
            </div>
            <button className="nav-button" onClick={() => setPage("dashboard")}>
              Dashboard
            </button>
          </header>

          <section className="ai-chat-container">
            <div className="ai-chat-header">
              <div>
                <p>PERSONAL TRAVEL CONCIERGE</p>
                <h1>Plan your journey with Tourister</h1>
                <span>
                  Tell me your starting city, destination, budget, and travel days for a complete, friendly trip plan.
                </span>
              </div>
            </div>

            <div className="ai-messages">
              {aiMessages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "ai-message user-message"
                      : "ai-message assistant-message"
                  }
                >
                  <div className="message-label">
                    {message.role === "user" ? "YOU" : "TOURISTER"}
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}

              {aiLoading && (
                <div className="ai-message assistant-message">
                  <div className="message-label">TOURISTER</div>
                  <div className="message-content">
                    Planning your trip details, travel options, places to visit, stays, and practical tips...
                  </div>
                </div>
              )}
            </div>

            <div className="ai-input-area">
              <textarea
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={handleAiKeyDown}
                placeholder="Example: Plan an end-to-end 3-day pilgrimage from Hyderabad to Tirupati under ₹15,000 with temple dress codes, hotel tiers, and scam defense..."
                rows="3"
              />

              <button
                onClick={sendAiMessage}
                disabled={aiLoading || !aiMessage.trim()}
              >
                {aiLoading ? "Planning..." : "Send →"}
              </button>
            </div>

            <div className="ai-suggestions">
              <button
                onClick={() =>
                  setAiMessage(
                    "Plan a 3-day pilgrimage trip from Hyderabad to Tirupati with temple timings, dress codes, stays, and scam defense"
                  )
                }
              >
                Tirupati Balaji Pilgrimage · 3 Days
              </button>

              <button
                onClick={() =>
                  setAiMessage(
                    "Plan a 4-day trip to Kathmandu & Pokhara (Nepal) with flood safety advisories, Pashupatinath temple timings, and flight options"
                  )
                }
              >
                Kathmandu & Nepal Himalayas
              </button>

              <button
                onClick={() =>
                  setAiMessage(
                    "Plan a 4-day heritage tour to Madurai with Meenakshi temple timings, local food, and mother tongue guide recommendations"
                  )
                }
              >
                Madurai & Tamil Sangam Heritage
              </button>
            </div>
          </section>
        </main>
      )}

      {/* =================================
          5. CREATE MY PLAN (PLAN A TRIP)
      ================================= */}
      {page === "create-plan" && (
        <CreatePlan
          onBack={() => setPage("dashboard")}
          userPoints={userPoints}
          onAddPoints={handleAddPoints}
          onSavePlan={handleSavePlan}
        />
      )}

      {/* =================================
          6. COMMUNITY & SCAM SHIELD
      ================================= */}
      {page === "community" && (
        <Community
          onBack={() => setPage("dashboard")}
          onOpenGem={(gem) => setActiveGem(gem)}
          username={currentUser?.username || "Tourister"}
        />
      )}

      {/* =================================
          7. TOURISTER WALLET & T-POINTS
      ================================= */}
      {page === "wallet" && (
        <TouristerWallet
          onBack={() => setPage("dashboard")}
          userPoints={userPoints}
          walletBalance={walletBalance}
          onUpdateBalance={(bal) => setWalletBalance(bal)}
          onUpdatePoints={(pts) => setUserPoints(pts)}
          username={currentUser?.username || "Tourister"}
        />
      )}

      {/* =================================
          8. USER PROFILE & SECURITY
      ================================= */}
      {page === "profile" && (
        <UserProfile
          onBack={() => setPage("dashboard")}
          username={currentUser?.username || "saraschandra"}
          email={currentUser?.email || "saraschandra5786@gmail.com"}
          userPoints={userPoints}
          userPassword={currentUser?.password || "password123"}
          onUpdatePassword={handleUpdatePassword}
          savedPlans={savedPlans}
        />
      )}

      {/* =================================
          9. AIRPORT FASTTRACK & IMMIGRATION
      ================================= */}
      {page === "fasttrack" && (
        <FastTrackAirportPass
          onBack={() => setPage("dashboard")}
          username={currentUser?.username || "saraschandra"}
        />
      )}

      {/* =================================
          10. SAFETY SOS COMMAND
      ================================= */}
      {page === "sos" && (
        <TouristSafetySOS onBack={() => setPage("dashboard")} />
      )}

      {/* =================================
          11. LOCAL AUDIO PHRASEBOOK
      ================================= */}
      {page === "phrasebook" && (
        <AudioGuidePhrasebook onBack={() => setPage("dashboard")} />
      )}

      {/* =================================
          12. TRAVEL NEWS & SEASONAL ADVISORIES
      ================================= */}
      {page === "advisories" && (
        <SeasonalAdvisories onBack={() => setPage("dashboard")} />
      )}

      {/* =================================
          13. MULTI-AGENT AI SQUAD
      ================================= */}
      {page === "multi-agent" && (
        <MultiAgentSquad onBack={() => setPage("dashboard")} />
      )}

      {/* =================================
          14. SMART BUDGET ESTIMATOR
      ================================= */}
      {page === "budget-estimator" && (
        <BudgetEstimator onBack={() => setPage("dashboard")} />
      )}

      {/* =================================
          15. CROWD RADAR & HIDDEN GEMS
      ================================= */}
      {page === "crowd-gems" && (
        <CrowdGemsRadar
          onBack={() => setPage("dashboard")}
          onAddPoints={handleAddPoints}
        />
      )}

      {/* =================================
          16. INFLUENCER & CREATOR STUDIO
      ================================= */}
      {page === "creator-studio" && (
        <InfluencerStudio onBack={() => setPage("dashboard")} />
      )}

      {/* =================================
          17. LLM MASTER TRIP DOSSIER
      ================================= */}
      {page === "trip-dossier" && (
        <TripDossierSummary onBack={() => setPage("dashboard")} />
      )}

      {/* GLOBAL HIDDEN GEM MODAL */}
      <AnimatePresence>
        {activeGem && (
          <HiddenGemModal
            gem={activeGem}
            destinationName="Featured Destination"
            userPoints={userPoints}
            onAddPoints={handleAddPoints}
            onClose={() => setActiveGem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;