import express from "express";
import {
  getInsights,
  generateInsight,
} from "../controllers/insightController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getInsights);
router.post("/generate", generateInsight);

export default router;
