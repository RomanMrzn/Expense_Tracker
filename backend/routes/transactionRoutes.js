import express from "express";
import {
  getTransactionById,
  updateTransaction,
  getTransactions,
  createTransaction,
  deleteTransaction,
  analyzeTransactions,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getTransactions);
router.post("/", createTransaction);
router.post("/analyze", analyzeTransactions);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
