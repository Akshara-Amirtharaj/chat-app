const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Workspace = require('../models/workspace.model');

dotenv.config();

async function fixWorkspaceMembers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connection established');

    // First pass: Update all workspace members to have status: 'ACTIVE' if status is missing
    const updateResult = await Workspace.updateMany(
      { 'members.status': { $exists: false } },
      { $set: { 'members.$[].status': 'ACTIVE' } }
    );
    console.log(`Updated ${updateResult.modifiedCount} workspaces with bulk update`);
    
    // Second pass: Ensure all members have the status field (handles any edge cases)
    const workspaces = await Workspace.find({});
    let fixedCount = 0;
    
    for (const workspace of workspaces) {
      let needsUpdate = false;
      
      workspace.members.forEach(member => {
        if (!member.status) {
          member.status = 'ACTIVE';
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        await workspace.save();
        fixedCount++;
        console.log(`Fixed member status for workspace: ${workspace.name}`);
      }
    }

    console.log(`Completed. Fixed member status in ${fixedCount} workspaces`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing workspace members:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  fixWorkspaceMembers();
}
