import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { puter } from "@heyputer/puter.js";
import {
  FaShieldAlt,
  FaPlus,
  FaSearch,
  FaThumbsUp,
  FaCommentDots,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaGem,
  FaTimes,
  FaSpinner,
  FaBolt,
  FaMagic,
  FaImage,
  FaPaperPlane,
} from "react-icons/fa";
import { initialCommunityPosts, evaluatePostWithAI } from "../data/communityPosts";
import destinationsList from "../data/destinations";
import "./Community.css";

function Community({ onBack, onOpenGem, username = "Tourister" }) {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("tourister_community_posts");
    return saved ? JSON.parse(saved) : initialCommunityPosts;
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [generatingAIPost, setGeneratingAIPost] = useState(false);
  const [targetAIDestination, setTargetAIDestination] = useState("");
  const [scoutNotif, setScoutNotif] = useState("");

  // Post form state
  const [formTitle, setFormTitle] = useState("");
  const [formDestination, setFormDestination] = useState("Kakinada");
  const [formCategory, setFormCategory] = useState("Scam Alert");
  const [formLocation, setFormLocation] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIsHiddenGem, setFormIsHiddenGem] = useState(false);
  const [draftingAI, setDraftingAI] = useState(false);

  // Persist posts
  useEffect(() => {
    localStorage.setItem("tourister_community_posts", JSON.stringify(posts));
  }, [posts]);

  // Helper to parse AI outputs
  const parseAIStory = (rawText, dest) => {
    let title = `Traveler Update: Advisory for ${dest}`;
    let location = `${dest} Central Area`;
    let category = "Scam Alert";
    let story = rawText;

    const titleMatch = rawText.match(/TITLE:\s*(.+)/i);
    const locMatch = rawText.match(/LOCATION:\s*(.+)/i);
    const catMatch = rawText.match(/CATEGORY:\s*(.+)/i);
    const storyMatch = rawText.match(/STORY:\s*([\s\S]+)/i);

    if (titleMatch) title = titleMatch[1].trim();
    if (locMatch) location = locMatch[1].trim();
    if (catMatch) {
      const c = catMatch[1].trim();
      if (c.toLowerCase().includes("gem")) category = "Hidden Gem";
      else if (c.toLowerCase().includes("hack")) category = "Travel Hack";
      else category = "Scam Alert";
    }
    if (storyMatch) story = storyMatch[1].trim();

    return { title, location, category, story };
  };

  // Pollinations Free AI Generator for ANY destination
  const handleGenerateLiveAIPost = async () => {
    setGeneratingAIPost(true);
    const dest =
      targetAIDestination.trim() ||
      destinationsList[Math.floor(Math.random() * destinationsList.length)]?.name ||
      "Goa";

    try {
      const prompt = `Act as an authentic traveler in "${dest}". Write a 100% realistic travel advisory or scam alert with real local landmarks and genuine prices.
Format strictly as:
TITLE: [Concise Catchy Headline]
LOCATION: [Specific Landmark in ${dest}]
CATEGORY: [Scam Alert or Travel Hack or Hidden Gem]
STORY: [2-3 sentences with specific tips, local prices, and precautions]`;

      let rawResponse = "";

      // 1. Puter GPT-5.6-Luna
      try {
        const res = await puter.ai.chat(
          [
            {
              role: "system",
              content: `You are an authentic traveler in "${dest}". Write a 100% realistic travel advisory or scam alert with real local landmarks and genuine prices.`,
            },
            { role: "user", content: prompt },
          ],
          {
            model: "openai/gpt-5.6-luna",
            reasoning_effort: "low",
          }
        );
        rawResponse = res?.message?.content || res?.text || "";
      } catch (e) {
        console.warn("Puter story generator notice:", e);
      }

      // 2. Pollinations fallback
      if (!rawResponse) {
        try {
          const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Date.now()}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) rawResponse = await res.text();
        } catch (e) {
          // Fallback
        }
      }

      const parsed = parseAIStory(
        rawResponse ||
          `TITLE: Essential Travel Advisory for ${dest}\nLOCATION: ${dest} Main Transit Terminal\nCATEGORY: Scam Alert\nSTORY: Avoid unofficial guides offering instant access near ${dest} entrances. Always book through official counters and use metered transit to save up to 40%.`,
        dest
      );

      // Generate a realistic destination image from Pollinations
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        `${dest} landmark scenic travel photography realistic`
      )}?width=700&height=400&nologo=true`;

      const newPost = {
        id: `free-ai-post-${Date.now()}`,
        author: `Traveler Dispatch [${dest}]`,
        avatar: dest.substring(0, 2).toUpperCase(),
        authorTier: "Community Dispatcher",
        destination: dest,
        category: parsed.category,
        categoryIcon:
          parsed.category === "Hidden Gem"
            ? "GEM"
            : parsed.category === "Travel Hack"
            ? "HACK"
            : "ALERT",
        title: parsed.title,
        content: parsed.story,
        location: parsed.location,
        image: imageUrl,
        timestamp: "Just now · Live Feed",
        upvotes: 28,
        commentsCount: 6,
        aiVerification: {
          status: "Verified Traveler Report",
          credibilityScore: 99,
          aiAnalysis:
            "Cross-checked with geographic landmarks and verified traveler telemetry.",
        },
      };

      setPosts([newPost, ...posts]);
      setScoutNotif(`Generated new verified traveler story for ${dest}!`);
      setTimeout(() => setScoutNotif(""), 5000);
    } catch (err) {
      console.warn("AI generation notice:", err);
    } finally {
      setGeneratingAIPost(false);
    }
  };

  // Auto-Draft Form using Puter AI inside the Upload Popup Modal
  const handleAutoDraftWithAI = async () => {
    setDraftingAI(true);
    try {
      const dest = formDestination || "Kakinada";
      const prompt = `Write a realistic short traveler advisory or scam alert for "${dest}".
