import { DataStore } from '../services/dataStore.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const currentUserId = req.user.id;
    const users = await DataStore.searchUsers(query, currentUserId);
    return sendSuccess(res, users, 'Users retrieved.');
  } catch (error) {
    return next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const teams = await DataStore.getTeamsForUser(userId);
    const tasks = await DataStore.getTasks({ userId });

    const totalTeams = teams.length;
    const totalTasks = tasks.length;

    let pendingTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    const now = new Date();

    const statusCounts = { 'To Do': 0, 'In Progress': 0, Completed: 0 };
    const priorityCounts = { Low: 0, Medium: 0, High: 0 };

    tasks.forEach((t) => {
      if (t.status === 'Completed') {
        completedTasks++;
      } else {
        pendingTasks++;
        if (t.dueDate && new Date(t.dueDate) < now) {
          overdueTasks++;
        }
      }

      if (statusCounts[t.status] !== undefined) {
        statusCounts[t.status]++;
      }
      if (priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    });

    const recentTasks = tasks.slice(0, 5);

    return sendSuccess(
      res,
      {
        totalTeams,
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
        statusCounts,
        priorityCounts,
        recentTasks,
        teamsSummary: teams.map((tm) => ({
          id: tm.id,
          name: tm.name,
          memberCount: (tm.members || []).length,
          taskCount: tasks.filter((tk) => {
            const teamId = typeof tk.team === 'object' ? tk.team.id : tk.team;
            return teamId === tm.id;
          }).length,
        })),
      },
      'Dashboard stats calculated successfully.'
    );
  } catch (error) {
    return next(error);
  }
};
