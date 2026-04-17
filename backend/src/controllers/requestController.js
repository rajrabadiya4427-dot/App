import Request from "../models/request.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const sendRequest = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const senderId = req.user._id;

    const receiver = await User.findOne({ mobileNumber });

    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await Request.findOne({
      senderId,
      receiverId: receiver._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = new Request({
      senderId,
      receiverId: receiver._id,
    });

    await request.save();
    res.status(201).json(request);

  } catch (error) {
    res.status(500).json({ message: "Error sending request" });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      receiverId: req.user._id,
      status: "pending",
    }).populate("senderId", "-password");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;

   const request = await Request.findByIdAndUpdate(
  id,
  { status: "accepted" },
  { returnDocument: "after" }
).populate("senderId receiverId");

    // ✅ NEW: Notify both users to refresh their sidebar contacts
    const senderSocketId = getReceiverSocketId(request.senderId._id);
    const receiverSocketId = getReceiverSocketId(request.receiverId._id);

    if (senderSocketId) {
      io.to(senderSocketId).emit("requestAccepted", { userId: request.receiverId._id });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("requestAccepted", { userId: request.senderId._id });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Error accepting request" });
  }
};

// Add at the end of the file
export const deleteFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    // Find and delete the accepted request in either direction
    const deletedRequest = await Request.findOneAndDelete({
      $or: [
        { senderId: userId, receiverId: friendId, status: "accepted" },
        { senderId: friendId, receiverId: userId, status: "accepted" },
      ],
    });

    if (!deletedRequest) {
      return res.status(404).json({ message: "Friend connection not found" });
    }

    // Notify both users to refresh their sidebar (optional)
    const senderSocket = getReceiverSocketId(userId);
    const receiverSocket = getReceiverSocketId(friendId);

    if (senderSocket) io.to(senderSocket).emit("friendDeleted", { friendId });
    if (receiverSocket) io.to(receiverSocket).emit("friendDeleted", { friendId: userId });

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Delete friend error:", error);
    res.status(500).json({ message: "Server error" });
  }
};