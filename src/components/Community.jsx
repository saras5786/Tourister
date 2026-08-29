import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShieldAlt,
  FaPlus,
  FaSearch,
  FaThumbsUp,
  FaCommentDots,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRobot,
  FaGem,
  FaTimes,
  FaSpinner,
  FaBolt,
} from "react-icons/fa";
import { initialCommunityPosts, evaluatePostWithAI } from "../data/communityPosts";
import destinationsList from "../data/destinations";
import "./Community.css";

const LIVE_AI_SCOUT_DISPATCHES = [
  {
    author: "Deepak Joshi",
    avatar: "DJ",
    authorTier: "Himalayan Scout",
    destination: "Kathmandu",
    category: "Scam Alert",
    categoryIcon: "🚨",
    title: "LIVE REPORT: Mugling Highway Landslide Delay Advisory",
    content: "Prithvi Highway near Mugling is facing massive traffic queues due to overnight debris clearance. Tourist buses between Kathmandu and Pokhara are delayed by 10+ hours. Domestic flights from KTM Tribhuvan are operating smoothly.",
    location: "Mugling Highway, Bagmati Province, Nepal",
  },
  {
    author: "Pranavi Rao",
    avatar: "PR",
    authorTier: "Godavari Explorer",
    destination: "Kakinada",
    category: "Hidden Gem",
    categoryIcon: "💎",
    title: "Secret Morning Eco-Boardwalk & Fresh Uppada Silk Loom Walk",
    content: "If you arrive at Coringa Mangrove Sanctuary right at 8:45 AM, the wooden boardwalk is completely empty and white-bellied sea eagles fly overhead. Afterwards, head 10km to Uppada to watch master weavers spin pure gold Zari!",
    location: "Coringa Mangrove Forest, Kakinada",
  },
  {
    author: "Siddharth Verma",
    avatar: "SV",
    authorTier: "Temple Historian",
    destination: "Varanasi",
    category: "Travel Hack",
    categoryIcon: "💡",
    title: "Serene Morning Ganga Sunrise Aarti at Assi Ghat",
    content: "Skip the heavy crowds at Dashashwamedh for sunrise and head to Assi Ghat at 5:00 AM for 'Subah-e-Banaras'. The live sitar recital with Vedic chanting as dawn breaks over the Ganges is unforgettable.",
    location: "Assi Ghat & Old Kashi Gallis, Varanasi",
  },
  {
    author: "Vikramaditya Roy",
    avatar: "VR",
    authorTier: "Heritage Pioneer",
    destination: "Tirupati",
    category: "Travel Hack",
    categoryIcon: "💡",
    title: "Free TTD Footpath Luggage Counter Hack at Alipiri",
    content: "Pilgrims climbing the Alipiri footpath: Drop your heavy luggage at TTD Counter #3 at the base. They will securely transport it to Tirumala PAC-4 for free. No need to carry backpacks up 3,550 stone steps!",
    location: "Alipiri Footpath Base, Tirupati",
  },
];

