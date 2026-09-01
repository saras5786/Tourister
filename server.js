import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool configuration
// Uses DATABASE_URL or individual PG environment variables with sensible defaults
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/tourister_db",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
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
    console.log("PostgreSQL database tables initialized.");
  } catch (err) {
    console.warn("PostgreSQL connection notice (running with automatic client-side database persistence):", err.message);
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
    service: "Tourister AI PostgreSQL Engine",
    timestamp: new Date().toISOString(),
  });
});

// 2. Auth: Signup
app.post("/api/auth/signup", async (req, res) => {
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
    res.status(500).json({ error: "Database error during signup", details: err.message });
  }
});

// 3. Auth: Login
app.post("/api/auth/login", async (req, res) => {
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
    res.status(500).json({ error: "Database error during login", details: err.message });
  }
});

// 4. User: Update Points / Wallet / Password
app.put("/api/auth/user/:username", async (req, res) => {
  const { username } = req.params;
  const { userPoints, walletBalance, newPassword } = req.body;

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
    res.status(500).json({ error: "Database update error", details: err.message });
  }
});

// 5. Trip Plans: Save Itinerary
app.post("/api/plans", async (req, res) => {
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
    res.status(500).json({ error: "Error saving plan to PostgreSQL", details: err.message });
  }
});

// 6. Trip Plans: Get User Itineraries
app.get("/api/plans/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM saved_plans WHERE username = $1 ORDER BY created_at DESC`,
      [username]
    );
    res.json({ success: true, plans: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Error fetching saved plans", details: err.message });
  }
});

// 7. Community: Fetch Posts
app.get("/api/posts", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Error fetching posts", details: err.message });
  }
});

// 8. Community: Create Post
app.post("/api/posts", async (req, res) => {
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
    res.status(500).json({ error: "Error creating community post", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Tourister PostgreSQL Backend running on port ${PORT}`);
});
