#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');

const siteSlug = process.argv[2];
const port = Number(process.argv[3] || process.env.PORT || 5173);
const host = process.argv[4] || process.env.HOST || '127.0.0.1';
const validSites = new Set(['pedalscape', 'beltscape']);

if (!siteSlug || !validSites.has(siteSlug) || !Number.isInteger(port) || port <= 0) {
  console.error('Usage: node scripts/serve-dist.js <pedalscape|beltscape> [port] [host]');
  process.exit(1);
}

const root = path.resolve('dist', siteSlug);

if (!fs.existsSync(root)) {
  console.error(`Build output not found: ${root}`);
  console.error(`Run: node scripts/build.js ${siteSlug}`);
  process.exit(1);
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function send(response, status, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store'
  });
  response.end(body);
}

const server = http.createServer((request, response) => {
  let decodedPath;
  try {
    const requestUrl = new URL(request.url, `http://${host}:${port}`);
    decodedPath = decodeURIComponent(requestUrl.pathname);
  } catch {
    send(response, 400, 'Bad request');
    return;
  }

  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);

  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    send(response, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      send(response, 404, 'Not found');
      return;
    }

    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}`);
});
