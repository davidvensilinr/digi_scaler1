import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer) => {
  if (io) {
    console.log('Socket.IO already initialized');
    return io;
  }

  console.log('Initializing Socket.IO server...');
  
  io = new SocketIOServer(server, {
    path: '/api/socket/io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a room based on user ID
    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Handle private messages
    socket.on('private message', (data: { to: string; message: any }) => {
      const { to, message } = data;
      console.log('Private message:', { to, message });
      
      if (to) {
        socket.to(to).emit('private message', message);
      } else {
        console.error('No recipient specified for private message');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
