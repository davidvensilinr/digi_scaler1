import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/profile';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test MongoDB connection
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Test if we can query the database
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      userCount,
      mongoStatus: {
        readyState: mongoose.connection.readyState,
        dbName: mongoose.connection.db?.databaseName,
        host: mongoose.connection.host,
      }
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
