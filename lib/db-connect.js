import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/eventflow";

if (!MONGODB_URI) {
    throw new Error(
        "Please provide MONGODB_URI in the environment variables"
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        }).catch(err => {
            console.error("MongoDB connection error:", err.message);
            return null;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("Error in connectDB:", e.message);
        return null;
    }

    return cached.conn;
}

// Default export for backward compatibility
export default connectDB;
