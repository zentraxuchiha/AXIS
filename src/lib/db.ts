import mongoose from "mongoose";
import dns from "dns";

// Force Google's public DNS to resolve Atlas SRV records
// This is critical for Windows environments where SRV resolution often fails
// Custom DNS resolution removed for stability on Windows
/*
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    console.log("[DB] DNS Servers set to Google DNS");
} catch (e) {
    console.error("[DB] Failed to set custom DNS servers:", e);
}
*/

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    console.log("[DB] Attempting to connect... (State:", mongoose.connection.readyState, ")");

    if (cached.conn) {
        console.log("[DB] Using cached connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        console.log("[DB] Creating new connection promise to Atlas...");
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("[DB] SUCCESS: Connected to MongoDB Atlas");
            return mongoose;
        }).catch(err => {
            console.error("[DB] FATAL: Connection error:", err.message);
            cached.promise = null; // Reset promise so we can retry
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
