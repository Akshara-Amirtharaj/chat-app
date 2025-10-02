import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
  deleteAccount, 
  exportAccount, 
  requestAccountRecovery, 
  recoverAccount, 
  validateRecoveryToken 
} from '../controllers/account.controller.js';
// import { validateAccountDeletion } from '../middleware/validation.middleware.js'; // Temporarily commented out

const router = express.Router();

// Protected routes (require authentication)
router.delete('/', protectRoute, deleteAccount); // validateAccountDeletion temporarily removed
router.get('/export', protectRoute, exportAccount);

// Public recovery routes (no authentication required)
router.post('/recovery/request', requestAccountRecovery);
router.post('/recovery/recover', recoverAccount);
router.get('/recovery/validate', validateRecoveryToken);

export default router;



