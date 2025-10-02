import express from 'express';
import { checkAuth, login, logout, signup, updateProfile, deleteAccount } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
// import { validateSignup, validateLogin } from '../middleware/validation.middleware.js'; // Temporarily commented out

const router = express.Router()

router.post('/signup', signup) // validateSignup temporarily removed
router.post('/login', login) // validateLogin temporarily removed
router.post('/logout', logout)

router.get("/check", protectRoute, checkAuth);

router.put("/update-profile", protectRoute, updateProfile)
router.delete("/delete-account", protectRoute, deleteAccount)
export default router;