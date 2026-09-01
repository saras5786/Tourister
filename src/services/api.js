// Tourister Unified Database Service (PostgreSQL with resilient Local Fallback)

const API_BASE = "http://localhost:5000/api";

const DEFAULT_USER = {
  username: "saraschandra",
  email: "saraschandra5786@gmail.com",
  password: "password123",
  userPoints: 300,
  walletBalance: 2500,
};

// 1. User Login
export async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, user: data.user, source: "PostgreSQL" };
    }
  } catch (err) {
    console.info("PostgreSQL server offline, using local database:", err.message);
  }

  // Local persistent storage fallback
  const rawUsers = localStorage.getItem("tourister_users");
  const users = rawUsers ? JSON.parse(rawUsers) : [DEFAULT_USER];

  const matched = users.find(
    (u) =>
      (u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === username.toLowerCase()) &&
      u.password === password
  );

  if (matched) {
    return { success: true, user: matched, source: "LocalDB" };
  }

  return { success: false, error: "Invalid username or password" };
}

// 2. User Signup
export async function signupUser(username, email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, user: data.user, source: "PostgreSQL" };
    }
  } catch (err) {
    console.info("PostgreSQL server offline, using local database:", err.message);
  }

  // Local persistent storage fallback
  const rawUsers = localStorage.getItem("tourister_users");
  const users = rawUsers ? JSON.parse(rawUsers) : [DEFAULT_USER];

  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: "Username already exists" };
  }

  const newUser = {
    username,
    email,
    password,
    userPoints: 300,
    walletBalance: 2500,
  };

  users.push(newUser);
  localStorage.setItem("tourister_users", JSON.stringify(users));

  return { success: true, user: newUser, source: "LocalDB" };
}

// 3. Update User (Points / Wallet / Password)
export async function updateUserData(username, updates) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/${username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, user: data.user, source: "PostgreSQL" };
    }
  } catch (err) {
    // Local fallback
  }

  const rawUsers = localStorage.getItem("tourister_users");
  const users = rawUsers ? JSON.parse(rawUsers) : [DEFAULT_USER];

  const idx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
  if (idx !== -1) {
    if (updates.userPoints !== undefined) users[idx].userPoints = updates.userPoints;
    if (updates.walletBalance !== undefined) users[idx].walletBalance = updates.walletBalance;
    if (updates.newPassword) users[idx].password = updates.newPassword;
    localStorage.setItem("tourister_users", JSON.stringify(users));
    return { success: true, user: users[idx], source: "LocalDB" };
  }

  return { success: false, error: "User not found" };
}

// 4. Save Trip Plan
export async function saveTripPlan(planData) {
  try {
    const res = await fetch(`${API_BASE}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planData),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, plan: data.plan, source: "PostgreSQL" };
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
