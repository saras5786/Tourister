// Tourister Unified Database Service (Vite Dev Engine, Hybrid Backend & Real Global Cloud Sync)

const CLOUD_COMMUNITY_BIN = "https://extendsclass.com/api/json-storage/bin/eafaacb";
const CLOUD_COMMUNITY_BIN_BACKUP = "https://extendsclass.com/api/json-storage/bin/afdfaec";
const CLOUD_USERS_BIN = "https://extendsclass.com/api/json-storage/bin/cdcbecb";

function getApiBase() {
  if (typeof window !== "undefined") {
    // Relative '/api' automatically routes to the host serving the app
    // Works identically on laptop (localhost:5173) and phone (192.168.x.x:5173)
    return "/api";
  }
  return "http://localhost:5000/api";
}

// Helper: Cloud Users Sync (Synchronizes with universal user vault)
async function syncUserToCloud(user) {
  try {
    const res = await fetch(`${CLOUD_USERS_BIN}?_t=${Date.now()}`, { signal: AbortSignal.timeout(3500) });
    let users = [];
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users)) users = data.users;
    }
    const idx = users.findIndex(
      (u) => u.username?.toLowerCase() === user.username?.toLowerCase()
    );
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    await fetch(CLOUD_USERS_BIN, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ users, lastUpdated: new Date().toISOString() }),
      signal: AbortSignal.timeout(3500),
    });
  } catch (err) {
    // Cloud sync fallback
  }
}

// 1. User Login
export async function loginUser(username, password) {
  const apiBase = getApiBase();

  // A. Try Local/Network Server via Vite / Express
  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        // Cache locally
        saveUserToLocalStorage(data.user);
        syncUserToCloud(data.user);
        return { success: true, user: data.user, source: "TouristerServer" };
      }
    }
  } catch (err) {
    console.info("Direct server unavailable, attempting cross-device cloud sync...", err.message);
  }

  // B. Fallback to Local Storage
  const rawUsers = localStorage.getItem("tourister_users");
  const users = rawUsers ? JSON.parse(rawUsers) : [];

  const matched = users.find(
    (u) =>
      (u.username.toLowerCase() === username.toLowerCase() ||
        (u.email && u.email.toLowerCase() === username.toLowerCase())) &&
      (u.password === password || u.password_hash === password)
  );

  if (matched) {
    return { success: true, user: matched, source: "DeviceStorage" };
  }

  // C. Fallback to Global Cloud Users Vault (Works across all devices and on GitHub Pages)
  try {
    const cloudRes = await fetch(`${CLOUD_USERS_BIN}?_t=${Date.now()}`, {
      signal: AbortSignal.timeout(3500),
    });
    if (cloudRes.ok) {
      const data = await cloudRes.json();
      if (Array.isArray(data.users)) {
        const foundCloud = data.users.find(
          (u) =>
            (u.username?.toLowerCase() === username.toLowerCase() ||
              (u.email && u.email.toLowerCase() === username.toLowerCase())) &&
            (u.password === password || u.password_hash === password)
        );
        if (foundCloud) {
          saveUserToLocalStorage(foundCloud);
          return { success: true, user: foundCloud, source: "CloudVault" };
        }
      }
    }
  } catch (e) {
    // Cloud check notice
  }

  // Built-in verified accounts fallback
  if (
    (username.toLowerCase() === "sarath5786" || username.toLowerCase() === "sarath5786@gmail.com") &&
    password === "password123"
  ) {
    const demoUser = {
      username: "sarath5786",
      email: "sarath5786@gmail.com",
      password: "password123",
      userPoints: 500,
      walletBalance: 3000,
    };
    saveUserToLocalStorage(demoUser);
    return { success: true, user: demoUser, source: "DefaultAccount" };
  }

  if (
    (username.toLowerCase() === "saraschandra" || username.toLowerCase() === "saraschandra5786@gmail.com") &&
    password === "password123"
  ) {
    const demoUser = {
      username: "saraschandra",
      email: "saraschandra5786@gmail.com",
      password: "password123",
      userPoints: 300,
      walletBalance: 2500,
    };
    saveUserToLocalStorage(demoUser);
    return { success: true, user: demoUser, source: "DefaultAccount" };
  }

  return { success: false, error: "Invalid username or password" };
}

