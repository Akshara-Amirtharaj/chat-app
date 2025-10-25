import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Workspace from '../models/workspace.model.js';
import Channel from '../models/channel.model.js';
import Message from '../models/message.model.js';
import Invite from '../models/invite.model.js';
import Task from '../models/task.model.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n🗑️  Clearing all collections...\n');

    // Delete all documents from each collection
    const userCount = await User.countDocuments();
    await User.deleteMany({});
    console.log(`Deleted ${userCount} users`);

    const workspaceCount = await Workspace.countDocuments();
    await Workspace.deleteMany({});
    console.log(`Deleted ${workspaceCount} workspaces`);

    const channelCount = await Channel.countDocuments();
    await Channel.deleteMany({});
    console.log(`Deleted ${channelCount} channels`);

    const messageCount = await Message.countDocuments();
    await Message.deleteMany({});
    console.log(`Deleted ${messageCount} messages`);

    const inviteCount = await Invite.countDocuments();
    await Invite.deleteMany({});
    console.log(`Deleted ${inviteCount} invites`);

    const taskCount = await Task.countDocuments();
    await Task.deleteMany({});
    console.log(`Deleted ${taskCount} tasks`);

    console.log('\n✨ Database cleared successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
