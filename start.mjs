#!/usr/bin/env node
// Node production entry for the TanStack Start app.
//
// The Vite build (via @lovable.dev/vite-tanstack-config) targets Cloudflare
// Workers and emits a Worker-format module at dist/server/index.mjs. This
// file wraps that module in a Node http server so the same build can also
// run on Render / MochaHost / any Node 20+ host.
//
// Usage:
//   bun run build   # produces dist/client + dist/server
//   node start.mjs  # binds to process.env.PORT (default 3000)
import { createServer } from "node:http";
import { createReadStream, statSync, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLIENT_DIR = resolve(__dirname, "dist/client");
const SERVER_ENTRY = resolve(__dirname, "dist/server/index.mjs");

if (!existsSync(SERVER_ENTRY) || !existsSync(CLIENT_DIR)) {
  console.error(
    "[start] dist/ not found. Run `bun run build` (or `npm run build`) first.",
  );
  process.exit(1);
}

const MIME = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function safeJoin(base, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const joined = normalize(join(base, decoded));
  if (!joined.startsWith(base)) return null;
  return joined;
}

function tryStaticFile(urlPath) {
  if (urlPath === "/" || urlPath === "") return null;
  const p = safeJoin(CLIENT_DIR, urlPath);
  if (!p) return null;
  try {
    const s = statSync(p);
    if (s.isFile()) return { path: p, size: s.size };
  } catch {}
  return null;
}

function serveStatic(file, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", MIME[extname(file.path).toLowerCase()] ?? "application/octet-stream");
  res.setHeader("Content-Length", file.size);
  // Long cache for hashed assets, short cache for everything else.
  if (/\/assets\//.test(file.path)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else {
    res.setHeader("Cache-Control", "public, max-age=300");
  }
  createReadStream(file.path).pipe(res);
}

// Minimal env.ASSETS binding so the Worker module's asset short-circuit works.
const env = {
  ...process.env,
  ASSETS: {
    async fetch(request) {
      const url = new URL(request.url);
      const file = tryStaticFile(url.pathname);
      if (!file) return new Response("Not found", { status: 404 });
      const body = createReadStream(file.path);
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": MIME[extname(file.path).toLowerCase()] ?? "application/octet-stream",
        },
      });
    },
  },
};
const ctx = { waitUntil() {}, passThroughOnException() {} };

const mod = await import(pathToFileURL(SERVER_ENTRY).href);
const handler = mod.default;
if (!handler || typeof handler.fetch !== "function") {
  console.error("[start] dist/server/index.mjs does not export a fetch handler.");
  process.exit(1);
}

function nodeReqToWebReq(req, base) {
  const url = new URL(req.url, base);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else if (v != null) headers.set(k, String(v));
  }
  const method = req.method || "GET";
  const init = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = req;
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function webResToNodeRes(webRes, res) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => res.setHeader(key, value));
  if (!webRes.body) return res.end();
  const reader = webRes.body.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";
const base = `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;

const server = createServer(async (req, res) => {
  try {
    // Fast path: static client assets.
    const file = tryStaticFile(req.url || "/");
    if (file) return serveStatic(file, res);

    const webReq = nodeReqToWebReq(req, base);
    const webRes = await handler.fetch(webReq, env, ctx);
    await webResToNodeRes(webRes, res);
  } catch (err) {
    console.error("[start] request failed:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
    }
    res.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`[start] TAKATAK listening on ${base}`);
});

function shutdown(sig) {
  console.log(`[start] ${sig} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));