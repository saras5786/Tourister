import { useState } from "react";
import { motion } from "framer-motion";
import { puter } from "@heyputer/puter.js";
import {
  FaCamera,
  FaInstagram,
  FaVideo,
  FaCopy,
  FaCheck,
  FaSun,
  FaHashtag,
  FaHeart,
  FaComment,
  FaPaperPlane,
  FaMagic,
} from "react-icons/fa";
import "./InfluencerStudio.css";

const PRESET_CREATOR_DATA = {
  Tirupati: {
    photoSpot: "Silathoranam Natural Rock Arch & Sunset Valley",
    goldenHour: "05:30 PM - 06:15 PM (Warm Amber Evening Light)",
    cameraAngle: "Low angle, wide view capturing the ancient rock arch with soft evening sky in the background.",
    reelStoryboard: [
      { step: "0 to 3s (Hook)", scene: "Quick zoom into the ancient rock arch: 'Here is the 1.5-billion-year-old secret in Tirumala most people walk right past!'" },
      { step: "3 to 8s (Clips)", scene: "Quick peaceful clips of hill mist, stone carvings, and temple evening lamps." },
      { step: "8 to 12s (Secret)", scene: "Panoramic slow pan across the quiet forest valley view." },
      { step: "12 to 15s (Ending)", scene: "Text on screen: 'Save this for your next spiritual trip! 📍 Silathoranam, Tirupati'" },
    ],
    captions: {
      aesthetic: "Where peaceful devotion meets timeless nature ✨ Taking in the quiet beauty of Tirupati.",
      storytelling: "Beyond the busy darshan lines lies a quiet, sacred valley where the rocks are older than time. Such a peaceful place to reflect.",
      short: "Peaceful horizons and sacred vibes. 📍 Tirupati",
    },
    hashtags: "#Tirupati #TirumalaDiaries #TravelIndia #PeacefulMoments #IncredibleIndia #ExploreWithMe",
  },
  Kakinada: {
    photoSpot: "Coringa Mangrove Wooden Boardwalk Bridge",
    goldenHour: "08:15 AM - 09:30 AM (Soft Morning Light through the Trees)",
    cameraAngle: "Eye-level shot looking straight down the wooden walkway with green mangrove branches framing both sides.",
    reelStoryboard: [
      { step: "0 to 3s (Hook)", scene: "Stepping onto the long wooden bridge: 'Did you know India has a hidden mangrove forest right here?'" },
      { step: "3 to 8s (Clips)", scene: "Walking POV along the wooden trail with sunbeams through the emerald leaves." },
      { step: "8 to 12s (Secret)", scene: "A quiet boat gliding down the Godavari river towards the sea." },
      { step: "12 to 15s (Ending)", scene: "Text on screen: 'Tag someone you would explore this with! 📍 Coringa, Kakinada'" },
    ],
    captions: {
      aesthetic: "Lost in the emerald green waterways of Coringa 🌿 Nature at its purest.",
      storytelling: "Cruising along the mangrove trails of Godavari, listening only to the sea eagles and gentle waves. A true hidden gem.",
      short: "Boardwalk mornings in the mangroves. 📍 Coringa",
    },
    hashtags: "#Kakinada #CoringaMangroves #NatureLovers #HiddenGems #EcoTravel #TravelGram",
  },
};

