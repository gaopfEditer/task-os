import http from "node:http";
import https from "node:https";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const here = join(fileURLToPath(import.meta.url), "..");
const dist = join(here, "../dist");
const PORT = 1420;
const PROXY_PORTS = [7890, 7891, 7892, 7893];

const ALLOW_HOSTS = new Set([
  "api.gateio.ws",
  "fapi.binance.com",
  "api.binance.com",
  "data-api.binance.vision",
  "api.coingecko.com",
  "push2.eastmoney.com",
]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function isAllowedMarketUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && ALLOW_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

function curlGet(url, proxyPort) {
  const args = ["-sS", "--max-time", "15", "-w", "\n%{http_code}", url];
  if (proxyPort != null) {
    args.unshift("-x", `http://127.0.0.1:${proxyPort}`);
  }
  return execFileAsync("curl.exe", args, { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 }).then(
    ({ stdout }) => {
      const idx = stdout.lastIndexOf("\n");
      const body = idx >= 0 ? stdout.slice(0, idx) : stdout;
      const status = idx >= 0 ? Number(stdout.slice(idx + 1)) : 0;
      if (!status) throw new Error("bad curl status");
      return { status, body };
    },
  );
}

async function marketFetch(rawUrl) {
  const attempts = [null, ...PROXY_PORTS];
  let last = new Error("market fetch failed");
  for (const port of attempts) {
    try {
      const res = await curlGet(rawUrl, port);
      if (res.status >= 200 && res.status < 300) return res;
      if (port == null && (res.status === 451 || res.status === 403)) {
        last = new Error(`HTTP ${res.status}`);
        continue;
      }
      if (port == null && res.status >= 500) {
        last = new Error(`HTTP ${res.status}`);
        continue;
      }
      return res;
    } catch (err) {
      last = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw last;
}

function safePath(urlPath) {
  const p = decodeURIComponent(urlPath.split("?")[0] || "/");
  if (p.includes("..")) return null;
  const rel = p === "/" ? "index.html" : p.replace(/^\//, "");
  return join(dist, rel);
}

/** Tauri dev 常请求 /price-bubble（无后缀），旧 serve 会自动落到 .html */
function resolveStaticFile(pathname) {
  let filePath = safePath(pathname);
  if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath;
  }
  const bare = (pathname.split("?")[0] || "/").replace(/^\//, "");
  if (bare && !extname(bare)) {
    const htmlPath = safePath(`/${bare}.html`);
    if (htmlPath && existsSync(htmlPath) && statSync(htmlPath).isFile()) {
      return htmlPath;
    }
  }
  return null;
}

function sendFile(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
  });
  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

    if (reqUrl.pathname === "/__market") {
      const target = reqUrl.searchParams.get("url") || "";
      if (!isAllowedMarketUrl(target)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid market url" }));
        return;
      }
      const out = await marketFetch(target);
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify({ status: out.status, body: out.body }));
      return;
    }

    const filePath = resolveStaticFile(reqUrl.pathname);
    if (!filePath) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    sendFile(res, filePath);
  } catch (err) {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(err instanceof Error ? err.message : String(err));
  }
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is in use. Close the other dev server (node/serve) or run:`,
    );
    console.error(
      `  Get-NetTCPConnection -LocalPort ${PORT} | %% ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`,
    );
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Market-aware static server at http://127.0.0.1:${PORT}`);
});