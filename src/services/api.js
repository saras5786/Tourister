// Tourister In-App Persistent Database Service
// Integrated database for seamless user authentication and community social posts

import { DEFAULT_USERS, DEFAULT_COMMUNITY_POSTS } from "../data/appDatabase";

// Keys for browser-level database persistence
const DB_USERS_KEY = "tourister_db_users";
const DB_POSTS_KEY = "tourister_db_posts";
const DB_PLANS_KEY = "tourister_db_plans";

// Initialize In-App Database with default records if not yet populated
function getDbUsers() {
  try {
    const raw = localStorage.getItem(DB_USERS_KEY);
    if (raw) {
      const users = JSON.parse(raw);
      if (Array.isArray(users) && users.length > 0) {
        return users;
      }
    }
  } catch (e) {}
  // Seed with default users
  try {
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(DEFAULT_USERS));
  } catch (e) {}
  return [...DEFAULT_USERS];
}

function saveDbUsers(users) {
  try {
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

function getDbPosts() {
  try {
    const raw = localStorage.getItem(DB_POSTS_KEY);
    if (raw) {
      const posts = JSON.parse(raw);
      if (Array.isArray(posts) && posts.length > 0) {
        return posts.map((p) => ({
          ...p,
          category: p.category || "Scam Alert",
          author: p.author || "Traveler",
          avatar: p.avatar || (p.author ? p.author.substring(0, 2).toUpperCase() : "TR"),
          title: p.title || "Travel Advisory",
          content: p.content || p.description || "",
          location: p.location || p.destination || "Local Area",
          destination: p.destination || "General",
          upvotes: p.upvotes !== undefined ? p.upvotes : (p.likes || 0),
          likes: p.likes !== undefined ? p.likes : (p.upvotes || 0),
          likedBy: Array.isArray(p.likedBy) ? p.likedBy : [],
          comments: Array.isArray(p.comments) ? p.comments : [],
        }));
      }
    }
  } catch (e) {}
  // Seed with default community posts
  try {
    localStorage.setItem(DB_POSTS_KEY, JSON.stringify(DEFAULT_COMMUNITY_POSTS));
  } catch (e) {}
  return [...DEFAULT_COMMUNITY_POSTS];
}

function saveDbPosts(posts) {
  try {
    localStorage.setItem(DB_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {}
}

// Optional Local/Network API Fetch Helper (non-blocking)
function getApiBase() {
  if (typeof window !== "undefined") {
    if (import.meta.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    }
    return "/api";
  }
  return "http://localhost:5000/api";
}

async function tryServerFetch(endpoint, options = {}) {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}${endpoint}`, {
      ...options,
      signal: options.signal || AbortSignal.timeout(2000),
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (e) {
    // Server offline or static host
  }
  return null;
}

// ----------------------------------------------------
// 1. User Login (Validated directly against in-app database)
// ----------------------------------------------------
export async function loginUser(username, password) {
  const cleanUser = username?.trim().toLowerCase();
  const cleanPass = password?.trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: "Please enter both username and password." };
  }

  // 1. Try local/network server if active (sync server)
  const serverData = await tryServerFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: cleanUser, password: cleanPass }),
  });
  if (serverData && serverData.success && serverData.user) {
    // Cache user in in-app database
    const users = getDbUsers();
    if (!users.some((u) => u.username.toLowerCase() === cleanUser)) {
      users.push({ ...serverData.user, password: cleanPass });
      saveDbUsers(users);
    }
    return { success: true, user: serverData.user, source: "ServerDatabase" };
  }

  // 2. Validate against In-App Database
  const users = getDbUsers();
  const found = users.find(
    (u) =>
      u.username?.toLowerCase() === cleanUser ||
      (u.email && u.email?.toLowerCase() === cleanUser)
  );

  if (found) {
    if (found.password === cleanPass || !found.password) {
      return { success: true, user: found, source: "AppDatabase" };
    }
    return { success: false, error: "Invalid password for this account. Please try again." };
  }

  return {
    success: false,
    error: "Account not found. Click 'Sign Up' to create your account instantly!",
  };
}

// ----------------------------------------------------
// 2. User Signup (Saved into in-app database permanently)
// ----------------------------------------------------
export async function signupUser(username, email, password) {
  const cleanUser = username?.trim();
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPass = password?.trim();

  if (!cleanUser || !cleanEmail || !cleanPass) {
    return { success: false, error: "Please fill out all fields." };
  }

  // 1. Check in-app database for duplicates
  const users = getDbUsers();
  if (
    users.some(
      (u) =>
        u.username?.toLowerCase() === cleanUser.toLowerCase() ||
        (u.email && u.email?.toLowerCase() === cleanEmail)
    )
  ) {
    return { success: false, error: "An account with this username or email already exists!" };
  }

  // 2. Create new user record
  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUser,
    email: cleanEmail,
    password: cleanPass,
    user_points: 300,
    wallet_balance: 2500,
    created_at: new Date().toISOString(),
  };

  // 3. Save into In-App Database
  users.push(newUser);
  saveDbUsers(users);

  // 4. Also notify local server if available (background)
  tryServerFetch("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: cleanUser, email: cleanEmail, password: cleanPass }),
  });

  return { success: true, user: newUser, source: "AppDatabase" };
}

// ----------------------------------------------------
// 3. Update User Data (Points / Wallet / Password)
// ----------------------------------------------------
export async function updateUserData(username, updates) {
  const users = getDbUsers();
  const idx = users.findIndex((u) => u.username?.toLowerCase() === username?.toLowerCase());

  if (idx !== -1) {
    if (updates.userPoints !== undefined) users[idx].user_points = updates.userPoints;
    if (updates.walletBalance !== undefined) users[idx].wallet_balance = updates.walletBalance;
    if (updates.newPassword) users[idx].password = updates.newPassword;
    saveDbUsers(users);

    // Sync to local server if available
    tryServerFetch(`/auth/user/${encodeURIComponent(username)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    return { success: true, user: users[idx], source: "AppDatabase" };
  }

  return { success: false, error: "User not found" };
}

// ----------------------------------------------------
// 4. Trip Plans
// ----------------------------------------------------
export async function saveTripPlan(planData) {
  try {
    const raw = localStorage.getItem(DB_PLANS_KEY);
    const plans = raw ? JSON.parse(raw) : [];
    const newPlan = {
      ...planData,
      id: planData.id || `plan-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    plans.unshift(newPlan);
    localStorage.setItem(DB_PLANS_KEY, JSON.stringify(plans));

    tryServerFetch("/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlan),
    });

    return { success: true, plan: newPlan, source: "AppDatabase" };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function getUserPlans(username) {
  try {
    const raw = localStorage.getItem(DB_PLANS_KEY);
    const plans = raw ? JSON.parse(raw) : [];
    const userPlans = plans.filter((p) => p.username === username);
    return { success: true, plans: userPlans };
  } catch (e) {
    return { success: false, plans: [] };
  }
}

// ----------------------------------------------------
// 5. Community Posts: Fetch from In-App Database
// ----------------------------------------------------
export async function fetchCommunityPosts() {
  // 1. Try local server first if available
  const serverData = await tryServerFetch("/community/posts");
  if (serverData && serverData.success && Array.isArray(serverData.posts) && serverData.posts.length > 0) {
    saveDbPosts(serverData.posts);
    return serverData.posts;
  }

  // 2. Return from In-App Database
  return getDbPosts();
}

// ----------------------------------------------------
// 6. Community Posts: Create in In-App Database
// ----------------------------------------------------
export async function createCommunityPost(postData) {
  const newPost = {
    ...postData,
    id: postData.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: (postData.title || "").trim(),
    content: (postData.content || postData.description || "").trim(),
    description: (postData.description || postData.content || "").trim(),
    author: postData.author || "Traveler",
    avatar: postData.avatar || (postData.author ? postData.author.substring(0, 2).toUpperCase() : "TR"),
    destination: postData.destination || "General",
    category: postData.category || "Scam Alert",
    categoryIcon: postData.categoryIcon || "ALERT",
    location: postData.location || `${postData.destination || "General"} Area`,
    timestamp: postData.timestamp || "Just now",
    upvotes: postData.upvotes !== undefined ? postData.upvotes : (postData.likes || 0),
    likes: postData.likes !== undefined ? postData.likes : (postData.upvotes || 0),
    likedBy: Array.isArray(postData.likedBy) ? postData.likedBy : [],
    commentsCount: postData.commentsCount || (Array.isArray(postData.comments) ? postData.comments.length : 0),
    comments: Array.isArray(postData.comments) ? postData.comments : [],
    aiVerification: postData.aiVerification || null,
    isHiddenGem: Boolean(postData.isHiddenGem),
    imageUrl: postData.imageUrl || postData.image || "",
    image: postData.image || postData.imageUrl || null,
    createdAt: postData.createdAt || new Date().toISOString(),
  };

  // Save into in-app database
  const posts = getDbPosts();
  const updated = [newPost, ...posts.filter((p) => p.id !== newPost.id)];
  saveDbPosts(updated);

  // Sync to local server if available
  tryServerFetch("/community/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPost),
  });

  return { success: true, post: newPost, source: "AppDatabase" };
}

// ----------------------------------------------------
// 7. Community Posts: Toggle Like in In-App Database
// ----------------------------------------------------
export async function togglePostLike(postId, username) {
  const posts = getDbPosts();
  const post = posts.find((p) => p.id === postId);

  if (post) {
    post.likedBy = post.likedBy || [];
    const idx = post.likedBy.indexOf(username);
    let liked = false;
    if (idx !== -1) {
      post.likedBy.splice(idx, 1);
      post.likes = Math.max(0, (post.likes || 1) - 1);
    } else {
      post.likedBy.push(username);
      post.likes = (post.likes || 0) + 1;
      liked = true;
    }
    post.upvotes = post.likes;
    saveDbPosts(posts);

    // Sync to local server if available
    tryServerFetch(`/community/posts/${encodeURIComponent(postId)}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    return { success: true, likes: post.likes, liked, likedBy: post.likedBy };
  }

  return { success: true, likes: 1, liked: true };
}

// ----------------------------------------------------
// 8. Community Posts: Add Comment in In-App Database
// ----------------------------------------------------
export async function addPostComment(postId, { author, text }) {
  const newComment = {
    id: `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    author: author || "Traveler",
    text: text?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  const posts = getDbPosts();
  const post = posts.find((p) => p.id === postId);

  if (post) {
    post.comments = post.comments || [];
    post.comments.push(newComment);
    post.commentsCount = post.comments.length;
    saveDbPosts(posts);

    // Sync to local server if available
    tryServerFetch(`/community/posts/${encodeURIComponent(postId)}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text }),
    });

    return { success: true, comment: newComment, commentsCount: post.comments.length };
  }

  return { success: true, comment: newComment, commentsCount: 1 };
}

// ----------------------------------------------------
// 9. Community Posts: Delete Post from In-App Database
// ----------------------------------------------------
export async function deleteCommunityPost(postId, username) {
  const posts = getDbPosts();
  const filtered = posts.filter((p) => p.id !== postId);
  saveDbPosts(filtered);

  // Sync to local server if available
  tryServerFetch(`/community/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  return { success: true };
}
