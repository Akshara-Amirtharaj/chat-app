import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body || {};
    const mode = (req.query.mode || 'soft').toLowerCase();

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    if (mode === 'hard') {
      // For hard delete, implement cascade ownership transfers
      await cascadeOwnershipTransfer(user._id);
      
      // Delete all messages where user is sender or receiver
      await Message.deleteMany({
        $or: [{ senderId: user._id }, { receiverId: user._id }]
      });
      
      // Delete the user account
      await User.deleteOne({ _id: user._id });
      
      // Clear the JWT cookie
      res.cookie('jwt', '', { maxAge: 0 });
      return res.status(200).json({ message: 'Account permanently deleted' });
    }

    // Soft delete
    if (!user.deletedAt) {
      user.deletedAt = new Date();
      await user.save();
    }
    res.cookie('jwt', '', { maxAge: 0 });
    return res.status(200).json({ message: 'Account deactivated; will be purged in 30 days' });
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Helper function to handle cascade ownership transfers
const cascadeOwnershipTransfer = async (userId) => {
  try {
    // Find all messages where this user is the sender
    const messagesToTransfer = await Message.find({ senderId: userId });
    
    if (messagesToTransfer.length > 0) {
      // For each message, find the receiver and transfer ownership
      for (const message of messagesToTransfer) {
        // Update the message to transfer ownership to the receiver
        // This is a simple approach - in a more complex system, you might want
        // to transfer to a system user or handle it differently
        await Message.findByIdAndUpdate(message._id, {
          senderId: message.receiverId,
          $set: { 
            ownershipTransferred: true,
            originalSenderId: userId,
            transferredAt: new Date()
          }
        });
      }
    }
    
    // Handle workspace ownership transfers if any
    // This would be implemented when workspace functionality is added
    console.log(`Cascade ownership transfer completed for user ${userId}`);
  } catch (error) {
    console.error('Error in cascade ownership transfer:', error);
    throw error;
  }
};

export const exportAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const messages = await Message.find({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    })
      .sort({ createdAt: 1 })
      .lean();

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt || null,
      },
      messages,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="account-export.json"');
    return res.status(200).send(JSON.stringify(exportPayload));
  } catch (error) {
    console.error('Error in exportAccount:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Request account recovery (for soft-deleted accounts)
export const requestAccountRecovery = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find soft-deleted user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      deletedAt: { $exists: true, $ne: null }
    });

    if (!user) {
      // Don't reveal if account exists or not for security
      return res.status(200).json({ 
        message: 'If an account with this email was soft-deleted, a recovery link has been sent.' 
      });
    }

    // Check if recovery email was sent recently (prevent spam)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.recoveryEmailSent && user.recoveryEmailSent > oneHourAgo) {
      return res.status(429).json({ 
        message: 'Recovery email already sent recently. Please wait before requesting another.' 
      });
    }

    // Generate recovery token
    const recoveryToken = crypto.randomBytes(32).toString('hex');
    const recoveryTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with recovery token
    await User.findByIdAndUpdate(user._id, {
      recoveryToken,
      recoveryTokenExpires,
      recoveryEmailSent: new Date()
    });

    // In a real application, you would send an email here
    // For now, we'll log the recovery link
    const recoveryLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recover-account?token=${recoveryToken}`;
    console.log(`Recovery link for ${email}: ${recoveryLink}`);

    res.status(200).json({ 
      message: 'If an account with this email was soft-deleted, a recovery link has been sent.',
      // In development, include the link for testing
      ...(process.env.NODE_ENV === 'development' && { recoveryLink })
    });

  } catch (error) {
    console.error('Error in requestAccountRecovery:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Recover account using token
export const recoverAccount = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Recovery token is required' });
    }

    // Find user with valid recovery token
    const user = await User.findOne({
      recoveryToken: token,
      recoveryTokenExpires: { $gt: new Date() },
      deletedAt: { $exists: true, $ne: null }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired recovery token' });
    }

    // Restore the account by removing deletedAt and clearing recovery fields
    await User.findByIdAndUpdate(user._id, {
      $unset: { 
        deletedAt: 1,
        recoveryToken: 1,
        recoveryTokenExpires: 1,
        recoveryEmailSent: 1
      }
    });

    res.status(200).json({ 
      message: 'Account recovered successfully! You can now log in again.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error in recoverAccount:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Check if recovery token is valid (for frontend validation)
export const validateRecoveryToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Recovery token is required' });
    }

    const user = await User.findOne({
      recoveryToken: token,
      recoveryTokenExpires: { $gt: new Date() },
      deletedAt: { $exists: true, $ne: null }
    }).select('fullName email deletedAt');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired recovery token' });
    }

    res.status(200).json({ 
      valid: true,
      user: {
        fullName: user.fullName,
        email: user.email,
        deletedAt: user.deletedAt
      }
    });

  } catch (error) {
    console.error('Error in validateRecoveryToken:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



