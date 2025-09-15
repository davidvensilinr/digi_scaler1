const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '10000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url || '', true);
      
      // Handle API routes
      if (parsedUrl.pathname && parsedUrl.pathname.startsWith('/api/')) {
        // Handle API routes through Next.js
        return handle(req, res, parsedUrl);
      }
      
      // Handle other routes
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    path: '/api/socket/io',
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://your-render-app.onrender.com',  // Update with your Render URL
            'https://www.yourdomain.com',           // Your custom domain if you have one
          ]
        : '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: {
      name: 'io',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400 // 24 hours
    }
  });

  // Log when a client connects
  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err);
  });

  // Log when transport is upgraded
  io.engine.on('upgrade', (req, socket, head) => {
    console.log('Upgrading connection to WebSocket');
  });

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle joining a room
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Handle private messages
    socket.on('private message', (data) => {
      const { to, message } = data;
      console.log('Private message from', socket.id, 'to', to, ':', message);
      
      if (to) {
        // Send to specific room (user ID)
        socket.to(to).emit('private message', message);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  // Start server
  server.listen(port, hostname, () => {
    console.log(`> Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket path: /api/socket/io`);
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log('Shutting down server...');
    io.close();
    server.close(() => {
      console.log('Server has been shut down');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});
