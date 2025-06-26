import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

const app = express(); // ✅ maintenant d'abord `app`
const server = createServer(app); // puis `server` qui dépend de `app`

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// (Middleware de log inchangé)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Lancement de Vite + routes
registerRoutes(app).then(() => {
  setupVite(app, server);

  server.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
  });
});
