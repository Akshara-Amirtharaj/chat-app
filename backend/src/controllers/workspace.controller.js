import crypto from 'crypto';
import Workspace from '../models/workspace.model.js';
import Channel from '../models/channel.model.js';
import Invite from '../models/invite.model.js';
import User from '../models/user.model.js';

// Create workspace
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    let finalSlug = slug;
    let counter = 1;
    while (await Workspace.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const workspace = new Workspace({
      name,
      description: description || '',
      slug: finalSlug,
      ownerId: userId,
    });

    await workspace.save();

    // Create default general channel
    const generalChannel = new Channel({
      name: 'general',
      description: 'General discussion',
      workspaceId: workspace._id,
      createdBy: userId,
      isPrivate: false,
    });

    await generalChannel.save();

    // Populate the workspace with owner info
    await workspace.populate('ownerId', 'fullName email profilePic');

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        ownerId: workspace.ownerId,
        memberCount: workspace.memberCount,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in createWorkspace:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get workspace by ID
export const getWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id)
      .populate('ownerId', 'fullName email profilePic')
      .populate('members.userId', 'fullName email profilePic');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get channels
    const channels = await Channel.find({ 
      workspaceId: id, 
      isActive: true 
    }).populate('createdBy', 'fullName profilePic');

    // Filter channels based on user access
    const accessibleChannels = channels.filter(channel => {
      const userRole = workspace.getUserRole(userId);
      return channel.canUserAccess(userId, userRole);
    });

    res.status(200).json({
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        ownerId: workspace.ownerId,
        members: workspace.members,
        memberCount: workspace.memberCount,
        settings: workspace.settings,
        createdAt: workspace.createdAt,
      },
      channels: accessibleChannels,
    });
  } catch (error) {
    console.error('Error in getWorkspace:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get user's workspaces
export const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.user._id;

    const workspaces = await Workspace.find({
      'members.userId': userId,
      isActive: true,
    })
      .populate('ownerId', 'fullName email profilePic')
      .populate('members.userId', 'fullName email profilePic')
      .select('name slug description ownerId members channels memberCount createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ workspaces });
  } catch (error) {
    console.error('Error in getUserWorkspaces:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update workspace
export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, settings } = req.body;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions
    if (!workspace.hasPermission(userId, 'ADMIN')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (settings) updateData.settings = { ...workspace.settings, ...settings };

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('ownerId', 'fullName email profilePic');

    res.status(200).json({
      message: 'Workspace updated successfully',
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error('Error in updateWorkspace:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete workspace
export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can delete workspace
    if (workspace.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only workspace owner can delete workspace' });
    }

    // Soft delete
    workspace.isActive = false;
    await workspace.save();

    res.status(200).json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error in deleteWorkspace:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Invite users to workspace
export const inviteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { emails, userIds, role = 'MEMBER', customMessage } = req.body;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id).populate('members.userId', 'email fullName');
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions - owner or admin can invite
    const isOwner = workspace.ownerId.toString() === userId.toString();
    const hasAdminPermission = workspace.hasPermission(userId, 'ADMIN');
    
    if (!isOwner && !hasAdminPermission) {
      return res.status(403).json({ message: 'Insufficient permissions. Only workspace owner or admins can invite members.' });
    }

    const invites = [];
    const skippedEmails = [];

    // Handle email invites
    if (emails && emails.length > 0) {
      for (const email of emails) {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && workspace.isMember(existingUser._id)) {
          skippedEmails.push(email);
          continue; // Skip if already member
        }

        const invite = new Invite({
          token: crypto.randomBytes(32).toString('hex'),
          workspaceId: id,
          invitedBy: userId,
          email,
          role,
          customMessage,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        await invite.save();
        invites.push(invite);

        // Add user to workspace with PENDING status if they exist
        if (existingUser) {
          workspace.members.push({
            userId: existingUser._id,
            role,
            status: 'PENDING',
            joinedAt: new Date(),
            invitedBy: userId,
          });
        }
      }
      
      if (invites.length > 0) {
        await workspace.save();
      }
    }

    // Handle user ID invites (for existing users)
    if (userIds && userIds.length > 0) {
      for (const invitedUserId of userIds) {
        if (workspace.isMember(invitedUserId)) {
          continue; // Skip if already member
        }

        const user = await User.findById(invitedUserId);
        if (!user) continue;

        const invite = new Invite({
          token: crypto.randomBytes(32).toString('hex'),
          workspaceId: id,
          invitedBy: userId,
          email: user.email,
          role,
          customMessage,
          invitedUserIds: [invitedUserId],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await invite.save();
        invites.push(invite);
      }
    }

    let message = 'Invites sent successfully';
    if (skippedEmails.length > 0 && invites.length === 0) {
      return res.status(400).json({ 
        message: `All users are already members of this workspace: ${skippedEmails.join(', ')}` 
      });
    } else if (skippedEmails.length > 0) {
      message = `${invites.length} invite(s) sent. ${skippedEmails.length} user(s) already members: ${skippedEmails.join(', ')}`;
    }

    res.status(200).json({
      message,
      invites: invites.map(invite => ({
        _id: invite._id,
        email: invite.email,
        role: invite.role,
        inviteUrl: invite.inviteUrl,
        expiresAt: invite.expiresAt,
      })),
      skipped: skippedEmails,
    });
  } catch (error) {
    console.error('Error in inviteUsers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Accept invite
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user._id;

    const invite = await Invite.findOne({ token })
      .populate('workspaceId')
      .populate('invitedBy', 'fullName email');

    if (!invite) {
      return res.status(404).json({ message: 'Invalid invite token' });
    }

    if (!invite.isValid()) {
      return res.status(400).json({ message: 'Invite has expired or been used' });
    }

    const workspace = invite.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is already an active member
    const existingMember = workspace.members.find(m => m.userId.toString() === userId.toString());
    
    if (existingMember) {
      // Update status from PENDING to ACTIVE
      if (existingMember.status === 'PENDING') {
        existingMember.status = 'ACTIVE';
        existingMember.joinedAt = new Date();
      } else {
        return res.status(400).json({ message: 'You are already a member of this workspace' });
      }
    } else {
      // Add user to workspace as new member
      workspace.members.push({
        userId,
        role: invite.role,
        status: 'ACTIVE',
        joinedAt: new Date(),
        invitedBy: invite.invitedBy._id,
      });
    }

    await workspace.save();

    // Mark invite as accepted
    await invite.accept(userId);

    res.status(200).json({
      message: 'Successfully joined workspace',
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        slug: workspace.slug,
      },
    });
  } catch (error) {
    console.error('Error in acceptInvite:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Decline invite
export const declineInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user._id;

    const invite = await Invite.findOne({ token }).populate('workspaceId');
    if (!invite) {
      return res.status(404).json({ message: 'Invalid invite token' });
    }

    if (invite.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invite cannot be declined' });
    }

    // Remove user from workspace members if they were added as PENDING
    const workspace = invite.workspaceId;
    if (workspace) {
      workspace.members = workspace.members.filter(
        m => !(m.userId.toString() === userId.toString() && m.status === 'PENDING')
      );
      await workspace.save();
    }

    await invite.decline();

    res.status(200).json({ message: 'Invite declined successfully' });
  } catch (error) {
    console.error('Error in declineInvite:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Remove member from workspace
export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions
    if (!workspace.hasPermission(userId, 'ADMIN')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Cannot remove owner
    if (workspace.ownerId.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }

    // Cannot remove yourself
    if (userId.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }

    workspace.members = workspace.members.filter(
      member => member.userId.toString() !== memberId
    );

    await workspace.save();

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error in removeMember:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions
    if (!workspace.hasPermission(userId, 'ADMIN')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Cannot change owner role
    if (workspace.ownerId.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot change owner role' });
    }

    const member = workspace.members.find(
      member => member.userId.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;
    await workspace.save();

    res.status(200).json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Error in updateMemberRole:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get user's pending invites
export const getUserInvites = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    // Find all pending invites for this user's email
    const invites = await Invite.find({
      email: userEmail,
      status: 'PENDING',
      expiresAt: { $gt: new Date() }
    })
    .populate('workspaceId', 'name description members channels')
    .populate('invitedBy', 'fullName email')
    .sort({ createdAt: -1 });

    res.status(200).json(invites);
  } catch (error) {
    console.error('Error in getUserInvites:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Leave workspace
export const leaveWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Cannot leave if you're the owner
    if (workspace.ownerId.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Owner cannot leave workspace. Transfer ownership or delete the workspace instead.' });
    }

    // Check if user is a member
    if (!workspace.isMember(userId)) {
      return res.status(400).json({ message: 'You are not a member of this workspace' });
    }

    // Remove user from members
    workspace.members = workspace.members.filter(
      member => member.userId.toString() !== userId.toString()
    );

    await workspace.save();

    res.status(200).json({ message: 'Successfully left workspace' });
  } catch (error) {
    console.error('Error in leaveWorkspace:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

