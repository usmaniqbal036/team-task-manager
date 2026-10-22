import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
} from '../validators/taskValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', validateQuery(taskQuerySchema), getTasks);
router.post('/', validateBody(createTaskSchema), createTask);
router.get('/:id', getTaskById);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.patch('/:id/status', validateBody(updateTaskStatusSchema), updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;
