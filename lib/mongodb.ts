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

const MONGODB_URI = process.env.MONGODB_URI || 'mont:27017/digi';

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable in .env.local'
    );
}

// Initialize the global mongoose cache if it doesn't exist
if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
}

const { conn, promise } = global.mongoose;

async function connectDB() {
    if (conn) {
        console.log('✅ Using existing MongoDB connection');
        return conn;
    }

    if (!promise) {
        const opts = {
            bufferCommands: false,
            dbName: 'digi',
        };

        global.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongooseInstance) => {
                console.log('✅ Connected to MongoDB database: digi');
                return mongooseInstance;
            })
            .catch((error: Error) => {
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

    return global.mongoose.conn;
}

export default connectDB;