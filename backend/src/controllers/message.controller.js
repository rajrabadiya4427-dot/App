import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Request from "../models/request.js"; 
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getusersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find all accepted requests involving current user
    const accepted = await Request.find({
      $or: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    });

    // 2. Extract the other user's ID (not current user)
    const userIds = accepted
      .filter(req => req.senderId && req.receiverId)
      .map(req =>
        req.senderId.toString() === userId.toString()
          ? req.receiverId
          : req.senderId
      );

    // 3. Fetch user details (excluding passwords)
    const users = await User.find({ _id: { $in: userIds } }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("🔥 Sidebar Error:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching sidebar users" });
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

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
