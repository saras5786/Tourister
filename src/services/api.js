// Tourister Unified Database Service (Vite Dev Engine, Hybrid Backend & Cross-Device Cloud Sync)

const CLOUD_SYNC_URL = "https://api.restful-api.dev/objects";
const CLOUD_NAMESPACE = "tourister_cloud_vault_v1";

function getApiBase() {
  if (typeof window !== "undefined") {
    // Relative '/api' automatically routes to the host serving the app
    // Works identically on laptop (localhost:5173) and phone (192.168.x.x:5173)
    return "/api";
  }
  return "http://localhost:5000/api";
}

// Helper: Cloud Registry Sync
async function syncUserToCloud(user) {
  try {
    const payload = {
      name: `${CLOUD_NAMESPACE}_${user.username.toLowerCase()}`,
      data: {
        username: user.username,
        email: user.email,
        password: user.password || user.password_hash,
        userPoints: user.userPoints || user.user_points || 300,
        walletBalance: user.walletBalance || user.wallet_balance || 2500,
        updatedAt: new Date().toISOString(),
      },
    };

    await fetch(CLOUD_SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    // Cloud sync notice (silent fallback)
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

  // C. Fallback to Global Cloud Object Registry (Multi-Device Bridge)
  try {
    // Check if user was registered on another device via cloud registry
    const cloudName = `${CLOUD_NAMESPACE}_${username.toLowerCase()}`;
    // Query recently synced objects or check cloud
    const cloudRes = await fetch(`${CLOUD_SYNC_URL}`, {
      signal: AbortSignal.timeout(3500),
    });
    if (cloudRes.ok) {
      const objects = await cloudRes.json();
      if (Array.isArray(objects)) {
        const foundCloud = objects.find(
          (item) =>
            item.name === cloudName &&
            (item.data?.password === password || item.data?.password_hash === password)
        );
        if (foundCloud && foundCloud.data) {
          const userObj = {
            username: foundCloud.data.username,
            email: foundCloud.data.email,
            password: foundCloud.data.password,
            userPoints: foundCloud.data.userPoints || 300,
            walletBalance: foundCloud.data.walletBalance || 2500,
          };
          saveUserToLocalStorage(userObj);
          return { success: true, user: userObj, source: "CloudSync" };
        }
      }
    }
  } catch (e) {
    // Cloud check timeout
  }

  // Built-in demo accounts fallback
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
    return { success: true, user: demoUser, source: "DemoAccount" };
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

// 5. Community Posts: Fetch from Server & Cloud Sync
export async function fetchCommunityPosts() {
  const apiBase = getApiBase();
  let serverPosts = [];

  // A. Try Local / Network Server via Vite or Express
  try {
    const res = await fetch(`${apiBase}/posts`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        serverPosts = data.posts;
      }
    }
  } catch (e) {
    // Server fetch notice
  }

  // B. Cross-Device Cloud Sync Registry (so posts appear across different networks/devices too)
  let cloudPosts = [];
  try {
    const cloudRes = await fetch(CLOUD_SYNC_URL, {
      signal: AbortSignal.timeout(3000),
    });
    if (cloudRes.ok) {
      const objects = await cloudRes.json();
      if (Array.isArray(objects)) {
        cloudPosts = objects
          .filter((item) => item.name && item.name.startsWith(`${CLOUD_NAMESPACE}_post_`))
          .map((item) => item.data)
          .filter(Boolean);
      }
    }
  } catch (e) {
    // Cloud fetch notice
  }

  // C. Merge server, cloud, and local posts (Server & Cloud take authoritative precedence)
  const localRaw = localStorage.getItem("tourister_community_posts");
  const localPosts = localRaw ? JSON.parse(localRaw) : [];

  const postMap = new Map();
  // 1. Local cached posts first
  localPosts.forEach((p) => p && p.id && postMap.set(p.id, p));
  // 2. Cloud posts override local cache
  cloudPosts.forEach((p) => p && p.id && postMap.set(p.id, p));
  // 3. Server posts take authoritative precedence
  serverPosts.forEach((p) => p && p.id && postMap.set(p.id, p));

  const getPostTime = (p) => {
    if (p.createdAt) return new Date(p.createdAt).getTime();
    if (p.created_at) return new Date(p.created_at).getTime();
    const match = String(p.id).match(/\d{10,}/);
    if (match) return parseInt(match[0], 10);
    return 0;
  };

  const merged = Array.from(postMap.values()).sort(
    (a, b) => getPostTime(b) - getPostTime(a)
  );

  localStorage.setItem("tourister_community_posts", JSON.stringify(merged));
  return merged;
}

// 6. Community Posts: Create & Sync for all users
export async function createCommunityPost(postData) {
  const apiBase = getApiBase();
  let savedPost = { ...postData };

  // A. Save to Server Database via Vite / Express
  try {
    const res = await fetch(`${apiBase}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.post) {
        savedPost = data.post;
      }
    }
  } catch (e) {
    console.info("Server post save offline, syncing to cloud and local:", e.message);
  }

  // B. Sync to Cloud Object Registry so other users on other devices see it
  try {
    await fetch(CLOUD_SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${CLOUD_NAMESPACE}_post_${savedPost.id}`,
        data: savedPost,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (e) {
    // Cloud sync notice
  }

  // C. Update Local Storage Cache
  const localRaw = localStorage.getItem("tourister_community_posts");
  const localPosts = localRaw ? JSON.parse(localRaw) : [];
  const updated = [savedPost, ...localPosts.filter((p) => p.id !== savedPost.id)];
  localStorage.setItem("tourister_community_posts", JSON.stringify(updated));

  return { success: true, post: savedPost };
}

