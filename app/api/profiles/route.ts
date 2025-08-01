import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Profile from '@/lib/models/profile';
import connectDb from '@/lib/mongodb';

// GET: Fetch all profiles
export async function GET() {
    console.log('🔍 GET /api/profiles called');
    
    try {
        // Connect to MongoDB
        console.log('🔄 Connecting to MongoDB...');
        await connectDb();
        console.log('✅ MongoDB connected successfully');

        // Log the collection name from the model
        console.log(`🔍 Collection name: ${Profile.collection.collectionName}`);
        
        // Count documents in the collection
        const count = await Profile.countDocuments();
        console.log(`📊 Found ${count} profiles in the collection`);
        
        // Get all profiles
        const profiles = await Profile.find({}).lean();
        console.log(`📤 Sending ${profiles.length} profiles to client`);
        
        return NextResponse.json(profiles);
    }
    catch (error) {
        console.error('❌ Error in GET /api/profiles:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch profiles',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// POST: Create a new profile
export async function POST(request: Request) {
    console.log('✉️  POST /api/profiles called');
    
    try {
        // Connect to MongoDB
        await connectDb();
        
        // Parse request body
        const body = await request.json();
        console.log('📝 Request body:', body);
        
        // Validate required fields
        if (!body.name || !body.profile_id) {
            return NextResponse.json(
                { error: 'Name and profile_id are required' },
                { status: 400 }
            );
        }
        
        // Create new profile
        const newProfile = new Profile({
            name: body.name,
            profile_id: body.profile_id,
            role: body.role || 'Creator',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        // Save to database
        const savedProfile = await newProfile.save();
        console.log('✅ Profile created:', savedProfile);
        
        return NextResponse.json({
            success: true,
            data: savedProfile
        }, { status: 201 });
        
    } catch (error: unknown) {
        console.error('❌ Error in POST /api/profiles:', error);
        
        // Handle duplicate key error
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            return NextResponse.json(
                { 
                    error: 'Profile with this ID already exists',
                    details: error instanceof Error ? error.message : 'Duplicate key error'
                },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { 
                error: 'Failed to create profile',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
