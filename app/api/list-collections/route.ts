import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// This is a test route to list all databases and collections
// WARNING: This exposes database structure - only use for development

export async function GET() {
    const uri = process.env.uri || process.env.URI || process.env.MONGODB_URI;
    
    if (!uri) {
        return NextResponse.json(
            { error: 'MongoDB URI not found in environment variables' },
            { status: 500 }
        );
    }

    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        // List all databases
        const adminDb = client.db().admin();
        const databases = await adminDb.listDatabases();
        
        // Get collections from each database
        const dbInfo = await Promise.all(
            databases.databases.map(async (dbInfo) => {
                if (dbInfo.name === 'admin' || dbInfo.name === 'local' || dbInfo.name === 'config') {
                    return { name: dbInfo.name, collections: ['(skipped system database)'] };
                }
                
                const db = client.db(dbInfo.name);
                const collections = await db.listCollections().toArray();
                return {
                    name: dbInfo.name,
                    collections: collections.map(c => c.name)
                };
            })
        );

        return NextResponse.json({
            connection: {
                uri: uri.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://***:***@'),
                databases: dbInfo
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to list collections',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        await client.close();
    }
}