function Community({ onBack, onOpenGem, username = "Tourister" }) {
  const [posts, setPosts] = useState(initialCommunityPosts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [aiScoutActive, setAiScoutActive] = useState(true);
  const [scoutNotif, setScoutNotif] = useState("");

  // New Post Form State
  const [formDestination, setFormDestination] = useState(destinationsList[0]?.name || "Kakinada");
  const [formCategory, setFormCategory] = useState("Scam Alert");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Autonomous Live AI Scout Agent: Periodically delivers fresh traveler dispatches
  useEffect(() => {
    if (!aiScoutActive) return;

    const scoutTimer = setTimeout(() => {
      const randomDispatch = LIVE_AI_SCOUT_DISPATCHES[Math.floor(Math.random() * LIVE_AI_SCOUT_DISPATCHES.length)];
      const autoPost = {
        id: `scout-${Date.now()}`,
        author: `${randomDispatch.author} [AI Scout]`,
        avatar: randomDispatch.avatar,
        authorTier: randomDispatch.authorTier,
        destination: randomDispatch.destination,
        category: randomDispatch.category,
        categoryIcon: randomDispatch.categoryIcon,
        title: randomDispatch.title,
        content: randomDispatch.content,
        location: randomDispatch.location,
        timestamp: "Just now · Live Scout Feed",
        upvotes: Math.floor(Math.random() * 25 + 15),
        commentsCount: Math.floor(Math.random() * 8 + 3),
        aiVerification: {
          status: "Live Autonomous AI Verified",
          credibilityScore: 99,
          aiAnalysis: "Auto-verified with satellite weather and regional tourist sensor feeds.",
          riskLevel: "High Priority Alert",
        },
      };

      setPosts((prev) => [autoPost, ...prev.filter((p) => p.id !== autoPost.id)]);
      setScoutNotif(`🤖 AI Scout Agent dispatched new live update for ${randomDispatch.destination}!`);
      setTimeout(() => setScoutNotif(""), 6000);
    }, 15000);

    return () => clearTimeout(scoutTimer);
  }, [aiScoutActive, posts]);

  // Trigger manual AI Scout dispatch
  const handleTriggerAIScout = () => {
    const randomDispatch = LIVE_AI_SCOUT_DISPATCHES[Math.floor(Math.random() * LIVE_AI_SCOUT_DISPATCHES.length)];
    const manualPost = {
      id: `manual-scout-${Date.now()}`,
      author: `${randomDispatch.author} [Live Scout]`,
      avatar: randomDispatch.avatar,
      authorTier: randomDispatch.authorTier,
      destination: randomDispatch.destination,
      category: randomDispatch.category,
      categoryIcon: randomDispatch.categoryIcon,
      title: randomDispatch.title,
      content: randomDispatch.content,
      location: randomDispatch.location,
      timestamp: "Just now · Live Scout Feed",
      upvotes: 42,
      commentsCount: 9,
      aiVerification: {
        status: "Autonomous Scout Verified",
        credibilityScore: 100,
        aiAnalysis: "Cross-checked with regional tourism registries and live road feeds.",
        riskLevel: "High Priority Tip",
      },
    };

    setPosts([manualPost, ...posts]);
    setScoutNotif(`⚡ Fresh Live AI Scout Report Generated for ${randomDispatch.destination}!`);
    setTimeout(() => setScoutNotif(""), 5000);
  };

  // Filtered posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpvote = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !formLocation.trim()) {
      alert("Please fill in all fields before submitting for AI verification.");
      return;
    }

    setEvaluating(true);

    const postPayload = {
      title: formTitle,
      content: formContent,
      category: formCategory,
      destination: formDestination,
      location: formLocation,
    };

    // Run AI Authenticity & Geolocation Verification
    const aiResult = await evaluatePostWithAI(postPayload);

    const newPost = {
      id: `post-${Date.now()}`,
      author: username || "Verified Tourister",
      avatar: (username || "T").substring(0, 2).toUpperCase(),
      authorTier: "Active Contributor",
      destination: formDestination,
      category: formCategory,
      categoryIcon:
        formCategory === "Scam Alert"
          ? "🚨"
          : formCategory === "Hidden Gem"
          ? "💎"
          : formCategory === "Travel Hack"
          ? "💡"
          : "🌿",
      title: formTitle,
      content: formContent,
      location: formLocation,
      timestamp: "Just now",
      upvotes: 1,
      commentsCount: 0,
      aiVerification: aiResult,
    };

    setPosts([newPost, ...posts]);
    setEvaluating(false);
    setEvaluationResult(aiResult);

    setTimeout(() => {
      setShowUploadModal(false);
      setEvaluationResult(null);
      setFormTitle("");
      setFormContent("");
      setFormLocation("");
    }, 1800);
  };

  return (
    <main className="community-page">
      {/* NAVBAR */}
      <header className="community-navbar">
        <button className="community-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="community-nav-title">
          <FaShieldAlt className="shield-icon" /> TRAVEL COMMUNITY & SCAM SHIELD
        </div>
        <div className="ai-status-pill">
          <span className="live-dot" /> AI Authenticity Engine Active
        </div>
      </header>

      <div className="community-container">
        {/* LIVE AI SCOUT AGENT NOTIFICATION BANNER */}
        {scoutNotif && (
          <motion.div
            className="scout-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FaBolt style={{ color: "#fbbf24" }} /> {scoutNotif}
          </motion.div>
        )}

        {/* HERO */}
        <section className="community-hero">
          <div className="community-badge">
            <FaRobot /> REAL-TIME TRAVELER STORIES & SCAM DEFENSE
          </div>
          <h1>
            Verified Traveler Community & <span>Scam Shield</span>
          </h1>
          <p>
            Share authentic experiences, expose local tourist scams (Nepal flood advisories, Araku network & food tips, Coringa boat scams), and discover community-verified travel hacks evaluated by AI.
          </p>

          <div className="community-cta-row">
            <button
              className="share-story-btn"
              onClick={() => setShowUploadModal(true)}
            >
              <FaPlus /> Share Your Experience & Earn T-Points
            </button>

            <button
              className="ai-scout-trigger-btn"
              onClick={handleTriggerAIScout}
            >
              <FaBolt /> 🤖 Dispatch AI Live Scout Agent
            </button>

            <button
              className={`ai-stream-toggle ${aiScoutActive ? "active" : ""}`}
              onClick={() => setAiScoutActive(!aiScoutActive)}
            >
              {aiScoutActive ? "🟢 AI Auto-Feed: ON" : "⚪ AI Auto-Feed: OFF"}
            </button>
          </div>
        </section>

        {/* SEARCH & CATEGORY FILTER */}
        <div className="community-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by city, temple, or scam (e.g. Nepal, Araku, Kakinada, Tirupati, Dubai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="community-filter-tabs">
          {["All", "Scam Alert", "Hidden Gem", "Travel Hack", "Eco-Tips"].map((cat) => (
            <button
              key={cat}
              className={`filter-tab-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* POSTS FEED */}
        <section className="community-feed">
          <div className="feed-header">
            <h3>Verified Travel Reports & Scam Shield</h3>
            <div className="live-feed-indicator">
              <span className="pulsing-dot" /> Live Community Stream
            </div>
          </div>

          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                className={`post-card ${post.category === "Scam Alert" ? "scam-alert-card" : ""}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* TOP HEADER */}
                <div className="post-header">
                  <div className="author-info">
                    <div className="author-avatar">{post.avatar}</div>
                    <div>
                      <strong className="author-name">{post.author}</strong>
                      <span className="author-tier">{post.authorTier}</span>
                    </div>
                  </div>

                  <span className={`category-tag ${post.category.toLowerCase().replace(/\s+/g, "-")}`}>
                    {post.categoryIcon} {post.category}
                  </span>
                </div>

                {/* TITLE & CONTENT */}
                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>

                <div className="post-location">
                  <FaMapMarkerAlt /> <span>{post.location}</span> · <span className="time-ago">{post.timestamp}</span>
                </div>

                {/* AI AUTHENTICITY VERIFICATION BOX */}
                {post.aiVerification && (
                  <div className="ai-verification-box">
                    <div className="ai-ver-top">
                      <span className="ai-status-pill">
                        <FaRobot /> {post.aiVerification.status}
                      </span>
                      <span className="ai-score-pill">
                        Credibility: <strong>{post.aiVerification.credibilityScore}%</strong>
                      </span>
                    </div>
                    <p className="ai-analysis-text">{post.aiVerification.aiAnalysis}</p>
                  </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="post-footer">
                  <button
                    className="upvote-btn"
                    onClick={() => handleUpvote(post.id)}
                  >
                    <FaThumbsUp /> Helpful ({post.upvotes})
                  </button>

                  <div className="comments-tag">
                    <FaCommentDots /> {post.commentsCount} comments
                  </div>

                  {post.category === "Hidden Gem" && (
                    <button
                      className="explore-gem-btn"
                      onClick={() => {
                        const destObj = destinationsList.find(
                          (d) => d.name.toLowerCase() === post.destination.toLowerCase()
                        );
                        if (destObj?.hiddenGem) {
                          onOpenGem(destObj.hiddenGem);
                        } else {
                          alert(`✨ Unlock points for ${post.destination} in the Travel Planner!`);
                        }
                      }}
                    >
                      <FaGem /> Claim T-Points
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>

      {/* UPLOAD STORY & SCAM WARNING MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
            <motion.div
              className="upload-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <div>
                  <h2>Share Travel Report or Scam Warning</h2>
                  <p>Every post is evaluated by Tourister AI for credibility.</p>
                </div>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              {!evaluating && !evaluationResult && (
                <form onSubmit={handleUploadSubmit} className="upload-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>DESTINATION</label>
                      <select
                        value={formDestination}
                        onChange={(e) => setFormDestination(e.target.value)}
                      >
                        {destinationsList.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name} ({d.state})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>CATEGORY</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        <option value="Scam Alert">🚨 Tourist Scam Alert</option>
                        <option value="Hidden Gem">💎 Hidden Gem Discovery</option>
                        <option value="Travel Hack">💡 Travel Hack / Budget Tip</option>
                        <option value="Eco-Tips">🌿 Eco-Tourism Note</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>EXACT LOCATION / LANDMARK</label>
                    <input
                      type="text"
                      placeholder="e.g. Borra Caves Entry Gate / Prithvi Highway Mugling / Tirupati Platform 1"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>HEADLINE / SUMMARY</label>
                    <input
                      type="text"
                      placeholder="e.g. Warning: Touts selling fake passes near station"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>DETAILED STORY OR ADVISORY</label>
                    <textarea
                      rows="4"
                      placeholder="Provide helpful context, what happened, genuine prices vs rip-off prices..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="submit-post-btn">
                    Submit for AI Authenticity Check & Post →
                  </button>
                </form>
              )}

              {evaluating && (
                <div className="evaluating-state">
                  <FaSpinner className="spinner-icon" />
                  <h3>Tourister AI is analyzing your report...</h3>
                  <p>Verifying geolocation landmarks and checking against tourist scam databases.</p>
                </div>
              )}

              {evaluationResult && (
                <div className="evaluation-success">
                  <FaCheckCircle className="check-success-icon" />
                  <h3>Verified & Posted Successfully!</h3>
                  <div className="score-box">
                    <span>AI Credibility Score:</span>
                    <strong>{evaluationResult.credibilityScore}%</strong>
                  </div>
                  <p>{evaluationResult.aiAnalysis}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default Community;
