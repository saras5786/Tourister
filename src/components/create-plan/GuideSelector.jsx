import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLanguage,
  FaAward,
  FaStar,
  FaCheckCircle,
  FaMagic,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import "./GuideSelector.css";

// Comprehensive Multi-Region & International Guide Database
const GLOBAL_GUIDE_DATABASE = [
  // 1. ANDHRA PRADESH & TELANGANA (Kakinada, Tirupati, Vizag, Hyderabad)
  {
    id: "g-andhra-1",
    name: "Suresh Rambabu",
    initials: "SR",
    gradient: "linear-gradient(135deg, #0284c7, #0369a1)",
    destinationKeywords: ["kakinada", "coringa", "uppada", "godavari", "samalkota", "draksharamam", "rajahmundry"],
    region: "Godavari Coast & Coringa",
    languages: ["Telugu", "English"],
    experience: "7 years",
    specialty: "Mangrove Ecology, Boat Safaris & Pancharama Temples",
    rating: "4.9",
    fee: "₹700/day",
  },
  {
    id: "g-andhra-2",
    name: "Ananya Rao",
    initials: "AR",
    gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
    destinationKeywords: ["tirupati", "tirumala", "chittoor", "srikalahasti", "kanipakam"],
    region: "Tirupati & Rayalaseema",
    languages: ["Telugu", "Tamil", "Hindi", "English"],
    experience: "8 years",
    specialty: "Sacred Temple Protocols, Darshan Lines & Vedic History",
    rating: "5.0",
    fee: "₹800/day",
  },
  {
    id: "g-andhra-3",
    name: "K. Venkat Ramana",
    initials: "VR",
    gradient: "linear-gradient(135deg, #0d9488, #14b8a6)",
    destinationKeywords: ["visakhapatnam", "vizag", "araku", "borra", "rushikonda"],
    region: "Visakhapatnam & Araku Valley",
    languages: ["Telugu", "Hindi", "English"],
    experience: "6 years",
    specialty: "Eastern Ghats Trails, Coffee Plantations & Submarine Museum",
    rating: "4.8",
    fee: "₹750/day",
  },
  {
    id: "g-andhra-4",
    name: "Syed Imran",
    initials: "SI",
    gradient: "linear-gradient(135deg, #8b5cf6, #d946ef)",
    destinationKeywords: ["hyderabad", "secunderabad", "charminar", "golconda"],
    region: "Hyderabad & Golconda",
    languages: ["Telugu", "Hindi", "Urdu", "English"],
    experience: "9 years",
    specialty: "Nizami Heritage, Golconda Fort Acoustics & Biryani Trails",
    rating: "4.9",
    fee: "₹850/day",
  },

  // 2. TAMIL NADU & KERALA
  {
    id: "g-south-1",
    name: "Arjun Krishnan",
    initials: "AK",
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    destinationKeywords: ["chennai", "madurai", "thanjavur", "rameshwaram", "kanyakumari"],
    region: "Tamil Nadu",
    languages: ["Tamil", "English", "Hindi"],
    experience: "7 years",
    specialty: "Dravidian Gopuram Architecture & Classical Carnatic Heritage",
    rating: "4.9",
    fee: "₹750/day",
  },
  {
    id: "g-south-2",
    name: "Nandini Menon",
    initials: "NM",
    gradient: "linear-gradient(135deg, #84cc16, #65a30d)",
    destinationKeywords: ["kerala", "kochi", "cochin", "munnar", "alleppey", "alappuzha", "trivandrum"],
    region: "Kerala Backwaters & Western Ghats",
    languages: ["Malayalam", "Tamil", "English"],
    experience: "6 years",
    specialty: "Houseboat Cruises, Spice Gardens & Ayurveda Wellness",
    rating: "4.8",
    fee: "₹800/day",
  },

  // 3. KARNATAKA & MAHARASHTRA & GOA
  {
    id: "g-south-3",
    name: "Pooja Hegde",
    initials: "PH",
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
    destinationKeywords: ["bengaluru", "bangalore", "mysore", "mysuru", "hampi", "coorg"],
    region: "Karnataka Heritage & Western Ghats",
    languages: ["Kannada", "Telugu", "Hindi", "English"],
    experience: "7 years",
    specialty: "Vijayanagara Ruins, Silk Handlooms & Coffee Estates",
    rating: "4.9",
    fee: "₹800/day",
  },
  {
    id: "g-west-1",
    name: "Tanvi Kulkarni",
    initials: "TK",
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    destinationKeywords: ["mumbai", "bombay", "pune", "lonavala", "ajanta", "ellora"],
    region: "Maharashtra & Deccan",
    languages: ["Marathi", "Hindi", "English"],
    experience: "6 years",
    specialty: "UNESCO Rock-Cut Caves, Colonial South Bombay & Food Walks",
    rating: "4.9",
    fee: "₹850/day",
  },
  {
    id: "g-west-2",
    name: "Carlos Fernandes",
    initials: "CF",
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    destinationKeywords: ["goa", "panaji", "panjim", "calangute", "anjuna", "margao"],
    region: "Goa Coastal & Heritage",
    languages: ["Konkani", "English", "Portuguese", "Hindi"],
    experience: "8 years",
    specialty: "Portuguese Latin Quarters, Spice Plantations & Waterfall Treks",
    rating: "4.8",
    fee: "₹900/day",
  },

  // 4. NORTH & EAST INDIA
  {
    id: "g-north-1",
    name: "Vikramaditya Sharma",
    initials: "VS",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    destinationKeywords: ["delhi", "jaipur", "agra", "rajasthan", "varanasi", "kashi"],
    region: "Golden Triangle & Ganga Ghats",
    languages: ["Hindi", "English", "Punjabi"],
    experience: "9 years",
    specialty: "Mughal Palaces, Rajput Forts & Evening Ganga Aarti",
    rating: "5.0",
    fee: "₹950/day",
  },
  {
    id: "g-north-2",
    name: "Harpreet Singh",
    initials: "HS",
    gradient: "linear-gradient(135deg, #f97316, #ea580c)",
    destinationKeywords: ["amritsar", "punjab", "shimla", "manali", "himachal", "dharamshala"],
    region: "Punjab & Himachal Passes",
    languages: ["Punjabi", "Hindi", "English"],
    experience: "8 years",
    specialty: "Golden Temple Protocols, Himalayan Passes & Pine Treks",
    rating: "4.9",
    fee: "₹850/day",
  },

  // 5. EUROPE & INTERNATIONAL (Amsterdam, Paris, London, Rome, etc.)
  {
    id: "g-euro-1",
    name: "Sophie van der Meer",
    initials: "SM",
    gradient: "linear-gradient(135deg, #f59e0b, #ec4899)",
    destinationKeywords: ["amsterdam", "netherlands", "holland", "rotterdam", "utrecht"],
    region: "Amsterdam & North Holland",
    languages: ["Dutch", "English", "German"],
    experience: "8 years",
    specialty: "Canal Ring Architecture, Van Gogh Art & Windmill Bicycle Trails",
    rating: "4.9",
    fee: "€35/hour",
  },
  {
    id: "g-euro-2",
    name: "Lucas Dubois",
    initials: "LD",
    gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    destinationKeywords: ["paris", "france", "nice", "lyon", "marseille"],
    region: "Paris & Île-de-France",
    languages: ["French", "English", "Spanish"],
    experience: "9 years",
    specialty: "Louvre Masterpieces, Montmartre Bohemian History & Pastry Trails",
    rating: "5.0",
    fee: "€40/hour",
  },
  {
    id: "g-euro-3",
    name: "Oliver Smith",
    initials: "OS",
    gradient: "linear-gradient(135deg, #ef4444, #3b82f6)",
    destinationKeywords: ["london", "uk", "england", "oxford", "cambridge", "edinburgh"],
    region: "Greater London & Britain",
    languages: ["English", "French"],
    experience: "10 years",
    specialty: "Royal Palaces, West End Theater History & Hidden Pubs",
    rating: "4.9",
    fee: "£35/hour",
  },
  {
    id: "g-euro-4",
    name: "Matteo Rossi",
    initials: "MR",
    gradient: "linear-gradient(135deg, #10b981, #f59e0b)",
    destinationKeywords: ["rome", "italy", "florence", "venice", "milan"],
    region: "Rome & Central Italy",
    languages: ["Italian", "English", "Spanish"],
    experience: "8 years",
    specialty: "Colosseum Archaeology, Vatican Museums & Authentic Trattorias",
    rating: "4.9",
    fee: "€38/hour",
  },

  // 6. ASIA & MIDDLE EAST (Tokyo, Dubai, Singapore, Bangkok, Nepal)
  {
    id: "g-asia-1",
    name: "Kenji Tanaka",
    initials: "KT",
    gradient: "linear-gradient(135deg, #ec4899, #6366f1)",
    destinationKeywords: ["tokyo", "japan", "kyoto", "osaka", "fuji"],
    region: "Tokyo & Kanto",
    languages: ["Japanese", "English"],
    experience: "7 years",
    specialty: "Shinto Shrines, Cherry Blossom Spots & Akihabara Tech Trails",
    rating: "4.9",
    fee: "¥5,000/hour",
  },
  {
    id: "g-mideast-1",
    name: "Tariq Al-Mansoor",
    initials: "TM",
    gradient: "linear-gradient(135deg, #d97706, #b45309)",
    destinationKeywords: ["dubai", "uae", "abu dhabi", "sharjah"],
    region: "Dubai & Emirates",
    languages: ["Arabic", "English", "Hindi"],
    experience: "8 years",
    specialty: "Old Gold Souks, Desert Conservation Safari & Skywalk Viewpoints",
    rating: "4.9",
    fee: "AED 120/hour",
  },
  {
    id: "g-asia-2",
    name: "Pasang Sherpa",
    initials: "PS",
    gradient: "linear-gradient(135deg, #0284c7, #10b981)",
    destinationKeywords: ["nepal", "kathmandu", "pokhara", "everest", "annapurna"],
    region: "Kathmandu Valley & Annapurna",
    languages: ["Nepali", "Hindi", "English"],
    experience: "11 years",
    specialty: "Himalayan High Passes, Ancient Stupas & Alpine Safety Protocols",
    rating: "5.0",
    fee: "NPR 2,500/day",
  },
  {
    id: "g-asia-3",
    name: "Mei Ling Tan",
    initials: "ML",
    gradient: "linear-gradient(135deg, #ec4899, #a855f7)",
    destinationKeywords: ["singapore", "malaysia", "kuala lumpur", "penang"],
    region: "Singapore & Straits",
    languages: ["English", "Mandarin", "Malay"],
    experience: "6 years",
    specialty: "Gardens by the Bay Eco-Tours, Peranakan Culture & Street Hawker Centers",
    rating: "4.8",
    fee: "S$40/hour",
  },
];