// 2. User Signup
export async function signupUser(username, email, password) {
  const apiBase = getApiBase();
  let createdUser = null;

  // A. Try Server Database via Vite / Express
  try {
    const res = await fetch(`${apiBase}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        createdUser = data.user;
      }
    } else {
      const errData = await res.json();
      if (res.status === 409) {
        return { success: false, error: errData.error || "Username or email already exists" };
      }
    }
  } catch (err) {
    console.info("Server signup offline, using local & cloud sync:", err.message);
  }

  // B. Fallback / Synchronize locally
  const rawUsers = localStorage.getItem("tourister_users");
  const users = rawUsers ? JSON.parse(rawUsers) : [];

  if (!createdUser) {
    if (
      users.some(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() ||
          (u.email && u.email.toLowerCase() === email.toLowerCase())
      )
    ) {
      return { success: false, error: "Username or email already exists" };
    }

    createdUser = {
      username,
      email,
      password,
      userPoints: 300,
      walletBalance: 2500,
      createdAt: new Date().toISOString(),
    };
  }

  saveUserToLocalStorage(createdUser);

  // C. Cross-Device Cloud Sync
  syncUserToCloud(createdUser);

  return { success: true, user: createdUser, source: "UnifiedDB" };
}

// Helper: Save user to local storage safely
function saveUserToLocalStorage(user) {
  try {
    const rawUsers = localStorage.getItem("tourister_users");
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const idx = users.findIndex(
      (u) => u.username.toLowerCase() === user.username.toLowerCase()
    );
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem("tourister_users", JSON.stringify(users));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// 3. Update User (Points / Wallet / Password)
export async function updateUserData(username, updates) {
  const apiBase = getApiBase();

  try {
    const res = await fetch(`${apiBase}/auth/user/${encodeURIComponent(username)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        saveUserToLocalStorage(data.user);
        syncUserToCloud(data.user);
        return { success: true, user: data.user, source: "TouristerServer" };
      }
    }
  } catch (err) {
    // Local fallback
  }

  const rawUsers = localStorage.getItem("tourister_users");
  const users = rawUsers ? JSON.parse(rawUsers) : [];

  const idx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
  if (idx !== -1) {
    if (updates.userPoints !== undefined) users[idx].userPoints = updates.userPoints;
    if (updates.walletBalance !== undefined) users[idx].walletBalance = updates.walletBalance;
    if (updates.newPassword) users[idx].password = updates.newPassword;
    localStorage.setItem("tourister_users", JSON.stringify(users));
    syncUserToCloud(users[idx]);
    return { success: true, user: users[idx], source: "LocalDB" };
  }

  return { success: false, error: "User not found" };
}

