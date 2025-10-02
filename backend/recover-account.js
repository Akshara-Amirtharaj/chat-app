import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const recoverAccount = async (email) => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Find the soft-deleted user
    const user = await User.findOne({ 
      email: email,
      deletedAt: { $exists: true, $ne: null }
    });

    if (!user) {
      console.log('No soft-deleted account found with that email');
      return;
    }

    // Remove the deletedAt field to restore the account
    await User.findByIdAndUpdate(user._id, {
      $unset: { deletedAt: 1 }
    });

    console.log(`Account recovered successfully for ${email}`);
    console.log('You can now log in again');

  } catch (error) {
    console.error('Error recovering account:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Usage: node recover-account.js your-email@example.com
const email = process.argv[2];
if (!email) {
  console.log('Usage: node recover-account.js your-email@example.com');
  process.exit(1);
}

recoverAccount(email);
