import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDb from '@/lib/mongodb';

// Test model that matches your collection structure
const TestSchema = new mongoose.Schema({
    name: String,
    profile_id: String,
    role: String
}, { collection: 'profiles' });

const TestModel = mongoose.models.TestProfile || mongoose.model('TestProfile', TestSchema);

export async function GET() {
    try {
        console.log('🔄 Testing MongoDB connection...');
        
        // Connect to MongoDB
        await connectDb();
        console.log('✅ MongoDB connected successfully');
        
        // Ensure we're connected to the database
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        
        // Get collections
        const collections = await db.listCollections().toArray();
        console.log('📚 Collections in database:', collections.map(c => c.name));
        
        // Try to find documents using the test model
        const testDocs = await TestModel.find({}).limit(5);
        console.log('📝 Test documents found:', testDocs.length);
        
        // Count all documents in the profiles collection
        const count = await TestModel.countDocuments();
        console.log('📊 Total documents in profiles collection:', count);
        
        // Get some sample data
        const sampleData = await TestModel.find({}).limit(5).lean();
        
        return NextResponse.json({
            success: true,
            collectionCount: count,
            collections: collections.map(c => c.name),
            sampleData,
            connectionState: mongoose.connection.readyState,
            dbName: mongoose.connection.name
        });
        
    } catch (error) {
        console.error('❌ Test error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
