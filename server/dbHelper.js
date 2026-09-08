import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "tourister_db.json");

const DEFAULT_DB = {
  users: [
    {
      id: "usr-default-saras",
      username: "saraschandra",
      email: "saraschandra5786@gmail.com",
      password_hash: "password123",
      user_points: 300,
      wallet_balance: 2500.0,
      created_at: new Date().toISOString(),
    },
    {
      id: "usr-default-explorer",
      username: "tourister_explorer",
      email: "explorer@tourister.com",
      password_hash: "explore123",
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
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading tourister_db.json:", err.message);
    return DEFAULT_DB;
  }
}

export function writeDb(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing tourister_db.json:", err.message);
  }
}

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
      u.username.toLowerCase() === lowerUser ||
      u.email.toLowerCase() === lowerEmail
  );

  if (exists) {
    return { status: 409, data: { error: "Username or email already exists" } };
  }

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: username.trim(),
    email: lowerEmail,
    password_hash: password,
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
      (u.username.toLowerCase() === lowerInput ||
        u.email.toLowerCase() === lowerInput) &&
      u.password_hash === password
  );

  if (!user) {
    return { status: 401, data: { error: "Invalid username or password" } };
  }

  const safeUser = { ...user };
  delete safeUser.password_hash;
  return { status: 200, data: { success: true, user: safeUser } };
}

export function handleUpdateUser(usernameParam, updates) {
  const db = readDb();
  const lowerUser = usernameParam.trim().toLowerCase();
  const idx = db.users.findIndex(
    (u) => u.username.toLowerCase() === lowerUser
  );

  if (idx === -1) {
    return { status: 404, data: { error: "User not found" } };
  }

  if (updates.userPoints !== undefined)
    db.users[idx].user_points = updates.userPoints;
  if (updates.walletBalance !== undefined)
    db.users[idx].wallet_balance = updates.walletBalance;
  if (updates.newPassword) db.users[idx].password_hash = updates.newPassword;

  writeDb(db);

  const safeUser = { ...db.users[idx] };
  delete safeUser.password_hash;
  return { status: 200, data: { success: true, user: safeUser } };
}

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
