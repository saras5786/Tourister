import {
  handleAuthSignup,
  handleAuthLogin,
  handleUpdateUser,
  handleSavePlan,
  handleGetPlans,
  readDb,
  writeDb,
} from "./dbHelper.js";

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

export function viteApiPlugin() {
  return {
    name: "vite-tourister-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";

        // Handle CORS preflight
        if (req.method === "OPTIONS" && url.startsWith("/api/")) {
          res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          });
          return res.end();
        }

        // 1. Health check
        if (url === "/api/health") {
          return sendJson(res, 200, {
            status: "ok",
            service: "Tourister Cross-Device Unified API Engine",
            timestamp: new Date().toISOString(),
          });
        }

        // 2. Auth: Signup
        if (url === "/api/auth/signup" && req.method === "POST") {
          const body = await parseJsonBody(req);
          const result = handleAuthSignup(body);
          return sendJson(res, result.status, result.data);
        }

        // 3. Auth: Login
        if (url === "/api/auth/login" && req.method === "POST") {
          const body = await parseJsonBody(req);
          const result = handleAuthLogin(body);
          return sendJson(res, result.status, result.data);
        }

        // 4. User: Update
        if (url.startsWith("/api/auth/user/") && req.method === "PUT") {
          const username = decodeURIComponent(url.replace("/api/auth/user/", "").split("?")[0]);
          const body = await parseJsonBody(req);
          const result = handleUpdateUser(username, body);
          return sendJson(res, result.status, result.data);
        }

        // 5. Trip Plans: Save
        if (url === "/api/plans" && req.method === "POST") {
          const body = await parseJsonBody(req);
          const result = handleSavePlan(body);
          return sendJson(res, result.status, result.data);
        }

        // 6. Trip Plans: Get
        if (url.startsWith("/api/plans/") && req.method === "GET") {
          const username = decodeURIComponent(url.replace("/api/plans/", "").split("?")[0]);
          const result = handleGetPlans(username);
          return sendJson(res, result.status, result.data);
        }

        // 7. Community: Fetch
        if (url === "/api/posts" && req.method === "GET") {
          const db = readDb();
          return sendJson(res, 200, { success: true, posts: db.community_posts || [] });
        }

        // 8. Community: Create
        if (url === "/api/posts" && req.method === "POST") {
          const body = await parseJsonBody(req);
          const db = readDb();
          const newPost = {
            id: body.id || `post-${Date.now()}`,
            ...body,
            created_at: body.createdAt || new Date().toISOString(),
          };
          if (!db.community_posts) db.community_posts = [];
          db.community_posts = db.community_posts.filter((p) => p.id !== newPost.id);
          db.community_posts.unshift(newPost);
          writeDb(db);
          return sendJson(res, 201, { success: true, post: newPost });
        }


        next();
      });
    },
  };
}
