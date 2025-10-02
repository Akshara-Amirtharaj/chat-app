import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getWorkspaceAnalytics,
  getUserAnalytics,
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/workspace', protectRoute, getWorkspaceAnalytics);
router.get('/user', protectRoute, getUserAnalytics);

export default router;
