import { Router } from 'express';
import { searchUsers, getDashboardStats, getReminders } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { userSearchQuerySchema } from '../validators/userValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/search', validateQuery(userSearchQuerySchema), searchUsers);
router.get('/dashboard-stats', getDashboardStats);
router.get('/reminders', getReminders);

export default router;
