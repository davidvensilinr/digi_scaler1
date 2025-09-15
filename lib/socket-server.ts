import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

class SocketServer {
  private static instance: SocketServer;
  public io: SocketIOServer | null = null;
  private isInitialized = false;

  constructor() {}

  public initialize(server: HttpServer): void {
    if (this.isInitialized) return;

    this.io = new SocketIOServer(server, {
      path: '/api/socket/io',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket: Socket) => {
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

    this.isInitialized = true;
    console.log('WebSocket server initialized');
  }

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer();
    }
    return SocketServer.instance;
  }
}

export const socketServer = SocketServer.getInstance();
