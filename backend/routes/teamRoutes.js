import { Router } from 'express';
import {
  getTeams,
  createTeam,
  getTeamById,
  updateTeam,
  addMember,
  removeMember,
  deleteTeam,
} from '../controllers/teamController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createTeamSchema,
  updateTeamSchema,
  addMemberSchema,
} from '../validators/teamValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTeams);
router.post('/', validateBody(createTeamSchema), createTeam);
router.get('/:id', getTeamById);
router.put('/:id', validateBody(updateTeamSchema), updateTeam);
router.post('/:id/members', validateBody(addMemberSchema), addMember);
router.delete('/:id/members/:userId', removeMember);
router.delete('/:id', deleteTeam);

export default router;
