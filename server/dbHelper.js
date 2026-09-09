import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "tourister_db.json");

// ----------------------------------------------------
// Cryptographic Password Hashing (PBKDF2 + SHA-512)
// ----------------------------------------------------
export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  // Legacy plain text check (allows automatic migration)
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

const DEFAULT_DB = {
  users: [
    {
      id: "usr-default-saras",
      username: "saraschandra",
      email: "saraschandra5786@gmail.com",
      password_hash: hashPassword("password123", "seed_salt_saras1"),
      user_points: 300,
      wallet_balance: 2500.0,
      created_at: new Date().toISOString(),
    },
    {
      id: "usr-default-explorer",
      username: "tourister_explorer",
      email: "explorer@tourister.com",
      password_hash: hashPassword("explore123", "seed_salt_explore1"),
      user_points: 600,
      wallet_balance: 3200.0,
      created_at: new Date().toISOString(),
    },
  ],
  saved_plans: [],
  community_posts: [],
};

export function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data);
    if (!parsed.users) parsed.users = [];
    if (!parsed.saved_plans) parsed.saved_plans = [];
    if (!parsed.community_posts) parsed.community_posts = [];
    return parsed;
  } catch (err) {
    console.error("Error reading tourister_db.json:", err.message);
    return DEFAULT_DB;
  }
}

export function writeDb(db) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), "utf8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Error writing tourister_db.json:", err.message);
  }
}

// ----------------------------------------------------
// User Authentication
// ----------------------------------------------------
export function handleAuthSignup(body) {
  const { username, email, password } = body;
  if (!username || !email || !password) {
    return { status: 400, data: { error: "All fields are required" } };
  }

  const db = readDb();
  const lowerUser = username.trim().toLowerCase();
  const lowerEmail = email.trim().toLowerCase();

  const exists = db.users.some(
    (u) =>
      u.username?.toLowerCase() === lowerUser ||
      u.email?.toLowerCase() === lowerEmail
  );

  if (exists) {
    return { status: 409, data: { error: "Username or email already exists" } };
  }

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: username.trim(),
    email: lowerEmail,
    password_hash: hashPassword(password),
    user_points: 300,
    wallet_balance: 2500.0,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  const safeUser = { ...newUser };
  delete safeUser.password_hash;
  return { status: 201, data: { success: true, user: safeUser } };
}

export function handleAuthLogin(body) {
  const { username, password } = body;
  if (!username || !password) {
    return { status: 400, data: { error: "Username and password required" } };
  }

  const db = readDb();
  const lowerInput = username.trim().toLowerCase();

  const user = db.users.find(
    (u) =>
      u.username?.toLowerCase() === lowerInput ||
      u.email?.toLowerCase() === lowerInput
  );

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { status: 401, data: { error: "Invalid username or password" } };
  }

  // Transparent migration to secure hash if user previously had legacy plain text
  if (!user.password_hash.includes(":")) {
    user.password_hash = hashPassword(password);
    writeDb(db);
  }

  const safeUser = { ...user };
  delete safeUser.password_hash;
  return { status: 200, data: { success: true, user: safeUser } };
}

export function handleUpdateUser(usernameParam, updates) {
  const db = readDb();
  const lowerUser = usernameParam.trim().toLowerCase();
  const idx = db.users.findIndex(
    (u) => u.username?.toLowerCase() === lowerUser
  );

  if (idx === -1) {
    return { status: 404, data: { error: "User not found" } };
  }

  if (updates.userPoints !== undefined)
    db.users[idx].user_points = updates.userPoints;
  if (updates.walletBalance !== undefined)
    db.users[idx].wallet_balance = updates.walletBalance;
  if (updates.newPassword)
    db.users[idx].password_hash = hashPassword(updates.newPassword);

  writeDb(db);

  const safeUser = { ...db.users[idx] };
  delete safeUser.password_hash;
  return { status: 200, data: { success: true, user: safeUser } };
}

// ----------------------------------------------------
// Trip Plans
// ----------------------------------------------------
export function handleSavePlan(planData) {
  const db = readDb();
  const newPlan = {
    id: `plan-${Date.now()}`,
    ...planData,
    created_at: new Date().toISOString(),
  };
  db.saved_plans.unshift(newPlan);
  writeDb(db);
  return { status: 201, data: { success: true, plan: newPlan } };
}

export function handleGetPlans(usernameParam) {
  const db = readDb();
  const lowerUser = usernameParam.trim().toLowerCase();
  const plans = db.saved_plans.filter(
    (p) => p.username && p.username.toLowerCase() === lowerUser
  );
  return { status: 200, data: { success: true, plans } };
}

