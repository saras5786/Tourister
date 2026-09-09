// Tourister Persistent Backend Database Service

function getApiBase() {
  if (typeof window !== "undefined") {
    // If an explicit backend URL is defined in environment, use it
    if (import.meta.env?.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    }
    // In browser: '/api' uses the host running the app (supported via Vite proxy or direct Express)
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
      signal: options.signal || AbortSignal.timeout(5000),
    });
    // If relative /api returned 404/502 on a dev port, attempt direct connection to port 5000
    if (
      (res.status === 404 || res.status === 502) &&
      typeof window !== "undefined" &&
      window.location.port !== "5000"
    ) {
      try {
        const fallbackUrl = `http://${window.location.hostname}:5000/api${endpoint}`;
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          signal: options.signal || AbortSignal.timeout(5000),
        });
        if (
          fallbackRes.ok ||
          (fallbackRes.status >= 400 &&
            fallbackRes.status < 500 &&
            fallbackRes.status !== 404)
        ) {
          return fallbackRes;
        }
      } catch (err2) {
        // Fallback failed, keep original res
      }
    }
    return res;
  } catch (err) {
    // If relative /api network connection failed (e.g., when Vite frontend runs on 5173 without proxy and Express is on 5000),
    // fallback to connecting to port 5000 on the same machine/LAN IP
    if (typeof window !== "undefined" && window.location.port !== "5000") {
      try {
        const fallbackUrl = `http://${window.location.hostname}:5000/api${endpoint}`;
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          signal: options.signal || AbortSignal.timeout(5000),
        });
        return fallbackRes;
      } catch (err2) {
        // Fallback also failed
      }
    }
    throw err;
  }
}

// ----------------------------------------------------
// 1. User Login (Validated against server database)
// ----------------------------------------------------
export async function loginUser(username, password) {
  try {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      return { success: true, user: data.user, source: "TouristerServer" };
    }
    return { success: false, error: data.error || "Invalid username or password" };
  } catch (err) {
    return {
      success: false,
      error: "Cannot connect to Tourister server. Please ensure the backend is running.",
    };
  }
}

// ----------------------------------------------------
// 2. User Signup (Saved to server database with hash)
// ----------------------------------------------------
export async function signupUser(username, email, password) {
  try {
    const res = await apiFetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      return { success: true, user: data.user, source: "TouristerServer" };
    }
    return { success: false, error: data.error || "Failed to create account" };
  } catch (err) {
    return {
      success: false,
      error: "Cannot connect to Tourister server. Please ensure the backend is running.",
    };
  }
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
    return { success: false, error: data.error || "Update failed" };
  } catch (err) {
    return { success: false, error: err.message };
  }
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
    return { success: false, error: data.error || "Failed to save trip plan" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getUserPlans(username) {
  try {
    const res = await apiFetch(`/plans/${encodeURIComponent(username)}`);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, plans: data.plans || [] };
    }
    return { success: false, plans: [] };
  } catch (err) {
    return { success: false, plans: [] };
  }
}

// ----------------------------------------------------
// 5. Community Posts: Fetch from shared server database
// ----------------------------------------------------
export async function fetchCommunityPosts() {
  try {
    const res = await apiFetch("/community/posts");
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.posts)) {
      return data.posts;
    }
    return [];
  } catch (err) {
    console.warn("Could not fetch community posts from server:", err.message);
    return [];
  }
}

// ----------------------------------------------------
// 6. Community Posts: Create in shared server database
// ----------------------------------------------------
export async function createCommunityPost(postData) {
  try {
    const res = await apiFetch("/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    const data = await res.json();
    if (res.ok && data.success && data.post) {
      return { success: true, post: data.post };
    }
    return { success: false, error: data.error || "Failed to publish post" };
  } catch (err) {
    return {
      success: false,
      error: "Cannot connect to Tourister server to publish post.",
    };
  }
}

// ----------------------------------------------------
// 7. Community Posts: Like / Upvote (Shared across all users)
// ----------------------------------------------------
export async function togglePostLike(postId, username) {
  try {
    const res = await apiFetch(`/community/posts/${encodeURIComponent(postId)}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, ...data };
    }
    return { success: false, error: data.error || "Failed to like post" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// 8. Community Posts: Add Comment (Shared across all users)
// ----------------------------------------------------
export async function addPostComment(postId, { author, text }) {
  try {
    const res = await apiFetch(`/community/posts/${encodeURIComponent(postId)}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.comment) {
      return { success: true, ...data };
    }
    return { success: false, error: data.error || "Failed to add comment" };
  } catch (err) {
    return { success: false, error: err.message };
  }
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
    return { success: false, error: err.message };
  }
}

