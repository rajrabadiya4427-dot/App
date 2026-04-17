import express from "express";
import { protectRoute } from "../middleware/authmiddleware.js";
import {
  sendRequest,
  getRequests,
  acceptRequest,
} from "../controllers/requestController.js";

const router = express.Router();

router.post("/send", protectRoute, sendRequest);
router.get("/", protectRoute, getRequests);
router.put("/accept/:id", protectRoute, acceptRequest);

export default router;