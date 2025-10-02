import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createExpense,
  getExpenses,
  getFinancialSummary,
  recordSettlement,
  exportExpensesCSV,
  getSettlements,
} from '../controllers/finance.controller.js';

const router = express.Router();

// Expense routes
router.post('/expenses', protectRoute, createExpense);
router.get('/expenses', protectRoute, getExpenses);
router.get('/summary', protectRoute, getFinancialSummary);

// Settlement routes
router.post('/settlements', protectRoute, recordSettlement);
router.get('/settlements', protectRoute, getSettlements);
router.get('/settlements/export.csv', protectRoute, exportExpensesCSV);

export default router;