// 4. Save Trip Plan
export async function saveTripPlan(planData) {
  const apiBase = getApiBase();

  try {
    const res = await fetch(`${apiBase}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planData),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, plan: data.plan, source: "TouristerServer" };
    }
  } catch (err) {
    // Local fallback
  }

  const rawPlans = localStorage.getItem("tourister_saved_plans");
  const plans = rawPlans ? JSON.parse(rawPlans) : [];
  plans.unshift(planData);
  localStorage.setItem("tourister_saved_plans", JSON.stringify(plans));

  return { success: true, plan: planData, source: "LocalDB" };
}

// 5. Community Posts: Fetch from Server & Cloud Storage
export async function fetchCommunityPosts() {
  const apiBase = getApiBase();
  const postMap = new Map();

  // A. First load from Local Storage Cache (instant display)
  try {
    const localRaw = localStorage.getItem("tourister_community_posts");
    if (localRaw) {
      const localPosts = JSON.parse(localRaw);
      if (Array.isArray(localPosts)) {
        localPosts.forEach((p) => p && p.id && postMap.set(p.id, p));
      }
    }
  } catch (e) {}

  // B. Fetch from Real Global Cloud Storage (Primary for cross-user & GitHub Pages)
  const binUrls = [CLOUD_COMMUNITY_BIN, CLOUD_COMMUNITY_BIN_BACKUP];
  for (const binUrl of binUrls) {
    try {
      const res = await fetch(`${binUrl}?_t=${Date.now()}`, {
        signal: AbortSignal.timeout(4500),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          data.posts.forEach((p) => p && p.id && postMap.set(p.id, p));
          break; // Primary succeeded
        }
      }
    } catch (err) {
      console.warn("Cloud bin fetch notice:", err.message);
    }
  }

  // C. Try Local / Network Server via Vite or Express (if running locally)
  try {
    const res = await fetch(`${apiBase}/posts?_t=${Date.now()}`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        data.posts.forEach((p) => p && p.id && postMap.set(p.id, p));
      }
    }
  } catch (e) {
    // Local server offline or on static hosting
  }

  const getPostTime = (p) => {
    if (p.createdAt) {
      const t = new Date(p.createdAt).getTime();
      if (!isNaN(t)) return t;
    }
    if (p.created_at) {
      const t = new Date(p.created_at).getTime();
      if (!isNaN(t)) return t;
    }
    const match = String(p.id).match(/\d{10,}/);
    if (match) return parseInt(match[0], 10);
    return 0;
  };

  const merged = Array.from(postMap.values()).sort(
    (a, b) => getPostTime(b) - getPostTime(a)
  );

  try {
    localStorage.setItem("tourister_community_posts", JSON.stringify(merged));
  } catch (e) {}

  return merged;
}

// 6. Community Posts: Create & Sync across all devices and accounts globally
export async function createCommunityPost(postData) {
  const apiBase = getApiBase();
  const savedPost = {
    ...postData,
    id: postData.id || `user-post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: postData.createdAt || new Date().toISOString(),
  };

  // A. Save to Local Storage Cache immediately
  try {
    const localRaw = localStorage.getItem("tourister_community_posts");
    const localPosts = localRaw ? JSON.parse(localRaw) : [];
    const updatedLocal = [savedPost, ...localPosts.filter((p) => p.id !== savedPost.id)];
    localStorage.setItem("tourister_community_posts", JSON.stringify(updatedLocal));
  } catch (e) {}

  // B. Save to Real Global Cloud Storage (Primary for GitHub Pages and cross-account access)
  const binUrls = [CLOUD_COMMUNITY_BIN, CLOUD_COMMUNITY_BIN_BACKUP];
  for (const binUrl of binUrls) {
    try {
      let existingPosts = [];
      try {
        const getRes = await fetch(`${binUrl}?_t=${Date.now()}`, {
          signal: AbortSignal.timeout(3500),
        });
        if (getRes.ok) {
          const json = await getRes.json();
          if (Array.isArray(json.posts)) {
            existingPosts = json.posts;
          }
        }
      } catch (e) {}

      const updatedPosts = [savedPost, ...existingPosts.filter((p) => p.id !== savedPost.id)];
      await fetch(binUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: updatedPosts, lastUpdated: new Date().toISOString() }),
        signal: AbortSignal.timeout(4000),
      });
    } catch (err) {
      console.warn("Global cloud save notice:", err.message);
    }
  }

  // C. Save to Local / Network Server via Vite or Express (if running locally)
  try {
    await fetch(`${apiBase}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savedPost),
      signal: AbortSignal.timeout(2000),
    });
  } catch (serverErr) {
    // Server offline or static host
  }

  return { success: true, post: savedPost };
}