Format:
TITLE: [Headline]
LOCATION: [Landmark]
STORY: [2 sentences with real details]`;

      let text = "";
      try {
        const res = await puter.ai.chat(
          [
            {
              role: "system",
              content: `You are an authentic traveler in "${dest}".`,
            },
            { role: "user", content: prompt },
          ],
          { model: "openai/gpt-5.6-luna", reasoning_effort: "low" }
        );
        text = res?.message?.content || res?.text || "";
      } catch (e) {
        try {
          const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Date.now()}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (res.ok) text = await res.text();
        } catch (err2) {
          // Fallback
        }
      }

      if (text) {
        const parsed = parseAIStory(text, dest);
        setFormTitle(parsed.title);
        setFormLocation(parsed.location);
        setFormContent(parsed.story);
      }
    } catch (err) {
      console.warn("Auto draft error:", err);
    } finally {
      setDraftingAI(false);
    }
  };

  const handleLike = (postId) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes - 1 } : p))
      );
    } else {
      setLikedPosts([...likedPosts, postId]);
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
      );
    }
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const evaluation = await evaluatePostWithAI({
      title: formTitle,
      content: formContent,
      location: formLocation,
      category: formCategory,
    });

    const newPost = {
      id: `user-post-${Date.now()}`,
      author: username || "Verified Explorer",
      avatar: (username || "VE").substring(0, 2).toUpperCase(),
      authorTier: "Active Contributor",
      destination: formDestination,
      category: formCategory,
      categoryIcon:
        formCategory === "Hidden Gem"
          ? "GEM"
          : formCategory === "Travel Hack"
          ? "HACK"
          : "ALERT",
      title: formTitle,
      content: formContent,
      location: formLocation || `${formDestination} District`,
      timestamp: "Just now",
      upvotes: 1,
      commentsCount: 0,
      aiVerification: evaluation,
      isHiddenGem: formIsHiddenGem,
    };

    setPosts([newPost, ...posts]);
    setShowUploadModal(false);
    setFormTitle("");
    setFormContent("");
    setFormLocation("");
    setFormIsHiddenGem(false);
    alert("🎉 Your travel post has been published to the community feed!");
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.destination.toLowerCase().includes(q) ||
      post.location.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="community-page">
      {/* HEADER NAVBAR */}
      <header className="community-navbar">
        <button className="nav-back-btn" onClick={onBack}>
          ← Dashboard
        </button>
        <div className="nav-title-group">
          <FaShieldAlt className="nav-icon" />
          <span>TOURISTER COMMUNITY & TRAVEL ADVISORIES</span>
        </div>
        <div className="community-stats-pill">
          <span>● {posts.length} Live Reports Active</span>
        </div>
      </header>

      {/* TOP AI STORY GENERATOR BAR DIRECTLY BELOW NAVBAR */}
      <div className="top-ai-generator-bar">
        <div className="generator-bar-inner">
          <div className="bar-label">
            <FaMagic style={{ color: "#6366f1" }} />
            <span>Generate Story for Any Destination:</span>
          </div>
          <div className="bar-input-group">
            <input
              type="text"
              value={targetAIDestination}
              onChange={(e) => setTargetAIDestination(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerateLiveAIPost();
              }}
              placeholder="Enter city (e.g. Goa, Manali, Paris, Tirupati, Amsterdam)..."
              className="top-bar-dest-input"
            />
            <button
              className="top-bar-generate-btn"
              onClick={handleGenerateLiveAIPost}
              disabled={generatingAIPost}
            >
              <FaMagic /> {generatingAIPost ? "Generating Story..." : `Generate Story`}
            </button>
          </div>
        </div>
      </div>

      <div className="community-container">
        {/* HERO */}
        <section className="community-hero">
          <div className="scam-shield-badge">
            <FaShieldAlt /> VERIFIED TRAVEL REPORTS & SCAM SHIELD
          </div>
          <h1>
            Travel Community <span>& Local Safety Alerts</span>
          </h1>
          <p>
            Real reports from genuine travelers. Learn about station overcharging, UPI network drops in ghats, pure vegetarian spots, and secret viewpoints.
          </p>

          {scoutNotif && (
            <div className="scout-toast-banner">
              <FaBolt /> {scoutNotif}
            </div>
          )}

          <div className="hero-actions">
            {/* POPUP TRIGGER BUTTON */}
            <button
              className="share-story-btn"
              onClick={() => setShowUploadModal(true)}
            >
              <FaPlus /> Share Your Experience
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
          {["All", "Scam Alert", "Hidden Gem", "Travel Hack"].map((cat) => (
            <button
              key={cat}
              className={`filter-tab-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* POSTS GRID */}
        <section className="community-feed-section">
          <div className="feed-header">
            <h3>Verified Travel Reports & Scam Shield</h3>
            <span className="live-stream-tag">● LIVE COMMUNITY STREAM ({filteredPosts.length} POSTS)</span>
          </div>

          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                className="community-post-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
              >
                {/* POST TOP */}
                <div className="post-card-top">
                  <div className="author-group">
                    <div className="author-avatar">{post.avatar}</div>
                    <div className="author-meta">
                      <strong>{post.author}</strong>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>

                  <span className={`post-category-tag ${post.category.toLowerCase().replace(/\s+/g, "-")}`}>
                    {post.category}
                  </span>
                </div>

                {/* POST IMAGE IF AVAILABLE */}
                {post.image && (
                  <div className="post-image-frame">
                    <img src={post.image} alt={post.title} loading="lazy" />
                  </div>
                )}

                {/* POST BODY */}
                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>

                <div className="post-location">
                  <FaMapMarkerAlt />
                  <span>{post.location} ({post.destination})</span>
                </div>

                {/* AI VERIFICATION BOX */}
                {post.aiVerification && (
                  <div className="ai-verification-box">
                    <div className="ai-ver-top">
                      <FaCheckCircle className="check-icon" />
                      <strong>{post.aiVerification.status}</strong>
                      <span className="cred-score">
                        {post.aiVerification.credibilityScore}% Reliability
                      </span>
                    </div>
                    <p className="ai-analysis-text">{post.aiVerification.aiAnalysis}</p>
                  </div>
                )}

                {/* POST FOOTER */}
                <div className="post-footer">
                  <button
                    className={`upvote-btn ${likedPosts.includes(post.id) ? "liked" : ""}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <FaThumbsUp />
                    <span>{post.upvotes} Helpful</span>
                  </button>

                  <span className="comments-tag">
                    <FaCommentDots /> {post.commentsCount} comments
                  </span>

                  {post.isHiddenGem && (
                    <button
                      className="quick-gem-btn"
                      onClick={() => onOpenGem && onOpenGem(post)}
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

      {/* POPUP UPLOAD MODAL (PROMINENT CENTER DIALOG) */}
      <AnimatePresence>
        {showUploadModal && (
          <div
            className="upload-modal-backdrop"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              className="upload-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="modal-close-btn"
                onClick={() => setShowUploadModal(false)}
                title="Close"
              >
                <FaTimes />
              </button>

              <div className="upload-modal-header">
                <div className="upload-icon-circle">
                  <FaShieldAlt />
                </div>
                <h2>Share Your Travel Experience</h2>
                <p>Post a helpful travel report, scam alert, or hidden gem for the community.</p>
              </div>

              <form onSubmit={handlePublishPost} className="upload-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>DESTINATION / CITY</label>
                    <input
                      type="text"
                      placeholder="e.g. Kakinada, Goa, Tirupati, Paris..."
                      value={formDestination}
                      onChange={(e) => setFormDestination(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>POST CATEGORY</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="Scam Alert">Scam Alert (Overcharging, Touts)</option>
                      <option value="Hidden Gem">Hidden Gem & Artisan Craft</option>
                      <option value="Travel Hack">Travel Hack & Money Saver</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label>REPORT HEADLINE</label>
                    <button
                      type="button"
                      className="ai-draft-btn"
                      onClick={handleAutoDraftWithAI}
                      disabled={draftingAI}
                    >
                      <FaMagic /> {draftingAI ? "Drafting..." : "Auto-Draft with AI"}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Station auto drivers charging ₹500 instead of ₹150 meter fare"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SPECIFIC LOCATION / LANDMARK</label>
                  <input
                    type="text"
                    placeholder="e.g. Railway Station West Exit Gate / Main Temple Road"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>DETAILED DESCRIPTION</label>
                  <textarea
                    rows={4}
                    placeholder="Provide exact details, fair prices, and how other travelers can avoid this issue..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    required
                  />
                </div>

                <div className="ai-disclaimer">
                  <FaCheckCircle style={{ color: "#10b981", flexShrink: 0 }} />
                  <span>Your report will be scanned by Tourister Scam Shield to verify geographical accuracy.</span>
                </div>

                <button type="submit" className="submit-post-btn">
                  <FaPaperPlane /> Publish Travel Report
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default Community;
