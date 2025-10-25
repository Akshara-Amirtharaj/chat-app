import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { acceptInvite, declineInvite } from '../controllers/workspace.controller.js';

const router = express.Router();

// Invite routes (authentication required)
router.post('/:token/accept', protectRoute, acceptInvite);
router.post('/:token/decline', protectRoute, declineInvite);

export default router;



