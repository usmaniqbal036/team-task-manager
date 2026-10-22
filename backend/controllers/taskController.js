import { DataStore } from '../services/dataStore.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { isTeamMember, isTeamOwner, toId } from '../utils/access.js';

export const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { teamId, assigneeId, status, priority, search } = req.query;

    const tasks = await DataStore.getTasks({
      userId,
      teamId,
      assigneeId,
      status,
      priority,
      search,
    });

    return sendSuccess(res, tasks, 'Tasks retrieved successfully.');
  } catch (error) {
    return next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await DataStore.getTaskById(taskId);
    if (!task) {
      return sendError(res, 'Task not found.', 404);
    }

    const teamId = toId(task.team);
    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Associated team not found.', 404);
    }

    if (!isTeamMember(team, userId)) {
      return sendError(res, 'Access denied. You do not have permission to view this task.', 403);
    }

    return sendSuccess(res, task, 'Task details retrieved.');
  } catch (error) {
    return next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, team: teamId, assignedTo, status, priority, dueDate } = req.body;

    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Specified team does not exist.', 404);
    }

    // Verify current user is a team member or owner
    if (!isTeamMember(team, userId)) {
      return sendError(
        res,
        'Access denied. You cannot create tasks for a team you are not part of.',
        403
      );
    }

    // Verify assignee belongs to this team if provided
    if (assignedTo) {
      if (!isTeamMember(team, assignedTo)) {
        return sendError(
          res,
          'Validation failed: Assigned user is not a member of this team.',
          400,
          {
            assignedTo: 'The assigned user does not belong to this team.',
          }
        );
      }
    }

    const newTask = await DataStore.createTask({
      title,
      description,
      teamId,
      assignedToId: assignedTo || null,
      createdById: userId,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    return sendSuccess(res, newTask, 'Task created successfully.', 201);
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await DataStore.getTaskById(taskId);
    if (!task) {
      return sendError(res, 'Task not found.', 404);
    }

    const teamId = toId(task.team);
    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Associated team not found.', 404);
    }

    // Check user membership
    if (!isTeamMember(team, userId)) {
      return sendError(res, 'Access denied. You do not belong to this team.', 403);
    }

    // If new assignee is passed, verify assignee is in the team
    if (req.body.assignedTo) {
      if (!isTeamMember(team, req.body.assignedTo)) {
        return sendError(
          res,
          'Validation failed: Assigned user is not a member of this team.',
          400,
          {
            assignedTo: 'The assigned user does not belong to this team.',
          }
        );
      }
    }

    const updatedTask = await DataStore.updateTask(taskId, {
      title: req.body.title,
      description: req.body.description,
      assignedToId: req.body.assignedTo !== undefined ? req.body.assignedTo : undefined,
      status: req.body.status,
      priority: req.body.priority,
      dueDate:
        req.body.dueDate !== undefined
          ? req.body.dueDate
            ? new Date(req.body.dueDate)
            : null
          : undefined,
    });

    return sendSuccess(res, updatedTask, 'Task updated successfully.');
  } catch (error) {
    return next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;

    const task = await DataStore.getTaskById(taskId);
    if (!task) {
      return sendError(res, 'Task not found.', 404);
    }

    const teamId = toId(task.team);
    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Associated team not found.', 404);
    }

    if (!isTeamMember(team, userId)) {
      return sendError(res, 'Access denied. You do not belong to this team.', 403);
    }

    const updatedTask = await DataStore.updateTask(taskId, { status });
    return sendSuccess(res, updatedTask, `Task status changed to ${status}.`);
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await DataStore.getTaskById(taskId);
    if (!task) {
      return sendError(res, 'Task not found.', 404);
    }

    const teamId = toId(task.team);
    const team = await DataStore.getTeamById(teamId);
    if (!team) {
      return sendError(res, 'Associated team not found.', 404);
    }

    const creatorId = toId(task.createdBy);

    // Delete permission: Only team owner or task creator can delete
    if (!isTeamOwner(team, userId) && userId !== creatorId) {
      return sendError(
        res,
        'Access denied. Only the team owner or task creator can delete this task.',
        403
      );
    }

    await DataStore.deleteTask(taskId);
    return sendSuccess(res, { id: taskId }, 'Task deleted successfully.');
  } catch (error) {
    return next(error);
  }
};