// ----------------------------------------------------
// Community Posts
// ----------------------------------------------------
export function handleGetPosts() {
  const db = readDb();
  const rawPosts = db.community_posts || [];
  const posts = rawPosts.map((p) => ({
    ...p,
    likedBy: Array.isArray(p.likedBy) ? p.likedBy : [],
    comments: Array.isArray(p.comments) ? p.comments : [],
    commentsCount: Array.isArray(p.comments) ? p.comments.length : p.commentsCount || 0,
    upvotes: p.upvotes !== undefined ? p.upvotes : (Array.isArray(p.likedBy) ? p.likedBy.length : 1),
  }));
  return { status: 200, data: { success: true, posts } };
}

export function handleCreatePost(postData) {
  const db = readDb();
  if (!db.community_posts) db.community_posts = [];

  const newPost = {
    id: postData.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    author: postData.author || postData.authorName || "Verified Traveler",
    avatar: postData.avatar || (postData.author || "VT").substring(0, 2).toUpperCase(),
    authorTier: postData.authorTier || "Active Contributor",
    destination: postData.destination || "General",
    category: postData.category || "Travel Tip",
    categoryIcon: postData.categoryIcon || "ALERT",
    title: postData.title || "Traveler Report",
    content: postData.content || "",
    location: postData.location || `${postData.destination || "General"} Area`,
    image: postData.image || postData.imageUrl || null,
    timestamp: postData.timestamp || "Just now",
    upvotes: postData.upvotes !== undefined ? postData.upvotes : 1,
    likedBy: Array.isArray(postData.likedBy) ? postData.likedBy : [],
    commentsCount: Array.isArray(postData.comments) ? postData.comments.length : (postData.commentsCount || 0),
    comments: Array.isArray(postData.comments) ? postData.comments : [],
    aiVerification: postData.aiVerification || null,
    isHiddenGem: !!postData.isHiddenGem,
    createdAt: postData.createdAt || new Date().toISOString(),
  };

  // Deduplicate and place at top
  db.community_posts = db.community_posts.filter((p) => p.id !== newPost.id);
  db.community_posts.unshift(newPost);
  writeDb(db);

  return { status: 201, data: { success: true, post: newPost } };
}

export function handleToggleLike(postId, username) {
  if (!postId || !username) {
    return { status: 400, data: { success: false, error: "Post ID and username are required" } };
  }
  const db = readDb();
  if (!db.community_posts) db.community_posts = [];
  const post = db.community_posts.find((p) => p.id === postId);
  if (!post) {
    return { status: 404, data: { success: false, error: "Post not found" } };
  }
  if (!Array.isArray(post.likedBy)) post.likedBy = [];
  const normalizedUser = username.trim().toLowerCase();
  const userIdx = post.likedBy.findIndex((u) => u.toLowerCase() === normalizedUser);
  let isLiked = false;

  if (userIdx !== -1) {
    post.likedBy.splice(userIdx, 1);
    post.upvotes = Math.max(0, (post.upvotes || 1) - 1);
    isLiked = false;
  } else {
    post.likedBy.push(username.trim());
    post.upvotes = (post.upvotes || 0) + 1;
    isLiked = true;
  }

  writeDb(db);
  return {
    status: 200,
    data: {
      success: true,
      postId: post.id,
      upvotes: post.upvotes,
      likedBy: post.likedBy,
      isLiked,
    },
  };
}

export function handleAddComment(postId, commentData) {
  const { author, text } = commentData || {};
  if (!postId || !text || !text.trim()) {
    return { status: 400, data: { success: false, error: "Comment text is required" } };
  }
  const db = readDb();
  if (!db.community_posts) db.community_posts = [];
  const post = db.community_posts.find((p) => p.id === postId);
  if (!post) {
    return { status: 404, data: { success: false, error: "Post not found" } };
  }

  if (!Array.isArray(post.comments)) post.comments = [];
  const newComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    author: (author || "Explorer").trim(),
    avatar: (author || "EX").substring(0, 2).toUpperCase(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  post.comments.push(newComment);
  post.commentsCount = post.comments.length;
  writeDb(db);

  return {
    status: 201,
    data: {
      success: true,
      postId: post.id,
      comment: newComment,
      commentsCount: post.commentsCount,
      comments: post.comments,
    },
  };
}

export function handleDeletePost(postId, username) {
  if (!postId) {
    return { status: 400, data: { success: false, error: "Post ID is required" } };
  }
  const db = readDb();
  if (!db.community_posts) db.community_posts = [];
  const postIdx = db.community_posts.findIndex((p) => p.id === postId);
  if (postIdx === -1) {
    return { status: 404, data: { success: false, error: "Post not found" } };
  }

  const post = db.community_posts[postIdx];
  if (username && post.author && post.author.toLowerCase() !== username.toLowerCase()) {
    return { status: 403, data: { success: false, error: "Unauthorized to delete this post" } };
  }

  db.community_posts.splice(postIdx, 1);
  writeDb(db);
  return { status: 200, data: { success: true, message: "Post deleted successfully", postId } };
}
