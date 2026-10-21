import { Router } from 'express';
import { searchUsers, getDashboardStats } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/search', searchUsers);
router.get('/dashboard-stats', getDashboardStats);

export default router;
