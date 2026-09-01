import { useState } from "react";
import { motion } from "framer-motion";
import { puter } from "@heyputer/puter.js";
import {
  FaFileAlt,
  FaCopy,
  FaCheck,
  FaMagic,
  FaPrint,
} from "react-icons/fa";
import { exportDossierToPDF } from "../services/pdfService";
import "./TripDossierSummary.css";

function TripDossierSummary({ onBack }) {
  const [destination, setDestination] = useState("Tirupati");
  const [origin, setOrigin] = useState("Hyderabad");
  const [days, setDays] = useState("3");
  const [travelers, setTravelers] = useState("2");
  const [loading, setLoading] = useState(false);
  const [dossierText, setDossierText] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateDossier = async () => {
    setLoading(true);
    try {
      const prompt = `Act as the Tourister Travel Guide. Write a clean, well-formatted, friendly travel plan summary for:
- Origin: ${origin}
- Destination: ${destination}
- Duration: ${days} Days
- Travelers: ${travelers} People

Include these 6 simple, friendly sections:
1. 📋 TRIP OVERVIEW & TRAVEL OPTIONS (Best trains/flights, departure timing, travel hours)
2. 🗓️ DAY-BY-DAY SCHEDULE (Morning, Afternoon, Evening plan with temple timings and dress codes)
3. 💰 ESTIMATED EXPENSE TABLE (Hotel stay, travel, meals, passes, total in INR)
4. 📸 BEST PHOTO SPOTS & CAPTIONS (Golden hour time, best photo spots, simple caption)
5. 🎒 PACKING & ESSENTIALS CHECKLIST (Temple dress, walking sandals, cash reminder)
6. 🛡️ SAFETY & HELPFUL CONTACTS (Scams to avoid, auto tips, police helpline: 112, tourist helpline: 1363)

Keep the language clean, friendly, easy to read, and ready to print as a PDF.`;

      const response = await puter.ai.chat(
        [{ role: "user", content: prompt }],
        {
          model: "openai/gpt-5.6-luna",
          tools: [{ type: "web_search" }],
          reasoning_effort: "medium",
        }
      );

      const reply = response?.message?.content || response?.text;
      setDossierText(reply);
    } catch (e) {
      console.warn("Dossier fallback:", e);
      setDossierText(`=======================================================
🏛️ TOURISTER — OFFICIAL TRAVEL PLAN & SUMMARY
=======================================================
FROM: ${origin} ➔ TO: ${destination}
DURATION: ${days} Days | TRAVELERS: ${travelers} Persons
STATUS: Complete Travel Plan Ready

-------------------------------------------------------
1. 📋 TRIP OVERVIEW & TRAVEL OPTIONS
-------------------------------------------------------
• Recommended Transit: Morning Superfast Express Train (06:00 AM) or 1h direct flight.
• Arrival Station: Central Junction. Use official prepaid auto booth to avoid station touts.
• Best Place to Stay: Central city area within 2km of main attractions.

-------------------------------------------------------
2. 🗓️ DAY-BY-DAY SCHEDULE
-------------------------------------------------------
• DAY 1: Arrival, check into hotel, relax, take an evening stroll, and visit the sunset viewpoint or evening prayers.
• DAY 2: Major temples & sightseeing (Traditional Indian dress code). Afternoon visit to local artisan handloom shops (Earn +300 T-Points).
• DAY 3: Scenic nature excursion, regional culinary food trail, and evening departure back to ${origin}.

-------------------------------------------------------
3. 💰 ESTIMATED EXPENSES (FOR ${travelers} TRAVELERS)
-------------------------------------------------------
• Hotel Stay (${days} Nights): ₹${1800 * Number(days)}
• Travel Tickets (Roundtrip): ₹${1200 * Number(travelers) * 2}
• Local Autos & Cabs: ₹${500 * Number(days)}
• Meals & Snacks: ₹${450 * Number(travelers) * Number(days)}
• Entry Passes: ₹800
• Emergency Buffer: ₹1,000
• TOTAL ESTIMATE: ₹${(1800 * Number(days) + 2400 * Number(travelers) + 500 * Number(days) + 450 * Number(travelers) * Number(days) + 1800).toLocaleString("en-IN")}

-------------------------------------------------------
4. 📸 BEST PHOTO SPOTS & CAPTIONS
-------------------------------------------------------
• Best Photography Time: 05:30 PM - 06:15 PM (Golden Sunset Light)
• Caption: "Lost in the peaceful charm of ${destination} ✨ So grateful for these memories!"
• Hashtags: #${destination}Travel #Tourister #IncredibleIndia #TravelDiaries

-------------------------------------------------------
5. 🎒 PACKING CHECKLIST
-------------------------------------------------------
[x] Traditional temple clothing (Dhoti / Saree / Kurta)
[x] Comfortable walking shoes
[x] Physical Cash (₹2,000 in notes for small shops)
[x] Tourister QR scanner to earn T-Points

-------------------------------------------------------
6. 🛡️ SAFETY & EMERGENCY CONTACTS
-------------------------------------------------------
• Tip: Always book entry passes through official counters.
• Police Helpline: 112 | Tourist Helpline: 1363 | Ambulance: 108
=======================================================`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!dossierText) return;
    navigator.clipboard.writeText(dossierText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!dossierText) return;
    exportDossierToPDF(dossierText, {
      origin,
      destination,
      days,
      travelers,
    });
  };

  return (
    <main className="dossier-page">
      {/* HEADER */}
      <header className="dossier-navbar">
        <button className="dossier-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="dossier-nav-title">
          <FaFileAlt className="nav-icon" />
          <span>PRINTABLE TRAVEL PLAN & SUMMARY</span>
        </div>
        <div className="dossier-nav-actions">
          {dossierText && (
            <>
              <button className="action-btn" onClick={handleCopy}>
                {copied ? <><FaCheck /> Copied</> : <><FaCopy /> Copy Plan</>}
              </button>
              <button className="action-btn" onClick={handlePrint}>
                <FaPrint /> Print / Save as PDF
              </button>
            </>
          )}
        </div>
      </header>

      <div className="dossier-container">
        {/* HERO */}
        <section className="dossier-hero">
          <div className="dossier-pill">
            <span>PRINTABLE TRIP BOOKLET</span>
          </div>
          <h1>
            Your Complete <span>Travel Plan Summary</span>
          </h1>
          <p>
            Compile your entire trip into a clean, simple, printable summary with daily schedules, estimated costs, packing checklists, and safety contacts.
          </p>
        </section>

        {/* INPUTS BAR */}
        <div className="dossier-controls-card">
          <div className="input-item">
            <label>STARTING CITY (FROM)</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Hyderabad"
            />
          </div>

          <div className="input-item">
            <label>DESTINATION (TO)</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tirupati"
            />
          </div>

          <div className="input-item">
            <label>NUMBER OF DAYS</label>
            <input
              type="number"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <div className="input-item">
            <label>NUMBER OF PEOPLE</label>
            <input
              type="number"
              min="1"
              max="10"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
            />
          </div>

          <button
            className="compile-btn"
            onClick={handleGenerateDossier}
            disabled={loading}
          >
            <FaMagic /> {loading ? "Compiling Plan..." : "Generate Printable Summary"}
          </button>
        </div>

        {/* OUTPUT AREA */}
        <div className="dossier-display-card">
          {loading ? (
            <div className="dossier-loading">
              <motion.div
                className="loading-pulse"
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <h3>Preparing Your Travel Summary...</h3>
              <p>Organizing travel timings, daily schedule, expense table, and packing checklist.</p>
            </div>
          ) : dossierText ? (
            <motion.div
              className="dossier-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="dossier-paper">
                <pre>{dossierText}</pre>
              </div>
            </motion.div>
          ) : (
            <div className="dossier-placeholder">
              <FaFileAlt className="placeholder-icon" />
              <h3>Ready to Generate Your Travel Plan</h3>
              <p>Click <strong>"Generate Printable Summary"</strong> above to view your ready-to-print travel booklet.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default TripDossierSummary;
