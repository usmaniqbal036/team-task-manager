import { DataStore } from '../services/dataStore.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getTeams = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const teams = await DataStore.getTeamsForUser(userId);
    return sendSuccess(res, teams, 'Teams retrieved successfully.');
  } catch (error) {
    return next(error);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    const newTeam = await DataStore.createTeam(name, description, userId);
    return sendSuccess(res, newTeam, 'Team created successfully.', 201);
  } catch (error) {
    return next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const userId = req.user.id;

    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Team not found.', 404);
    }

  
    const ownerId = typeof team.owner === 'object' ? team.owner.id : team.owner;
    const memberIds = (team.members || []).map((m) => (typeof m === 'object' ? m.id : m));

    if (ownerId !== userId && !memberIds.includes(userId)) {
      return sendError(res, 'Access denied. You do not belong to this team.', 403);
    }

    return sendSuccess(res, team, 'Team details retrieved.');
  } catch (error) {
    return next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const userId = req.user.id;

    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Team not found.', 404);
    }

    const ownerId = typeof team.owner === 'object' ? team.owner.id : team.owner;
    if (ownerId !== userId) {
      return sendError(res, 'Access denied. Only the team owner can edit team details.', 403);
    }

    const updated = await DataStore.updateTeam(teamId, {
      name: req.body.name,
      description: req.body.description,
    });

    return sendSuccess(res, updated, 'Team updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const currentUserId = req.user.id;
    const { email, userId } = req.body;

    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Team not found.', 404);
    }

    const ownerId = typeof team.owner === 'object' ? team.owner.id : team.owner;
    if (ownerId !== currentUserId) {
      return sendError(res, 'Access denied. Only the team owner can invite members.', 403);
    }

    let targetUser = null;
    if (userId) {
      targetUser = await DataStore.findUserById(userId);
    } else if (email) {
      targetUser = await DataStore.findUserByEmail(email);
    }

    if (!targetUser) {
      return sendError(res, 'No registered user found with the provided details.', 404, {
        member: 'User not found. Ensure the user has registered first.',
      });
    }

    const existingMemberIds = (team.members || []).map((m) => (typeof m === 'object' ? m.id : m));
    if (existingMemberIds.includes(targetUser.id)) {
      return sendError(res, 'User is already a member of this team.', 409);
    }

    const updatedTeam = await DataStore.addMemberToTeam(teamId, targetUser.id);
    return sendSuccess(res, updatedTeam, `${targetUser.name} added to the team.`);
  } catch (error) {
    return next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Team not found.', 404);
    }

    const ownerId = typeof team.owner === 'object' ? team.owner.id : team.owner;

  
    if (targetUserId === ownerId) {
      return sendError(res, 'The team owner cannot be removed from the team.', 400);
    }

    if (currentUserId !== ownerId && currentUserId !== targetUserId) {
      return sendError(
        res,
        'Access denied. You do not have permission to remove this member.',
        403
      );
    }

    const updatedTeam = await DataStore.removeMemberFromTeam(teamId, targetUserId);
    return sendSuccess(res, updatedTeam, 'Member removed from team.');
  } catch (error) {
    return next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const currentUserId = req.user.id;

    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Team not found.', 404);
    }

    const ownerId = typeof team.owner === 'object' ? team.owner.id : team.owner;
    if (ownerId !== currentUserId) {
      return sendError(res, 'Access denied. Only the team owner can delete this team.', 403);
    }

    await DataStore.deleteTeam(teamId);
    return sendSuccess(res, { id: teamId }, 'Team and associated tasks deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
