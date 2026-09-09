import {
  handleAuthSignup,
  handleAuthLogin,
  handleUpdateUser,
  handleSavePlan,
  handleGetPlans,
  handleGetPosts,
  handleCreatePost,
  handleToggleLike,
  handleAddComment,
  handleDeletePost,
  readDb,
  writeDb,
} from "./dbHelper.js";

function parseJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }
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
    req.on("error", () => resolve({}));
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
        const rawUrl = req.url || "";
        const cleanUrl = rawUrl.split("?")[0].replace(/\/+$/, "") || "/";

        // Handle CORS preflight
        if (req.method === "OPTIONS" && cleanUrl.startsWith("/api")) {
          res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          });
          return res.end();
        }

        // 1. Health check
        if (cleanUrl === "/api/health") {
          return sendJson(res, 200, {
            status: "ok",
            service: "Tourister Cross-Device Unified API Engine",
            timestamp: new Date().toISOString(),
          });
        }

        // 2. Auth: Signup
        if (cleanUrl === "/api/auth/signup" && req.method === "POST") {
          const body = await parseJsonBody(req);
          const result = handleAuthSignup(body);
          return sendJson(res, result.status, result.data);
        }

        // 3. Auth: Login
        if (cleanUrl === "/api/auth/login" && req.method === "POST") {
          const body = await parseJsonBody(req);
          const result = handleAuthLogin(body);
          return sendJson(res, result.status, result.data);
        }

        // 4. User: Update
        if (cleanUrl.startsWith("/api/auth/user/") && req.method === "PUT") {
          const username = decodeURIComponent(cleanUrl.replace("/api/auth/user/", ""));
          const body = await parseJsonBody(req);
          const result = handleUpdateUser(username, body);
          return sendJson(res, result.status, result.data);
        }

        // 5. Trip Plans: Save
        if (cleanUrl === "/api/plans" && req.method === "POST") {
          const body = await parseJsonBody(req);
          const result = handleSavePlan(body);
          return sendJson(res, result.status, result.data);
        }

        // 6. Trip Plans: Get
        if (cleanUrl.startsWith("/api/plans/") && req.method === "GET") {
          const username = decodeURIComponent(cleanUrl.replace("/api/plans/", ""));
          const result = handleGetPlans(username);
          return sendJson(res, result.status, result.data);
        }

        // 7. Community: Fetch Posts (/api/community/posts & /api/posts)
        if ((cleanUrl === "/api/community/posts" || cleanUrl === "/api/posts") && req.method === "GET") {
          const result = handleGetPosts();
          return sendJson(res, result.status, result.data);
        }

        // 8. Community: Create Post
        if ((cleanUrl === "/api/community/posts" || cleanUrl === "/api/posts") && req.method === "POST") {
          const body = await parseJsonBody(req);
          const result = handleCreatePost(body);
          return sendJson(res, result.status, result.data);
        }

        // 9. Community: Like / Upvote Post (e.g. /api/community/posts/:id/like or /api/posts/:id/like)
        if (
          (cleanUrl.startsWith("/api/community/posts/") || cleanUrl.startsWith("/api/posts/")) &&
          cleanUrl.endsWith("/like") &&
          (req.method === "POST" || req.method === "PUT")
        ) {
          const parts = cleanUrl.split("/");
          // format: ["", "api", "community", "posts", ":id", "like"] or ["", "api", "posts", ":id", "like"]
          const postId = parts[parts.length - 2];
          const body = await parseJsonBody(req);
          const result = handleToggleLike(postId, body?.username);
          return sendJson(res, result.status, result.data);
        }

        // 10. Community: Add Comment (e.g. /api/community/posts/:id/comment)
        if (
          (cleanUrl.startsWith("/api/community/posts/") || cleanUrl.startsWith("/api/posts/")) &&
          cleanUrl.endsWith("/comment") &&
          req.method === "POST"
        ) {
          const parts = cleanUrl.split("/");
          const postId = parts[parts.length - 2];
          const body = await parseJsonBody(req);
          const result = handleAddComment(postId, body);
          return sendJson(res, result.status, result.data);
        }

        // 11. Community: Delete Post
        if (
          (cleanUrl.startsWith("/api/community/posts/") || cleanUrl.startsWith("/api/posts/")) &&
          !cleanUrl.endsWith("/like") &&
          !cleanUrl.endsWith("/comment") &&
          req.method === "DELETE"
        ) {
          const parts = cleanUrl.split("/");
          const postId = parts[parts.length - 1];
          const body = await parseJsonBody(req);
          const result = handleDeletePost(postId, body?.username);
          return sendJson(res, result.status, result.data);
        }

        next();
      });
    },
  };
}
