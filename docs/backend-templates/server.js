// ============================================================================
// NEXT.JS CUSTOM SERVER WITH SOCKET.IO
// ============================================================================
// File: backend/server.js
// ============================================================================
// Custom server configuration untuk Next.js dengan Socket.io integration.
// File ini menginisialisasi HTTP server dan Socket.io sebelum Next.js app.
// ============================================================================

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocket } = require('./src/lib/socket');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  initSocket(server);

  // Start server
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.IO enabled on /api/socketio`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
});
