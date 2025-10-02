import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Workspace from "../models/workspace.model.js";
import Message from "../models/message.model.js";
import Invite from "../models/invite.model.js";
import Task from "../models/task.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        createdAt: newUser.createdAt,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.deletedAt) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    console.log("UpdateProfile - UserId:", userId);
    console.log("UpdateProfile - ProfilePic:", profilePic ? "Present" : "Not present");

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    try {
      console.log("Attempting to upload profile pic to Cloudinary...");
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      console.log("Profile pic uploaded successfully:", uploadResponse.secure_url);
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      ).select("-password");

      console.log("User updated successfully:", updatedUser);
      res.status(200).json(updatedUser);
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      return res.status(500).json({ error: "Failed to upload profile picture", details: cloudinaryError.message });
    }
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('workspaceMemberships.workspaceId', 'name description')
      .select('-password -emailVerificationToken -passwordResetToken');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data with workspace memberships
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      emailVerified: user.emailVerified,
      workspaceMemberships: user.workspaceMemberships,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    // Verify password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Remove user from all workspaces
    await Workspace.updateMany(
      { 'members.userId': userId },
      { $pull: { members: { userId } } }
    );

    // Delete workspaces owned by user (or transfer ownership)
    const ownedWorkspaces = await Workspace.find({ ownerId: userId });
    for (const workspace of ownedWorkspaces) {
      // Soft delete or transfer to another admin
      workspace.isActive = false;
      await workspace.save();
    }

    // Delete or anonymize messages
    await Message.updateMany(
      { senderId: userId },
      { $set: { senderId: null, senderDeleted: true } }
    );

    // Delete invites
    await Invite.deleteMany({ $or: [{ invitedBy: userId }, { email: user.email }] });

    // Unassign tasks
    await Task.updateMany(
      { $or: [{ assigneeId: userId }, { createdBy: userId }] },
      { $set: { assigneeId: null } }
    );

    // Delete user profile picture from cloudinary if exists
    if (user.profilePic) {
      const publicId = user.profilePic.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting profile pic from cloudinary:", error);
      }
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Clear cookie
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAccount controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};