import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createWorkspace,
  getWorkspace,
  getUserWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  inviteUsers,
  acceptInvite,
  declineInvite,
  removeMember,
  updateMemberRole,
  getUserInvites,
  leaveWorkspace,
} from '../controllers/workspace.controller.js';

const router = express.Router();

// Workspace routes
router.post('/', protectRoute, createWorkspace);
router.get('/user', protectRoute, getUserWorkspaces);
router.get('/user/invites', protectRoute, getUserInvites);
router.get('/:id', protectRoute, getWorkspace);
router.put('/:id', protectRoute, updateWorkspace);
router.delete('/:id', protectRoute, deleteWorkspace);
router.post('/:id/leave', protectRoute, leaveWorkspace);

// Member management
router.post('/:id/invites', protectRoute, inviteUsers);
router.delete('/:id/members/:memberId', protectRoute, removeMember);
router.patch('/:id/members/:memberId/role', protectRoute, updateMemberRole);

export default router;



