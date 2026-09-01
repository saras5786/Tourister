import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { puter } from "@heyputer/puter.js";
import {
  FaRoute,
  FaMoneyBillWave,
  FaUtensils,
  FaCamera,
  FaShieldAlt,
  FaUsers,
  FaPaperPlane,
  FaCopy,
  FaCheck,
  FaRedo,
  FaBolt,
  FaCompass,
} from "react-icons/fa";
import "./MultiAgentSquad.css";

const SQUAD_EXPERTS = [
  {
    id: "squad",
    name: "Full Travel Squad (All-in-One)",
    role: "5 Specialists Collaborating",
    icon: FaUsers,
    color: "#6366f1",
    badge: "5 Experts in 1",
    welcome:
      "Hello! We are your 5-in-1 Travel Squad. Ask us any general travel question or specify any destination to get an integrated plan!",
    quickPrompts: [
      "Plan a balanced 3-day itinerary with timings and expense estimates",
      "Best travel packing and preparation checklist for a weekend getaway",
      "Family vacation tips with kids and elderly parents",
      "How to travel comfortably on a budget under ₹15,000",
    ],
  },
  {
    id: "itinerary",
    name: "Schedule & Route Planner",
    role: "Timing & Daily Itinerary",
    icon: FaRoute,
    color: "#3b82f6",
    badge: "Route Guide",
    welcome:
      "I help you structure daily itineraries, travel timings, sightseeing hours, and queue-beating strategies for any trip.",
    quickPrompts: [
      "How to plan a 3-day trip with zero fatigue and smooth pacing",
      "Top strategies to beat long queues at famous landmarks",
      "Arriving late night at 11:00 PM - what are the best transit steps?",
      "How to do an efficient 1-Day express city tour",
    ],
  },
  {
    id: "budget",
    name: "Budget & Expense Guide",
    role: "Cost Breakdown & Savings",
    icon: FaMoneyBillWave,
    color: "#10b981",
    badge: "Money Guide",
    welcome:
      "I calculate realistic travel costs for stays, transport, and dining, and share proven ways to save up to 40% on expenses.",
    quickPrompts: [
      "Top 5 proven tips to cut 30% from overall trip costs",
      "Cost breakdown comparison: Flight vs Train vs Road trip",
      "How to budget for a group of 4 to 6 people",
      "How to spot and avoid hidden tourist fees and booking surcharges",
    ],
  },
  {
    id: "foodie",
    name: "Local Food & Culture Guide",
    role: "Famous Dishes & Crafts",
    icon: FaUtensils,
    color: "#f59e0b",
    badge: "Food & Heritage",
    welcome:
      "I guide you to authentic regional dishes, authentic local eateries where residents eat, and verified artisan markets.",
    quickPrompts: [
      "How to find authentic local food spots that locals actually eat at",
      "Pure vegetarian & dietary safety guide when traveling",
      "How to identify authentic handmade artisan crafts and souvenirs",
      "Street food hygiene rules to avoid traveler stomach issues",
    ],
  },
  {
    id: "influencer",
    name: "Photo & Social Media Guide",
    role: "Best Photo Spots & Captions",
    icon: FaCamera,
    color: "#ec4899",
    badge: "Photos & Reels",
    welcome:
      "I help you find scenic photo viewpoints, golden hour sunlight angles, viral 15-second reel scripts, and aesthetic captions.",
    quickPrompts: [
      "Best golden hour sunset photo tips and camera framing angles",
      "15-second viral travel reel storyboard script structure",
      "3 aesthetic travel Instagram captions with engaging hooks",
      "How to shoot clean travel photos with zero crowds in the frame",
    ],
  },
  {
    id: "safety",
    name: "Safety & Scam Helper",
    role: "Scam Alerts & Travel Tips",
    icon: FaShieldAlt,
    color: "#ef4444",
    badge: "Safety Guardian",
    welcome:
      "I keep you informed about common transit scams, fair taxi/auto meter practices, nighttime safety, and emergency protocols.",
    quickPrompts: [
      "Top 3 common tourist scams at airport & railway station exits",
      "How to ensure fair auto & cab meter rates in any city",
      "Nighttime solo traveler safety precautions and rules",
      "Essential emergency travel kit and emergency SOS helplines",
    ],
  },
];

