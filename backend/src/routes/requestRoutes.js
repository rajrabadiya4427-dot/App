import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendRequest,
  getRequests,
  acceptRequest,
   deleteFriend, 
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/send", protectRoute, sendRequest);
router.get("/", protectRoute, getRequests);
router.put("/accept/:id", protectRoute, acceptRequest);
router.delete("/friend/:friendId", protectRoute, deleteFriend);

export default router;