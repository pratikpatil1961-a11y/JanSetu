import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn("Please define the MONGODB_URI environment variable inside .env.local");
}

if (MONGODB_URI.includes("<db_password>")) {
  console.warn("Replace <db_password> in MONGODB_URI inside .env.local before using authentication.");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

let cached: MongooseCache = globalWithMongoose.mongoose ?? { conn: null, promise: null };

globalWithMongoose.mongoose = cached;

async function dbConnect() {
  if (!MONGODB_URI || MONGODB_URI.includes("<db_password>")) {
    throw new Error("MongoDB is not configured. Replace <db_password> in MONGODB_URI inside .env.local.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
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

export default dbConnect;
