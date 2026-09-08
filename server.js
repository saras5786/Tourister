import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import {
  handleAuthSignup,
  handleAuthLogin,
  handleUpdateUser,
  handleSavePlan,
  handleGetPlans,
  readDb,
  writeDb,
} from "./server/dbHelper.js";

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

let isPgConnected = false;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool configuration
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/tourister_db",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 2000,
});


// Auto-initialize tables if PostgreSQL is running
async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL Database successfully!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_points INTEGER DEFAULT 300,
        wallet_balance NUMERIC(10, 2) DEFAULT 2500.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS saved_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) NOT NULL,
        source VARCHAR(150) NOT NULL,
        destination VARCHAR(150) NOT NULL,
        budget VARCHAR(100),
        transport VARCHAR(100),
        travelers INTEGER DEFAULT 2,
        duration_days INTEGER DEFAULT 3,
        guide_id VARCHAR(100),
        auto_transit_enabled BOOLEAN DEFAULT TRUE,
        selected_places_count INTEGER DEFAULT 0,
        itinerary_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author_name VARCHAR(150) NOT NULL,
        author_tier VARCHAR(100) DEFAULT 'Active Explorer',
        destination VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        location VARCHAR(255),
        image_url TEXT,
        upvotes INTEGER DEFAULT 1,
        comments_count INTEGER DEFAULT 0,
        ai_verification JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (username, email, password_hash, user_points, wallet_balance)
      VALUES ('saraschandra', 'saraschandra5786@gmail.com', 'password123', 300, 2500.00)
      ON CONFLICT (username) DO NOTHING;
    `);

    client.release();
    isPgConnected = true;
    console.log("PostgreSQL database tables initialized.");
  } catch (err) {
    isPgConnected = false;
    console.warn("PostgreSQL offline; using resilient JSON file store (server/tourister_db.json):", err.message);
  }
}

initDatabase();

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Tourister Hybrid (PostgreSQL + JSON Engine)",
    storage: isPgConnected ? "PostgreSQL" : "File-Based JSON Database",
    timestamp: new Date().toISOString(),
  });
});

// 2. Auth: Signup
app.post("/api/auth/signup", async (req, res) => {
  if (!isPgConnected) {
    const result = handleAuthSignup(req.body);
    return res.status(result.status).json(result.data);
  }

  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, user_points, wallet_balance)
       VALUES ($1, $2, $3, 300, 2500.00)
       RETURNING id, username, email, user_points, wallet_balance`,
      [username.trim(), email.trim().toLowerCase(), password]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username or email already exists" });
    }
    const fallback = handleAuthSignup(req.body);
    res.status(fallback.status).json(fallback.data);
  }
});

