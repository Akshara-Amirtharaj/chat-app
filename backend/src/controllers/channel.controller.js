import Channel from '../models/channel.model.js';
import Workspace from '../models/workspace.model.js';
import Message from '../models/message.model.js';

// Create channel
export const createChannel = async (req, res) => {
  try {
    const { workspaceId, name, description, isPrivate, allowedUserIds, allowedRoles } = req.body;
    const userId = req.user._id;

    if (!workspaceId || !name) {
      return res.status(400).json({ message: 'Workspace ID and channel name are required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions
    if (!workspace.hasPermission(userId, 'ADMIN')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Check if channel name already exists in workspace
    const existingChannel = await Channel.findOne({ 
      workspaceId, 
      name: name.toLowerCase(),
      isActive: true 
    });
    
    if (existingChannel) {
      return res.status(400).json({ message: 'Channel name already exists' });
    }

    const channel = new Channel({
      name: name.toLowerCase(),
      description: description || '',
      workspaceId,
      isPrivate: isPrivate || false,
      allowedUserIds: allowedUserIds || [],
      allowedRoles: allowedRoles || [],
      createdBy: userId,
    });

    await channel.save();
    await channel.populate('createdBy', 'fullName profilePic');

    res.status(201).json({
      message: 'Channel created successfully',
      channel: {
        _id: channel._id,
        name: channel.name,
        description: channel.description,
        workspaceId: channel.workspaceId,
        type: channel.type,
        isPrivate: channel.isPrivate,
        createdBy: channel.createdBy,
        createdAt: channel.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in createChannel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get channels for workspace
export const getWorkspaceChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const channels = await Channel.find({ 
      workspaceId, 
      isActive: true 
    })
      .populate('createdBy', 'fullName profilePic')
      .sort({ createdAt: 1 });

    // Filter channels based on user access
    const userRole = workspace.getUserRole(userId);
    const accessibleChannels = channels.filter(channel => 
      channel.canUserAccess(userId, userRole)
    );

    res.status(200).json({ channels: accessibleChannels });
  } catch (error) {
    console.error('Error in getWorkspaceChannels:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get channel messages
export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { cursor, limit = 50 } = req.query;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId).populate('workspaceId');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const workspace = channel.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user can access channel
    const userRole = workspace.getUserRole(userId);
    if (!channel.canUserAccess(userId, userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build query
    const query = { 
      channelId, 
      type: { $ne: 'SYSTEM' } // Exclude system messages
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'fullName profilePic')
      .populate('parentMessageId', 'text senderId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ 
      messages: messages.reverse(),
      hasMore: messages.length === parseInt(limit),
      nextCursor: messages.length > 0 ? messages[messages.length - 1]._id : null,
    });
  } catch (error) {
    console.error('Error in getChannelMessages:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Send message to channel
export const sendChannelMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { text, type = 'TEXT', parentMessageId } = req.body;
    const userId = req.user._id;

    if (!text && !req.file) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const channel = await Channel.findById(channelId).populate('workspaceId');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const workspace = channel.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user can access channel
    const userRole = workspace.getUserRole(userId);
    if (!channel.canUserAccess(userId, userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Handle file upload if present
    let imageUrl = null;
    if (req.file) {
      // Upload to cloudinary or your preferred service
      // For now, we'll use a placeholder
      imageUrl = req.file.path;
    }

    const message = new Message({
      senderId: userId,
      channelId,
      workspaceId: workspace._id,
      text,
      image: imageUrl,
      type,
      parentMessageId,
    });

    await message.save();
    await message.populate('senderId', 'fullName profilePic');

    // Update thread count if it's a reply
    if (parentMessageId) {
      await Message.findByIdAndUpdate(parentMessageId, {
        $inc: { threadCount: 1 }
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Error in sendChannelMessage:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update channel
export const updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description, isPrivate, allowedUserIds, allowedRoles } = req.body;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId).populate('workspaceId');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const workspace = channel.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions
    if (!workspace.hasPermission(userId, 'ADMIN')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const updateData = {};
    if (name) updateData.name = name.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (allowedUserIds) updateData.allowedUserIds = allowedUserIds;
    if (allowedRoles) updateData.allowedRoles = allowedRoles;

    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      updateData,
      { new: true }
    ).populate('createdBy', 'fullName profilePic');

    res.status(200).json({
      message: 'Channel updated successfully',
      channel: updatedChannel,
    });
  } catch (error) {
    console.error('Error in updateChannel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete channel
export const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId).populate('workspaceId');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const workspace = channel.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions
    if (!workspace.hasPermission(userId, 'ADMIN')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Cannot delete general channel
    if (channel.name === 'general') {
      return res.status(400).json({ message: 'Cannot delete general channel' });
    }

    // Soft delete
    channel.isActive = false;
    await channel.save();

    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Error in deleteChannel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const message = await Message.findById(messageId).populate('channelId');
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      reaction => reaction.userId.toString() === userId.toString() && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        reaction => !(reaction.userId.toString() === userId.toString() && reaction.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({
        emoji,
        userId,
      });
    }

    await message.save();

    res.status(200).json({
      message: existingReaction ? 'Reaction removed' : 'Reaction added',
      reactions: message.reactions,
    });
  } catch (error) {
    console.error('Error in addReaction:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