function MultiAgentSquad({ onBack }) {
  const [activeExpertId, setActiveExpertId] = useState("squad");
  const [destination, setDestination] = useState("");
  const [source, setSource] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const selectedExpert =
    SQUAD_EXPERTS.find((a) => a.id === activeExpertId) || SQUAD_EXPERTS[0];
  const currentMessages = chatHistories[activeExpertId] || [
    { role: "assistant", content: selectedExpert.welcome },
  ];

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendMessage = async (userText) => {
    const textToSend = userText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const newHistory = [
      ...currentMessages,
      { role: "user", content: textToSend.trim() },
    ];

    setChatHistories((prev) => ({
      ...prev,
      [activeExpertId]: newHistory,
    }));
    setInputQuery("");
    setLoading(true);

    const isSquad = activeExpertId === "squad";
    const destContext = destination.trim()
      ? `for destination: "${destination.trim()}" (from: "${source.trim() || "any city"}")`
      : "in general (or for any travel destination)";

    try {
      let promptSystem = "";
      if (isSquad) {
        promptSystem = `You are the Tourister 5-in-1 Travel Concierge Squad providing travel advice ${destContext}.
Provide a clean, human, friendly response combining all 5 perspectives:
1. 🧳 Schedule & Route Timings
2. 💰 Estimated Expenses & Savings
3. 🍲 Local Food & Heritage Culture
4. 📸 Best Photo Spots, Angles & Captions
5. 🛡️ Safety, Fair Transit Rates & Scams to Avoid
If no specific destination is provided, provide universal travel wisdom and practical guidelines. Keep language simple, natural, and helpful.`;
      } else {
        promptSystem = `You are the Tourister ${selectedExpert.name} (${selectedExpert.role}) giving travel advice ${destContext}.
Provide helpful, friendly, and practical advice strictly matching your domain of expertise. If no specific destination is provided, answer in general with universal best practices. Keep words simple, clear, and actionable.`;
      }

      let reply = "";

      // 1. Primary Engine: Puter GPT-5.6-Luna
      try {
        const messages = [
          { role: "system", content: promptSystem },
          { role: "user", content: textToSend },
        ];
        const response = await puter.ai.chat(messages, {
          model: "openai/gpt-5.6-luna",
          reasoning_effort: "low",
        });
        reply = response?.message?.content || response?.text || "";
      } catch (e) {
        console.warn("Puter AI notice:", e);
      }

      // 2. Secondary Engine: Pollinations AI
      if (!reply) {
        try {
          const fullPrompt = `${promptSystem}\nUser Question: ${textToSend}`;
          const url = `https://text.pollinations.ai/${encodeURIComponent(
            fullPrompt
          )}?seed=${Date.now()}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) {
            reply = await res.text();
          }
        } catch (err) {
          console.warn("Pollinations call note:", err);
        }
      }

      // 3. Dynamic context-aware fallback (never hardcodes Tirupati)
      if (!reply) {
        reply = getDynamicExpertFallback(
          activeExpertId,
          source.trim(),
          destination.trim(),
          textToSend
        );
      }

      setChatHistories((prev) => ({
        ...prev,
        [activeExpertId]: [
          ...newHistory,
          { role: "assistant", content: reply },
        ],
      }));
    } catch (err) {
      console.warn("Generating response error:", err);
      setChatHistories((prev) => ({
        ...prev,
        [activeExpertId]: [
          ...newHistory,
          {
            role: "assistant",
            content: getDynamicExpertFallback(
              activeExpertId,
              source.trim(),
              destination.trim(),
              textToSend
            ),
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  const getDynamicExpertFallback = (expertId, src, dest, query) => {
    const place = dest || (query.match(/(?:in|at|to|for)\s+([A-Za-z]+)/i)?.[1]) || "Your Destination";
    const isGeneral = !dest && place === "Your Destination";

    if (expertId === "squad") {
      return `### 🗺️ TOURISTER 5-IN-1 TRAVEL MASTERPLAN
${dest ? `Destination: ${dest} | ` : ""}Query: "${query}"

1. 🧳 SCHEDULE & ROUTE TIMINGS:
• Schedule main outdoor sights in early morning (07:00 AM - 09:30 AM) to enjoy pleasant weather and beat long queues.
• Reserve mid-afternoon (01:00 PM - 03:30 PM) for indoor museums, heritage galleries, or dining.
• Enjoy evening strolls at viewpoints during sunset (05:30 PM - 06:30 PM).

2. 💰 BUDGET & EXPENSE MANAGEMENT:
• Stays: Look for verified boutique homestays or 3-star comfort hotels 1-2 km from city center (~30% savings).
• Transit: Use pre-calculated public transit, metro, or official prepaid auto counters.
• Dining: Eat at established regional family messes for authentic unlimited meals at affordable prices.

3. 🍲 LOCAL FOOD & CULTURAL EXPERIENCES:
• Ask locals: "Where do families go for traditional breakfast?" rather than relying on tourist reviews.
• Seek out GI-tagged artisan handloom weaving clusters or craft workshops.

4. 📸 PHOTO SPOTS & CAPTIONS:
• Golden Hour: Shoot 30 minutes before sunset with warm backlighting.
• Caption: "Collecting moments and timeless memories ${dest ? `in ${dest}` : "on the road"} ✨"

5. 🛡️ SAFETY & SCAM DEFENSE:
• Always insist on fixed meter or pre-agreed rates before getting into autos/taxis.
• Emergency Help: Police: 112 | Medical: 108 | National Tourist Helpline: 1363.`;
    }

    if (expertId === "itinerary") {
      return `### 🧳 SCHEDULE & ROUTE PLANNING TIPS ${dest ? `FOR ${dest.toUpperCase()}` : ""}:
• Morning Window (06:30 AM - 09:00 AM): Best hours for main monuments and outdoor attractions with minimal crowd.
• Afternoon (01:00 PM - 04:00 PM): Ideal for air-conditioned museums, heritage art galleries, or leisurely regional lunch.
• Golden Sunset (05:30 PM - 07:30 PM): Scenic viewpoints, lakesides, or evening promenade walks.
• Pro-Tip: Group attractions geographically by neighborhood to eliminate unnecessary back-and-forth travel.`;
    }

    if (expertId === "budget") {
      return `### 💰 MONEY-SAVING STRATEGIES ${dest ? `FOR ${dest.toUpperCase()}` : ""}:
• Accommodation: Book accommodations with included breakfast and free cancellation 2-3 weeks in advance.
• Transport: Opt for AC trains or verified outstation buses over last-minute flight surges.
• Dining: Lunch at iconic heritage eateries and traditional messes to enjoy authentic thalis under ₹150-250.
• Sightseeing: Check for composite city entry passes that cover multiple heritage monuments at discounted bundle rates.`;
    }

    if (expertId === "foodie") {
      return `### 🍲 LOCAL FOOD & CULINARY GUIDE ${dest ? `FOR ${dest.toUpperCase()}` : ""}:
• Authentic Eats: Look for long lines of local residents at traditional breakfast spots serving piping hot specialties.
• Hygiene Rule: Always choose stalls with high turnover where food is freshly cooked and steaming hot.
• Artisan Heritage: Explore traditional craft quarters and government emporiums for certified regional souvenirs.`;
    }

    if (expertId === "influencer") {
      return `### 📸 PHOTO & CREATOR GUIDE ${dest ? `FOR ${dest.toUpperCase()}` : ""}:
• Golden Hour Timing: 05:30 PM - 06:15 PM. Use 1x or 2x optical zoom at eye-level with the sun slightly behind your subject.
• Reel Hook (0-3s): "Here is the secret spot ${dest ? `in ${dest}` : "everyone misses"} that feels like a movie scene!"
• Aesthetic Caption: "Finding serenity in the hidden corners ${dest ? `of ${dest}` : "of the world"} ✨ #TravelDiaries #Wanderlust"
• Clean Framing: Shoot from low angles pointing slightly upwards to keep ground-level crowds out of your frame.`;
    }

    return `### 🛡️ TRAVEL SAFETY & SCAM DEFENSE ${dest ? `FOR ${dest.toUpperCase()}` : ""}:
• Transit Scam Defense: Avoid airport/station touts approaching inside arrival halls. Only board from official prepaid taxi/auto booths.
• Meter Verification: Always confirm "Meter please" or verify the route on your map before starting the journey.
• Night Safety: Stick to well-lit main boulevards after 10:00 PM and share your live ride status with friends/family.
• Emergency Helplines: Police: 112 | Medical: 108 | Tourist Helpline: 1363.`;
  };

  return (
    <main className="multi-agent-page">
      {/* NAVBAR */}
      <header className="multi-agent-navbar">
        <button className="nav-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="nav-title-group">
          <FaUsers className="nav-icon" />
          <span>TOURISTER TRAVEL EXPERTS STUDIO</span>
        </div>
        <div className="squad-active-pill">
          <span>● 5 Specialists Online</span>
        </div>
      </header>

      <div className="multi-agent-container">
        {/* HERO SECTION */}
        <section className="multi-agent-hero">
          <div className="framework-pill">
            <FaBolt /> INTERACTIVE TRAVEL TEAM
          </div>
          <h1>
            Your Personal <span>Travel Concierge Squad</span>
          </h1>
          <p>
            Ask general travel questions or enter any destination to get customized scheduling, budget savings, food spots, photo angles, and safety advice.
          </p>

          <div className="squad-quick-controls">
            <div className="dest-input-pill">
              <label>FROM:</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Starting City (optional)"
              />
            </div>
            <div className="dest-input-pill">
              <label>TO:</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Any Destination (or leave blank for general advice)"
              />
            </div>
          </div>
        </section>

        {/* AGENTS CAROUSEL SELECTOR */}
        <div className="agent-selector-grid">
          {SQUAD_EXPERTS.map((expert) => {
            const Icon = expert.icon;
            const isActive = activeExpertId === expert.id;
            return (
              <motion.button
                key={expert.id}
                className={`agent-tab-card ${isActive ? "active" : ""}`}
                style={{ "--agent-color": expert.color }}
                onClick={() => setActiveExpertId(expert.id)}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="agent-card-top">
                  <div
                    className="agent-icon-box"
                    style={{
                      background: `${expert.color}18`,
                      color: expert.color,
                    }}
                  >
                    <Icon />
                  </div>
                  <span className="agent-badge">{expert.badge}</span>
                </div>
                <h3>{expert.name}</h3>
                <span className="agent-role">{expert.role}</span>
              </motion.button>
            );
          })}
        </div>

        {/* LIVE CONVERSATION CONSOLE */}
        <div className="squad-console-card">
          <div
            className="console-header"
            style={{ borderLeftColor: selectedExpert.color }}
          >
            <div className="console-agent-title">
              <div
                className="agent-avatar-circle"
                style={{ background: selectedExpert.color }}
              >
                <selectedExpert.icon />
              </div>
              <div>
                <h3>{selectedExpert.name}</h3>
                <span>
                  {selectedExpert.role} ·{" "}
                  {destination.trim()
                    ? `Ready for ${destination.trim()}`
                    : "Ready for any destination & general travel advice"}
                </span>
              </div>
            </div>

            <div className="console-actions">
              <button
                className="clear-chat-btn"
                onClick={() =>
                  setChatHistories((prev) => ({
                    ...prev,
                    [activeExpertId]: [
                      { role: "assistant", content: selectedExpert.welcome },
                    ],
                  }))
                }
              >
                <FaRedo /> Reset Chat
              </button>
            </div>
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="quick-chips-row">
            <span>Quick Suggestions:</span>
            {selectedExpert.quickPrompts.map((prompt, i) => (
              <button
                key={i}
                className="chip-btn"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* MESSAGES THREAD */}
          <div className="console-messages-box">
            {currentMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`console-msg ${
                  msg.role === "user" ? "user-msg" : "assistant-msg"
                }`}
              >
                <div className="msg-avatar-tag">
                  {msg.role === "user" ? "YOU" : selectedExpert.name.toUpperCase()}
                </div>
                <div className="msg-bubble">
                  <pre className="msg-text-content">{msg.content}</pre>
                  {msg.role === "assistant" && idx > 0 && (
                    <button
                      className="msg-copy-btn"
                      onClick={() =>
                        handleCopy(msg.content, `${activeExpertId}-${idx}`)
                      }
                    >
                      {copiedKey === `${activeExpertId}-${idx}` ? (
                        <>
                          <FaCheck /> Copied
                        </>
                      ) : (
                        <>
                          <FaCopy /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="console-msg assistant-msg">
                <div className="msg-avatar-tag">
                  {selectedExpert.name.toUpperCase()}
                </div>
                <div className="msg-bubble thinking-bubble">
                  <span className="dot-pulse" />
                  <span>
                    {selectedExpert.name} is{" "}
                    {destination.trim()
                      ? `creating customized recommendations for ${destination.trim()}...`
                      : "preparing travel advice..."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* INPUT BAR */}
          <div className="console-input-bar">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                destination.trim()
                  ? `Ask ${selectedExpert.name} anything about ${destination.trim()}...`
                  : `Ask ${selectedExpert.name} any travel question...`
              }
            />
            <button
              className="send-msg-btn"
              style={{ background: selectedExpert.color }}
              onClick={() => handleSendMessage()}
              disabled={loading || !inputQuery.trim()}
            >
              <FaPaperPlane /> Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default MultiAgentSquad;
