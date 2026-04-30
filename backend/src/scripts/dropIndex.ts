import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

async function dropEmailIndex() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const collection = mongoose.connection.collection('users');
    
    try {
      await collection.dropIndex('email_1');
      console.log("Successfully dropped 'email_1' index");
    } catch (e: any) {
      if (e.codeName === 'IndexNotFound') {
        console.log("Index 'email_1' not found, it might have been already dropped.");
      } else {
        throw e;
      }
    }

    await mongoose.disconnect();
    console.log("Disconnected");
  } catch (err) {
    console.error("Error dropping index:", err);
  }
}

dropEmailIndex();
