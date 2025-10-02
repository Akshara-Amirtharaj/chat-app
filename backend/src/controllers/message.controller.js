import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { extractTasksFromMessage, shouldSuggestTask } from "../lib/aiTaskExtractor.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    console.log("SendMessage - Text:", text, "Image:", image ? "Present" : "Not present");

    let imageUrl;
    if (image) {
      try {
        console.log("Attempting to upload image to Cloudinary...");
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
        console.log("Image uploaded successfully:", imageUrl);
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({ error: "Failed to upload image", details: cloudinaryError.message });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    console.log("Message saved successfully");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // AI Task Extraction - analyze message for potential tasks
    let suggestedTasks = [];
    if (text && text.length > 10) {
      try {
        const extractedTasks = extractTasksFromMessage(text, senderId, null);
        suggestedTasks = extractedTasks.filter(task => shouldSuggestTask(task.confidence));
        
        // Send task suggestions to sender via socket
        if (suggestedTasks.length > 0) {
          const senderSocketId = getReceiverSocketId(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("taskSuggestions", {
              messageId: newMessage._id,
              tasks: suggestedTasks,
            });
          }
        }
      } catch (aiError) {
        console.error("AI task extraction error:", aiError);
        // Don't fail the message send if AI fails
      }
    }

    res.status(201).json({ 
      message: newMessage,
      suggestedTasks: suggestedTasks.length > 0 ? suggestedTasks : undefined,
    });
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};