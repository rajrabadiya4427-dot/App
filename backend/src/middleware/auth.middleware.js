import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        // Token expired after 7 days -> verify signature without checking expiration
        decoded = jwt.verify(token, process.env.JWT_SECRET, {
          ignoreExpiration: true,
        });

        // Generate brand-new 7-day token and update cookie
        if (decoded && decoded.userId) {
          generateToken(decoded.userId, res);
        }
      } else {
        return res.status(401).json({ message: "Unauthorized - Invalid Token" });
      }
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token Payload" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};
