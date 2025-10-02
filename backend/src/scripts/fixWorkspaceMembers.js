import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workspace from '../models/workspace.model.js';

dotenv.config();

const fixWorkspaceMembers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all workspace members to have status: 'ACTIVE' if they don't have a status
    const result = await Workspace.updateMany(
      { 'members.status': { $exists: false } },
      { $set: { 'members.$[].status': 'ACTIVE' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} workspaces`);
    
    // Also ensure all members have the status field
    const workspaces = await Workspace.find({});
    for (const workspace of workspaces) {
      let updated = false;
      workspace.members.forEach(member => {
        if (!member.status) {
          member.status = 'ACTIVE';
          updated = true;
        }
      });
      if (updated) {
        await workspace.save();
        console.log(`✅ Fixed workspace: ${workspace.name}`);
      }
    }

    console.log('✅ All workspaces fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixWorkspaceMembers();
