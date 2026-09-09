// Tourister Persistent Backend Database Service with Graceful Static Host / Offline Fallback
import { initialCommunityPosts } from "../data/communityPosts";

function getApiBase() {
  if (typeof window !== "undefined") {
    // If an explicit backend URL is defined in environment, use it
    if (import.meta.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    }
    // If on GitHub Pages and no backend URL provided, default to /api (will gracefully fall back if unreachable)
    return "/api";
  }
  return "http://localhost:5000/api";
}

// Resilient API Fetch Helper with automatic LAN/port fallback
async function apiFetch(endpoint, options = {}) {
  const base = getApiBase();
  const fullUrl = `${base}${endpoint}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      signal: options.signal || AbortSignal.timeout(3500),
    });

    // Check if the response is actual JSON from our backend
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res;
    }

    // If response was 404 or HTML (e.g. GitHub Pages static 404), try direct connection to port 5000 if running locally
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      window.location.port !== "5000"
    ) {
      try {
        const fallbackUrl = `http://localhost:5000/api${endpoint}`;
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          signal: options.signal || AbortSignal.timeout(3000),
        });
        const fbContentType = fallbackRes.headers.get("content-type") || "";
        if (fbContentType.includes("application/json")) {
          return fallbackRes;
        }
      } catch (e) {}
    }

    // If not JSON, throw to trigger graceful fallback
    throw new Error(`Server returned non-JSON response (${res.status})`);
  } catch (err) {
    // If on localhost and relative fetch failed, try direct port 5000
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      window.location.port !== "5000"
    ) {
      try {
        const fallbackUrl = `http://localhost:5000/api${endpoint}`;
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          signal: options.signal || AbortSignal.timeout(3000),
        });
        const fbContentType = fallbackRes.headers.get("content-type") || "";
        if (fbContentType.includes("application/json")) {
          return fallbackRes;
        }
      } catch (e) {}
    }
    throw err;
  }
}