// 3. Auth: Login
app.post("/api/auth/login", async (req, res) => {
  if (!isPgConnected) {
    const result = handleAuthLogin(req.body);
    return res.status(result.status).json(result.data);
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, password_hash, user_points, wallet_balance 
       FROM users 
       WHERE username = $1 OR email = $1`,
      [username.trim()]
    );

    if (result.rows.length === 0 || result.rows[0].password_hash !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    delete user.password_hash;
    res.json({ success: true, user });
  } catch (err) {
    const fallback = handleAuthLogin(req.body);
    res.status(fallback.status).json(fallback.data);
  }
});

// 4. User: Update Points / Wallet / Password
app.put("/api/auth/user/:username", async (req, res) => {
  const { username } = req.params;
  const { userPoints, walletBalance, newPassword } = req.body;

  if (!isPgConnected) {
    const result = handleUpdateUser(username, req.body);
    return res.status(result.status).json(result.data);
  }

  try {
    const updates = [];
    const values = [username];
    let idx = 2;

    if (userPoints !== undefined) {
      updates.push(`user_points = $${idx++}`);
      values.push(userPoints);
    }
    if (walletBalance !== undefined) {
      updates.push(`wallet_balance = $${idx++}`);
      values.push(walletBalance);
    }
    if (newPassword) {
      updates.push(`password_hash = $${idx++}`);
      values.push(newPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const query = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE username = $1
      RETURNING id, username, email, user_points, wallet_balance
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    const fallback = handleUpdateUser(username, req.body);
    res.status(fallback.status).json(fallback.data);
  }
});

// 5. Trip Plans: Save Itinerary
app.post("/api/plans", async (req, res) => {
  if (!isPgConnected) {
    const result = handleSavePlan(req.body);
    return res.status(result.status).json(result.data);
  }

  const {
    username,
    source,
    destination,
    budget,
    transport,
    travelers,
    durationDays,
    guideId,
    autoTransitEnabled,
    selectedPlacesCount,
    itineraryData,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO saved_plans 
       (username, source, destination, budget, transport, travelers, duration_days, guide_id, auto_transit_enabled, selected_places_count, itinerary_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        username || "Tourister",
        source,
        destination,
        budget,
        transport,
        travelers || 2,
        durationDays || 3,
        guideId,
        autoTransitEnabled !== false,
        selectedPlacesCount || 0,
        itineraryData ? JSON.stringify(itineraryData) : null,
      ]
    );

    res.status(201).json({ success: true, plan: result.rows[0] });
  } catch (err) {
    const fallback = handleSavePlan(req.body);
    res.status(fallback.status).json(fallback.data);
  }
});

// 6. Trip Plans: Get User Itineraries
app.get("/api/plans/:username", async (req, res) => {
  const { username } = req.params;

  if (!isPgConnected) {
    const result = handleGetPlans(username);
    return res.status(result.status).json(result.data);
  }

  try {
    const result = await pool.query(
      `SELECT * FROM saved_plans WHERE username = $1 ORDER BY created_at DESC`,
      [username]
    );
    res.json({ success: true, plans: result.rows });
  } catch (err) {
    const fallback = handleGetPlans(username);
    res.status(fallback.status).json(fallback.data);
  }
});

// 7. Community: Fetch Posts
app.get("/api/posts", async (req, res) => {
  if (!isPgConnected) {
    const db = readDb();
    return res.json({ success: true, posts: db.community_posts || [] });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    const db = readDb();
    res.json({ success: true, posts: db.community_posts || [] });
  }
});

// 8. Community: Create Post
app.post("/api/posts", async (req, res) => {
  if (!isPgConnected) {
    const db = readDb();
    const newPost = {
      id: req.body.id || `post-${Date.now()}`,
      ...req.body,
      created_at: req.body.createdAt || new Date().toISOString(),
    };
    if (!db.community_posts) db.community_posts = [];
    db.community_posts = db.community_posts.filter((p) => p.id !== newPost.id);
    db.community_posts.unshift(newPost);
    writeDb(db);
    return res.status(201).json({ success: true, post: newPost });
  }

  const {
    authorName,
    authorTier,
    destination,
    category,
    title,
    content,
    location,
    imageUrl,
    aiVerification,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO community_posts 
       (author_name, author_tier, destination, category, title, content, location, image_url, ai_verification)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        authorName || "Verified Traveler",
        authorTier || "Active Explorer",
        destination,
        category,
        title,
        content,
        location,
        imageUrl,
        aiVerification ? JSON.stringify(aiVerification) : null,
      ]
    );

    res.status(201).json({ success: true, post: result.rows[0] });
  } catch (err) {
    const db = readDb();
    const newPost = {
      id: req.body.id || `post-${Date.now()}`,
      ...req.body,
      created_at: req.body.createdAt || new Date().toISOString(),
    };
    if (!db.community_posts) db.community_posts = [];
    db.community_posts = db.community_posts.filter((p) => p.id !== newPost.id);
    db.community_posts.unshift(newPost);
    writeDb(db);
    res.status(201).json({ success: true, post: newPost });
  }
});

app.listen(PORT, () => {
  console.log(`Tourister Hybrid Server running on port ${PORT}`);
});

