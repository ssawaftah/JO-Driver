// Minimal static file server for the pages/ directory.
// Injects GOOGLE_MAPS_API_KEY into the HTML files that need Google Maps,
// so the key lives in an environment variable instead of being hardcoded.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const PAGES_DIR = path.join(__dirname, 'pages');
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Files that reference the {{GOOGLE_MAPS_API_KEY}} placeholder.
const TEMPLATED_FILES = new Set(['center-join.html', 'admin.html']);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/driving-schools.html';

  // Prevent path traversal outside of pages/.
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PAGES_DIR, safePath);
  if (!filePath.startsWith(PAGES_DIR)) return send404(res);

  fs.stat(filePath, (err, stats) => {
    let resolvedPath = filePath;
    if (err || !stats.isFile()) {
      // Support clean URLs without the .html extension (e.g. /center-join),
      // matching the previous static server's behavior.
      const htmlPath = filePath + '.html';
      const htmlStats = fs.existsSync(htmlPath) && fs.statSync(htmlPath);
      if (htmlStats && htmlStats.isFile()) {
        resolvedPath = htmlPath;
      } else {
        return send404(res);
      }
    }

    const filePathFinal = resolvedPath;
    const ext = path.extname(filePathFinal).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileName = path.basename(filePathFinal);

    if (TEMPLATED_FILES.has(fileName) && ext === '.html') {
      fs.readFile(filePathFinal, 'utf8', (readErr, content) => {
        if (readErr) return send404(res);
        const rendered = content.split('{{GOOGLE_MAPS_API_KEY}}').join(GOOGLE_MAPS_API_KEY);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(rendered);
      });
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePathFinal).pipe(res);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`driverjo static server listening on port ${PORT}`);
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Warning: GOOGLE_MAPS_API_KEY is not set — Google Maps features will not load.');
  }
});
