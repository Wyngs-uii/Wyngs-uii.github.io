import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const port = Number.parseInt(process.env.PORT ?? "4173", 10);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
};

function safePathname(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  const normalized = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  return normalized.startsWith(path.sep) ? normalized.slice(1) : normalized;
}

async function resolveRequestPath(requestUrl) {
  const pathname = safePathname(requestUrl);
  const requestedPath = path.join(rootDirectory, pathname);

  try {
    const requestedStat = await stat(requestedPath);
    if (requestedStat.isDirectory()) {
      const directoryIndex = path.join(requestedPath, "index.html");
      await access(directoryIndex);
      return directoryIndex;
    }
    return requestedPath;
  } catch {
    return path.join(rootDirectory, "index.html");
  }
}

const server = createServer(async (request, response) => {
  try {
    const filePath = await resolveRequestPath(request.url ?? "/");
    const contentType = contentTypes[path.extname(filePath)] ?? "application/octet-stream";
    response.writeHead(200, {
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
      "Content-Type": contentType,
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("OnionFlow static server failed to read the requested file.");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`OnionFlow static site: http://127.0.0.1:${port}`);
});
