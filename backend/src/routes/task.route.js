import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addChecklistItem,
  toggleChecklistItem,
  addTimeEntry,
  getTaskStats,
} from '../controllers/task.controller.js';

const router = express.Router();

// Task routes
router.post('/', protectRoute, createTask);
router.get('/', protectRoute, getTasks);
router.get('/stats', protectRoute, getTaskStats);
router.get('/:taskId', protectRoute, getTask);
router.put('/:taskId', protectRoute, updateTask);
router.delete('/:taskId', protectRoute, deleteTask);

// Checklist management
router.post('/:taskId/checklist', protectRoute, addChecklistItem);
router.patch('/:taskId/checklist/:itemId', protectRoute, toggleChecklistItem);

// Time tracking
router.post('/:taskId/time', protectRoute, addTimeEntry);

export default router;



