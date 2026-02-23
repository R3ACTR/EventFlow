import mongoose from "mongoose";
import User from "../models/User.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/eventflow";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

async function makeAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    process.stdout.write("Connected to MongoDB\n");

    const username = "metrix"; 
    // Case-insensitive search for name
    const user = await User.findOne({ name: { $regex: new RegExp(`^${username}$`, "i") } });

    if (!user) {
      process.stdout.write(`User "${username}" not found.\n`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    process.stdout.write(`Successfully updated user "${user.name}" (Email: ${user.email}) to role "admin".\n`);
    
    await mongoose.disconnect();
    process.stdout.write("Disconnected from MongoDB\n");
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
}

makeAdmin();