function GuideSelector({
  destinationName = "Kakinada",
  selectedGuideId = "auto",
  onSelectGuide,
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState("All");

  const destClean = destinationName.toLowerCase().trim();

  // Dynamically prioritize and sort guides matching destination
  const matchedGuidesList = useMemo(() => {
    const directMatches = GLOBAL_GUIDE_DATABASE.filter((g) =>
      g.destinationKeywords.some((kw) => destClean.includes(kw))
    );

    const remaining = GLOBAL_GUIDE_DATABASE.filter(
      (g) => !directMatches.some((m) => m.id === g.id)
    );

    return [...directMatches, ...remaining];
  }, [destClean]);

  // Determine current active guide
  const activeGuide = useMemo(() => {
    if (selectedGuideId && selectedGuideId !== "auto") {
      const found = GLOBAL_GUIDE_DATABASE.find((g) => g.id === selectedGuideId);
      if (found) return found;
    }
    // Default to the first matched guide for this destination
    return matchedGuidesList[0] || GLOBAL_GUIDE_DATABASE[0];
  }, [selectedGuideId, matchedGuidesList]);

  const handleAutoMatch = () => {
    const best = matchedGuidesList[0] || GLOBAL_GUIDE_DATABASE[0];
    onSelectGuide(best.id);
  };

  const filteredGuides = useMemo(() => {
    return matchedGuidesList.filter((g) => {
      if (selectedLanguageFilter === "All") return true;
      return g.languages.includes(selectedLanguageFilter);
    });
  }, [matchedGuidesList, selectedLanguageFilter]);

  // Unique languages for filter chips
  const allLanguages = useMemo(() => {
    const set = new Set();
    matchedGuidesList.forEach((g) => g.languages.forEach((l) => set.add(l)));
    return ["All", ...Array.from(set)];
  }, [matchedGuidesList]);

  return (
    <div className="guide-selector-container">
      {/* SIMULATED GUIDE CALLOUT & SELECTION */}
      <div className="guide-card-preview">
        <div className="guide-preview-left">
          <div
            className="guide-avatar-circle"
            style={{ background: activeGuide.gradient }}
          >
            {activeGuide.initials}
          </div>

          <div className="guide-preview-info">
            <div className="guide-name-row">
              <h4>{activeGuide.name}</h4>
              <span className="simulated-badge">Verified Local Companion</span>
            </div>
            <p className="guide-specialty">{activeGuide.specialty}</p>
            <div className="guide-meta-chips">
              <span className="lang-chip">
                <FaLanguage /> {activeGuide.languages.join(", ")}
              </span>
              <span className="exp-chip">
                <FaAward /> {activeGuide.experience} exp
              </span>
              <span className="rating-chip">
                <FaStar /> {activeGuide.rating} ({activeGuide.fee})
              </span>
            </div>
          </div>
        </div>

        <div className="guide-preview-actions">
          <button
            type="button"
            className="auto-match-btn"
            onClick={handleAutoMatch}
            title={`Auto match certified guide for ${destinationName}`}
          >
            <FaMagic /> Auto-Match for {destinationName}
          </button>
          <button
            type="button"
            className="choose-guide-btn"
            onClick={() => setShowModal(true)}
          >
            Choose Guide ({GLOBAL_GUIDE_DATABASE.length}) →
          </button>
        </div>
      </div>

      <div className="guide-demo-disclosure">
        <FaInfoCircle />
        <span>
          Local guides are tailored to <strong>{destinationName}</strong> and speak authentic regional languages to provide personalized cultural companionship.
        </span>
      </div>

      {/* ALL GUIDES MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="guide-modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              className="guide-modal-box"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="guide-modal-header">
                <div>
                  <h3>Select a Local Guide for {destinationName}</h3>
                  <p>Certified local guides with authentic regional language expertise.</p>
                </div>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              {/* LANGUAGE FILTER CHIPS */}
              <div className="lang-filter-bar">
                <span>Filter Language:</span>
                {allLanguages.slice(0, 10).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`lang-filter-chip ${
                      selectedLanguageFilter === lang ? "active" : ""
                    }`}
                    onClick={() => setSelectedLanguageFilter(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* GUIDES GRID */}
              <div className="modal-guides-grid">
                {filteredGuides.map((g) => {
                  const isSelected = activeGuide.id === g.id;
                  const isDirectMatch = g.destinationKeywords.some((kw) =>
                    destClean.includes(kw)
                  );

                  return (
                    <div
                      key={g.id}
                      className={`guide-modal-card ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        onSelectGuide(g.id);
                        setShowModal(false);
                      }}
                    >
                      <div
                        className="modal-guide-avatar"
                        style={{ background: g.gradient }}
                      >
                        {g.initials}
                      </div>

                      <div className="modal-guide-details">
                        <div className="modal-guide-top">
                          <strong>{g.name}</strong>
                          {isDirectMatch && (
                            <span className="dest-match-tag">Local Specialist</span>
                          )}
                          {isSelected && <FaCheckCircle className="check-icon" />}
                        </div>
                        <span className="modal-guide-region">{g.region}</span>
                        <p className="modal-guide-specialty">{g.specialty}</p>

                        <div className="modal-guide-footer">
                          <span>Languages: {g.languages.join(", ")}</span>
                          <strong>{g.fee}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GuideSelector;
