import { sendError } from '../utils/responseHandler.js';
import { isTeamMember, isTeamOwner } from '../utils/access.js';
import { DataStore } from '../services/dataStore.js';

export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return sendError(res, 'Authentication required. Please log in to continue.', 401);
};

export const requireTeamAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const teamId = req.params.teamId || req.params.id || req.body.team;

    if (!teamId) {
      return sendError(res, 'Team identifier is missing from request.', 400);
    }

    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Team not found.', 404);
    }

    if (!isTeamMember(team, userId)) {
      return sendError(res, 'Access denied. You do not belong to this team.', 403);
    }

    req.team = team;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireTeamOwner = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const teamId = req.params.id;

    if (!teamId) {
      return sendError(res, 'Team identifier is missing from request.', 400);
    }

    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Team not found.', 404);
    }

    if (!isTeamOwner(team, userId)) {
      return sendError(res, 'Access denied. Only the team owner can perform this action.', 403);
    }

    req.team = team;
    return next();
  } catch (error) {
    return next(error);
  }
};