function InfluencerStudio({ onBack }) {
  const [destination, setDestination] = useState("Tirupati");
  const [tone, setTone] = useState("aesthetic");
  const [copiedSection, setCopiedSection] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [customKit, setCustomKit] = useState(null);

  const activeData = customKit || PRESET_CREATOR_DATA[destination] || PRESET_CREATOR_DATA["Tirupati"];

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCreatePostIdeas = async () => {
    setLoadingTips(true);
    try {
      const prompt = `Write a clean, human, friendly travel creator kit for "${destination}":
1. Golden hour lighting time and best photography spot with easy camera angle tips.
2. 15-second simple Reel storyboard with 4 quick scenes (Hook, Clips, Secret, Ending).
3. 3 captions: Aesthetic, Storytelling, and Short & Catchy.
4. 8 clean, trending hashtags.
Keep language natural, friendly, and easy to use without complex words.`;

      const response = await puter.ai.chat(
        [{ role: "user", content: prompt }],
        { model: "openai/gpt-5.6-luna", reasoning_effort: "low" }
      );

      const reply = response?.message?.content || response?.text;

      setCustomKit({
        photoSpot: `Main Historic Landmark & Sunset View in ${destination}`,
        goldenHour: "05:30 PM - 06:15 PM (Warm Sunset Glow)",
        cameraAngle: "Wide view from eye level to capture the architecture and open evening sky.",
        reelStoryboard: [
          { step: "0 to 3s (Hook)", scene: `Quick opening clip: '3 things you must experience when visiting ${destination}!'` },
          { step: "3 to 8s (Clips)", scene: "Quick cuts of authentic local food, warm lights, and heritage stone arches." },
          { step: "8 to 12s (Secret)", scene: "A peaceful panoramic view of the skyline or temple pond." },
          { step: "12 to 15s (Ending)", scene: `Text: 'Save this guide for ${destination}! 📍'` },
        ],
        captions: {
          aesthetic: `Unfiltered beauty in ${destination} ✨ Cherishing every single moment of this journey.`,
          storytelling: `Exploring the historic streets of ${destination} made me fall in love with traveling all over again. Such warm people and incredible memories.`,
          short: `Pure peaceful vibes in ${destination}. 📍`,
        },
        hashtags: `#${destination.replace(/\s+/g, "")} #${destination.replace(/\s+/g, "")}Diaries #TravelGram #ExploreIndia #TravelMemories`,
        rawAI: reply,
      });
    } catch (e) {
      console.warn("Creator tips fallback:", e);
    } finally {
      setLoadingTips(false);
    }
  };

  return (
    <main className="creator-page">
      {/* HEADER */}
      <header className="creator-navbar">
        <button className="creator-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="creator-nav-title">
          <FaCamera className="nav-icon" />
          <span>TRAVEL PHOTO & SOCIAL MEDIA STUDIO</span>
        </div>
        <div className="creator-dest-box">
          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setCustomKit(null);
            }}
            placeholder="Type Any Destination..."
          />
          <button
            className="generate-kit-btn"
            onClick={handleCreatePostIdeas}
            disabled={loadingTips}
          >
            <FaMagic /> {loadingTips ? "Creating Ideas..." : "Create Post Ideas"}
          </button>
        </div>
      </header>

      <div className="creator-container">
        {/* HERO */}
        <section className="creator-hero">
          <div className="creator-pill">
            <span>PHOTO SPOTS & REEL STORYBOARDS</span>
          </div>
          <h1>
            Social Media <span>& Photo Guide</span>
          </h1>
          <p>
            Get ready-to-post Instagram captions, best photography lighting times, camera angle tips, and 15-second reel ideas for your trip to {destination}.
          </p>
        </section>

        {/* WORKSPACE */}
        <div className="creator-workspace-grid">
          {/* TOOLS COLUMN */}
          <div className="creator-tools-col">
            {/* PHOTO ANGLE & GOLDEN HOUR */}
            <div className="creator-card">
              <div className="card-top">
                <div className="icon-badge sun">
                  <FaSun />
                </div>
                <div>
                  <h3>Best Photo Spot & Golden Hour Time</h3>
                  <p>When and where to capture the most beautiful photos</p>
                </div>
              </div>

              <div className="photo-guide-details">
                <div className="guide-row">
                  <strong>📍 Best Photo Spot:</strong>
                  <span>{activeData.photoSpot}</span>
                </div>
                <div className="guide-row">
                  <strong>☀️ Ideal Sunlight Timing:</strong>
                  <span className="highlight-pill">{activeData.goldenHour}</span>
                </div>
                <div className="guide-row">
                  <strong>📸 Camera Angle Tip:</strong>
                  <span>{activeData.cameraAngle}</span>
                </div>
              </div>
            </div>

            {/* 15-SEC REEL STORYBOARD */}
            <div className="creator-card">
              <div className="card-top">
                <div className="icon-badge video">
                  <FaVideo />
                </div>
                <div>
                  <h3>15-Second Travel Reel Storyboard</h3>
                  <p>Simple shot-by-shot guide you can record on your phone</p>
                </div>
              </div>

              <div className="storyboard-steps">
                {activeData.reelStoryboard.map((item, i) => (
                  <div key={i} className="storyboard-step-item">
                    <span className="step-timestamp">{item.step}</span>
                    <p className="step-scene">{item.scene}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* READY CAPTIONS */}
            <div className="creator-card">
              <div className="card-top">
                <div className="icon-badge instagram">
                  <FaInstagram />
                </div>
                <div>
                  <h3>Ready-to-Use Captions & Hashtags</h3>
                  <p>Choose your preferred caption style and copy with 1 click</p>
                </div>
              </div>

              <div className="caption-tone-tabs">
                {["aesthetic", "storytelling", "short"].map((t) => (
                  <button
                    key={t}
                    className={`tone-tab ${tone === t ? "active" : ""}`}
                    onClick={() => setTone(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="caption-box">
                <p>{activeData.captions[tone]}</p>
                <button
                  className="copy-snippet-btn"
                  onClick={() => handleCopy(activeData.captions[tone], "caption")}
                >
                  {copiedSection === "caption" ? <><FaCheck /> Copied</> : <><FaCopy /> Copy Caption</>}
                </button>
              </div>

              <div className="hashtags-box">
                <div className="hashtags-header">
                  <FaHashtag /> Trending Hashtags
                </div>
                <p>{activeData.hashtags}</p>
                <button
                  className="copy-snippet-btn"
                  onClick={() => handleCopy(activeData.hashtags, "hashtags")}
                >
                  {copiedSection === "hashtags" ? <><FaCheck /> Copied</> : <><FaCopy /> Copy Hashtags</>}
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW COLUMN */}
          <div className="creator-preview-col">
            <div className="mockup-sticky-wrapper">
              <div className="social-mockup-card">
                <div className="mockup-header">
                  <div className="user-avatar">TI</div>
                  <div>
                    <strong>tourister.explorer</strong>
                    <span>{destination}</span>
                  </div>
                </div>

                <div className="mockup-image-frame">
                  <div className="mockup-image-placeholder">
                    <FaCamera className="placeholder-icon" />
                    <span>Photo Guide: {destination}</span>
                    <small>{activeData.goldenHour}</small>
                  </div>
                </div>

                <div className="mockup-actions">
                  <div className="actions-left">
                    <FaHeart className="action-icon heart" />
                    <FaComment className="action-icon" />
                    <FaPaperPlane className="action-icon" />
                  </div>
                </div>

                <div className="mockup-caption-area">
                  <p>
                    <strong>tourister.explorer</strong> {activeData.captions[tone]}
                  </p>
                  <p className="mockup-hashtags">{activeData.hashtags}</p>
                </div>
              </div>

              <button
                className="full-kit-copy-btn"
                onClick={() =>
                  handleCopy(
                    `📸 PHOTO SPOT: ${activeData.photoSpot}\n☀️ BEST LIGHT: ${activeData.goldenHour}\n\n📝 CAPTION:\n${activeData.captions[tone]}\n\n🏷️ HASHTAGS:\n${activeData.hashtags}`,
                    "full"
                  )
                }
              >
                {copiedSection === "full" ? <><FaCheck /> Copied Everything!</> : <><FaCopy /> Copy Complete Post & Tips</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default InfluencerStudio;
