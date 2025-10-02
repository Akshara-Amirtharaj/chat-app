import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createChallenge,
  getChallenges,
  getChallenge,
  joinChallenge,
  leaveChallenge,
  logCompletion,
  getChallengeSummary,
  getUserLogs,
} from '../controllers/challenge.controller.js';

const router = express.Router();

// Challenge routes
router.post('/', protectRoute, createChallenge);
router.get('/', protectRoute, getChallenges);
router.get('/:id', protectRoute, getChallenge);
router.post('/:id/join', protectRoute, joinChallenge);
router.post('/:id/leave', protectRoute, leaveChallenge);
router.post('/:id/log', protectRoute, logCompletion);
router.get('/:id/summary', protectRoute, getChallengeSummary);
router.get('/:id/logs', protectRoute, getUserLogs);

export default router;
