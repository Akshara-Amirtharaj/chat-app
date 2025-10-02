import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createChannel,
  getWorkspaceChannels,
  getChannelMessages,
  sendChannelMessage,
  updateChannel,
  deleteChannel,
  addReaction,
} from '../controllers/channel.controller.js';

const router = express.Router();

// Channel routes
router.post('/', protectRoute, createChannel);
router.get('/workspace/:workspaceId', protectRoute, getWorkspaceChannels);
router.get('/:channelId/messages', protectRoute, getChannelMessages);
router.post('/:channelId/messages', protectRoute, sendChannelMessage);
router.put('/:channelId', protectRoute, updateChannel);
router.delete('/:channelId', protectRoute, deleteChannel);

// Message reactions
router.post('/messages/:messageId/reactions', protectRoute, addReaction);

export default router;

