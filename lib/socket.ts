import { Server as NetServer } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: any & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export class SocketServer {
  private static instance: SocketServer;
  public io: SocketIOServer;

  private constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      path: '/api/socket/io',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      addTrailingSlash: false,
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket) => {
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
        
        // Broadcast to the specific user's room
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
  }

  public static getInstance(server?: HttpServer): SocketServer {
    if (!SocketServer.instance) {
      if (!server) {
        throw new Error('Socket server not initialized: missing HTTP server');
      }
      SocketServer.instance = new SocketServer(server);
    }
    return SocketServer.instance;
  }
}

export default SocketServer;
