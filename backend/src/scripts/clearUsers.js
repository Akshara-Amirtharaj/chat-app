import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

config();

const clearAllUsers = async () => {
  try {
    await connectDB();
    
    // Delete all users
    const result = await User.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} users from the database`);
    
    // Close the database connection
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing users:", error);
    process.exit(1);
  }
};

// Run the function
clearAllUsers();