// Helper: read local users from localStorage safely
function getLocalUsers() {
  try {
    const raw = localStorage.getItem("tourister_users");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Helper: save local users to localStorage safely
function saveLocalUsers(users) {
  try {
    localStorage.setItem("tourister_users", JSON.stringify(users));
  } catch (e) {}
}

// ----------------------------------------------------
// 1. User Login (Validated against server DB with offline fallback)
// ----------------------------------------------------
export async function loginUser(username, password) {
  // A. Try Server Database First
  try {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      // Also cache user locally
      const users = getLocalUsers();
      if (!users.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
        users.push({ ...data.user, password });
        saveLocalUsers(users);
      }
      return { success: true, user: data.user, source: "TouristerServer" };
    }
    if (data && data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.info("Tourister server offline, attempting local session check:", err.message);
  }

  // B. Graceful Offline / GitHub Pages Fallback
  const users = getLocalUsers();
  const found = users.find(
    (u) =>
      u.username?.toLowerCase() === username.toLowerCase() ||
      (u.email && u.email?.toLowerCase() === username.toLowerCase())
  );

  if (found) {
    if (found.password === password) {
      return { success: true, user: found, source: "LocalBrowser" };
    }
    return { success: false, error: "Invalid password for this account." };
  }

  return {
    success: false,
    error: "Account not found. If this is your first time on this device, please click 'Sign Up' to create your account.",
  };
}

// ----------------------------------------------------
// 2. User Signup (Saved to server DB with offline fallback)
// ----------------------------------------------------
export async function signupUser(username, email, password) {
  // A. Try Server Database First
  try {
    const res = await apiFetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      // Cache user locally
      const users = getLocalUsers();
      users.push({ ...data.user, password });
      saveLocalUsers(users);
      return { success: true, user: data.user, source: "TouristerServer" };
    }
    if (data && data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.info("Tourister server offline, using local signup fallback:", err.message);
  }

  // B. Graceful Offline / GitHub Pages Fallback
  const users = getLocalUsers();
  if (
    users.some(
      (u) =>
        u.username?.toLowerCase() === username.toLowerCase() ||
        (u.email && u.email?.toLowerCase() === email.toLowerCase())
    )
  ) {
    return { success: false, error: "An account with this username or email already exists!" };
  }

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username,
    email,
    password,
    user_points: 300,
    wallet_balance: 2500,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveLocalUsers(users);

  return { success: true, user: newUser, source: "LocalBrowser" };
}

// ----------------------------------------------------
// 3. Update User Data (Points / Wallet / Password)
// ----------------------------------------------------
export async function updateUserData(username, updates) {
  try {
    const res = await apiFetch(`/auth/user/${encodeURIComponent(username)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      return { success: true, user: data.user, source: "TouristerServer" };
    }
  } catch (err) {
    // Local fallback
  }

  const users = getLocalUsers();
  const idx = users.findIndex((u) => u.username?.toLowerCase() === username.toLowerCase());
  if (idx !== -1) {
    if (updates.userPoints !== undefined) users[idx].user_points = updates.userPoints;
    if (updates.walletBalance !== undefined) users[idx].wallet_balance = updates.walletBalance;
    if (updates.newPassword) users[idx].password = updates.newPassword;
    saveLocalUsers(users);
    return { success: true, user: users[idx], source: "LocalBrowser" };
  }

  return { success: false, error: "User not found" };
}

// ----------------------------------------------------
// 4. Trip Plans
// ----------------------------------------------------
export async function saveTripPlan(planData) {
  try {
    const res = await apiFetch("/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, plan: data.plan, source: "TouristerServer" };
    }
  } catch (err) {
    // Local fallback
  }

  try {
    const raw = localStorage.getItem("tourister_saved_plans");
    const plans = raw ? JSON.parse(raw) : [];
    plans.unshift(planData);
    localStorage.setItem("tourister_saved_plans", JSON.stringify(plans));
  } catch (e) {}

  return { success: true, plan: planData, source: "LocalBrowser" };
}

export async function getUserPlans(username) {
  try {
    const res = await apiFetch(`/plans/${encodeURIComponent(username)}`);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, plans: data.plans || [] };
    }
  } catch (err) {
    // Local fallback
  }

  try {
    const raw = localStorage.getItem("tourister_saved_plans");
    const plans = raw ? JSON.parse(raw) : [];
    const userPlans = plans.filter((p) => p.username === username);
    return { success: true, plans: userPlans };
  } catch (e) {
    return { success: false, plans: [] };
  }
}

// ----------------------------------------------------
// 5. Community Posts: Fetch (Server first, then cached/initial)
// ----------------------------------------------------
export async function fetchCommunityPosts() {
  try {
    const res = await apiFetch("/community/posts", {
      signal: AbortSignal.timeout(3500),
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.posts) && data.posts.length > 0) {
      try {
        localStorage.setItem("tourister_community_posts", JSON.stringify(data.posts));
      } catch (e) {}
      return data.posts;
    }
  } catch (err) {
    console.warn("Server community fetch offline, using cache/initial posts:", err.message);
  }

  // Local cache fallback
  try {
    const cached = localStorage.getItem("tourister_community_posts");
    if (cached) {
      const posts = JSON.parse(cached);
      if (Array.isArray(posts) && posts.length > 0) {
        return posts;
      }
    }
  } catch (e) {}

  return initialCommunityPosts;
}

// ----------------------------------------------------
// 6. Community Posts: Create (Server first, then local cache)
// ----------------------------------------------------
export async function createCommunityPost(postData) {
  const newPost = {
    id: postData.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: postData.title || "",
    description: postData.description || postData.content || "",
    content: postData.content || postData.description || "",
    author: postData.author || "Traveler",
    destination: postData.destination || "General",
    tags: postData.tags || ["Travel"],
    likes: 0,
    likedBy: [],
    comments: [],
    imageUrl: postData.imageUrl || "",
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await apiFetch("/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
      signal: AbortSignal.timeout(3500),
    });

    const data = await res.json();
    if (res.ok && data.success && data.post) {
      return { success: true, post: data.post };
    }
  } catch (err) {
    console.warn("Server post creation offline, saving locally:", err.message);
  }

  // Save to local cache
  try {
    const cached = JSON.parse(localStorage.getItem("tourister_community_posts") || "[]");
    const updated = [newPost, ...cached.filter((p) => p.id !== newPost.id)];
    localStorage.setItem("tourister_community_posts", JSON.stringify(updated));
  } catch (e) {}

  return { success: true, post: newPost, source: "LocalBrowser" };
}

// ----------------------------------------------------
// 7. Community Posts: Like / Upvote
// ----------------------------------------------------
export async function togglePostLike(postId, username) {
  try {
    const res = await apiFetch(`/community/posts/${encodeURIComponent(postId)}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, ...data };
    }
  } catch (err) {
    // Local fallback
  }

  try {
    const cached = JSON.parse(localStorage.getItem("tourister_community_posts") || "[]");
    const post = cached.find((p) => p.id === postId);
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
      localStorage.setItem("tourister_community_posts", JSON.stringify(cached));
      return { success: true, likes: post.likes, liked, likedBy: post.likedBy };
    }
  } catch (e) {}

  return { success: true, likes: 1, liked: true };
}

// ----------------------------------------------------
// 8. Community Posts: Add Comment
// ----------------------------------------------------
export async function addPostComment(postId, { author, text }) {
  const newComment = {
    id: `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    author: author || "Traveler",
    text: text?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await apiFetch(`/community/posts/${encodeURIComponent(postId)}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text }),
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (res.ok && data.success && data.comment) {
      return { success: true, ...data };
    }
  } catch (err) {
    // Local fallback
  }

  try {
    const cached = JSON.parse(localStorage.getItem("tourister_community_posts") || "[]");
    const post = cached.find((p) => p.id === postId);
    if (post) {
      post.comments = post.comments || [];
      post.comments.push(newComment);
      post.commentsCount = post.comments.length;
      localStorage.setItem("tourister_community_posts", JSON.stringify(cached));
      return { success: true, comment: newComment, commentsCount: post.comments.length };
    }
  } catch (e) {}

  return { success: true, comment: newComment, commentsCount: 1 };
}

// ----------------------------------------------------
// 9. Community Posts: Delete Post
// ----------------------------------------------------
export async function deleteCommunityPost(postId, username) {
  try {
    const res = await apiFetch(`/community/posts/${encodeURIComponent(postId)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    // Local fallback
    try {
      const cached = JSON.parse(localStorage.getItem("tourister_community_posts") || "[]");
      const filtered = cached.filter((p) => p.id !== postId);
      localStorage.setItem("tourister_community_posts", JSON.stringify(filtered));
      return { success: true };
    } catch (e) {
      return { success: false, error: err.message };
    }
  }
}
