import mongoose from 'mongoose';

// Type for the mongoose cache
type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable in .env.local. Example: mongodb://localhost:27017/your_database_name'
    );
}

// At this point, TypeScript knows MONGODB_URI is a string
const mongoUri = MONGODB_URI;
console.log('MongoDB URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs

// Initialize the global mongoose cache if it doesn't exist
if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
}

const { conn, promise } = global.mongoose;

async function connectDB(): Promise<typeof mongoose> {
    console.log('MongoDB connection status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    
    if (conn) {
        console.log('Using existing MongoDB connection');
        console.log('✅ Using existing MongoDB connection');
        // We know conn is not null here because of the if check
        return conn;
    }

    if (!promise) {
        const opts = {
            bufferCommands: false,
            dbName: process.env.MONGODB_DB || 'digi',
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds timeout
        };

        global.mongoose.promise = mongoose.connect(mongoUri, opts)
            .then(() => {
                console.log('✅ MongoDB connected successfully');
                return mongoose;
            })
            .catch((error) => {
                console.error('❌ MongoDB connection error:', error);
                throw error;
            });
    }

    try {
        global.mongoose.conn = await global.mongoose.promise;
    } catch (e) {
        global.mongoose.promise = null;
        throw e;
    }

    if (!global.mongoose.conn) {
        throw new Error('Failed to establish MongoDB connection');
    }
    return global.mongoose.conn;
}

export default connectDB;