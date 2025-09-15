import { NextApiRequest, NextApiResponse } from 'next';
import { SocketServer } from '@/lib/socket';
import { NextResponse } from 'next/server';
import { Server as HttpServer } from 'http';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // This is a workaround for Next.js 13+ app directory
    // The actual WebSocket upgrade happens before this handler is called
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('WebSocket error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'WebSocket server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
