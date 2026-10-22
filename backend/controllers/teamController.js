import { DataStore } from '../services/dataStore.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getTeamMemberIds, isTeamMember, isTeamOwner } from '../utils/access.js';

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

    if (!isTeamMember(team, userId)) {
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

    if (!isTeamOwner(team, userId)) {
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

    if (!isTeamOwner(team, currentUserId)) {
      return sendError(res, 'Access denied. Only the team owner can invite members.', 403);
    }

    let targetUser = null;
    if (userId) {
      targetUser = await DataStore.findUserById(userId);
    } else if (email) {
      targetUser = await DataStore.findUserByEmail(email);
    }

    if (!targetUser && email) {
      const cleanEmail = email.toLowerCase().trim();
      if ((team.pendingInvites || []).some((i) => i.email === cleanEmail)) {
        return sendError(res, 'An invitation has already been sent to this email address.', 409);
      }
      const invitedTeam = await DataStore.addPendingInvite(teamId, cleanEmail, currentUserId);
      console.log(`[Invite:stub] Would email ${cleanEmail} an invitation to join "${team.name}".`);
      return sendSuccess(
        res,
        invitedTeam,
        `Invitation recorded for ${cleanEmail}. They will join automatically once they register.`,
        202
      );
    }

    if (!targetUser) {
      return sendError(res, 'No registered user found with the provided details.', 404, {
        member: 'User not found. Ensure the user has registered first.',
      });
    }

    if (getTeamMemberIds(team).includes(targetUser.id)) {
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

    if (isTeamOwner(team, targetUserId)) {
      return sendError(res, 'The team owner cannot be removed from the team.', 400);
    }

    if (!isTeamOwner(team, currentUserId) && currentUserId !== targetUserId) {
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

    if (!isTeamOwner(team, currentUserId)) {
      return sendError(res, 'Access denied. Only the team owner can delete this team.', 403);
    }

    await DataStore.deleteTeam(teamId);
    return sendSuccess(res, { id: teamId }, 'Team and associated tasks deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
