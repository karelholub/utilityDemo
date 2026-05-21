import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function resolveRequestPath(url) {
  const { pathname } = new URL(url, "http://localhost");
  const requestedPath = pathname === "/" ? "/sse.html" : decodeURIComponent(pathname);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(join(rootDir, safePath));
  return filePath.startsWith(rootDir) ? filePath : null;
}

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Content-Type": contentType,
    "Pragma": "no-cache"
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  if (!req.url || !["GET", "HEAD"].includes(req.method || "")) {
    send(res, 405, "Method not allowed");
    return;
  }

  const filePath = resolveRequestPath(req.url);
  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      send(res, 404, "Not found");
      return;
    }

    res.writeHead(200, {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Length": fileStat.size,
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Pragma": "no-cache"
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    createReadStream(filePath).pipe(res);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      send(res, 404, "Not found");
      return;
    }
    console.error(err);
    send(res, 500, "Internal server error");
  }
});

server.listen(port, host, () => {
  console.log(`Serving on http://${host}:${port} (no-cache)`);
});
