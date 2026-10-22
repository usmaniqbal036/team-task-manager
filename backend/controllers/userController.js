import { DataStore } from '../services/dataStore.js';
import { sendSuccess } from '../utils/responseHandler.js';
import { toId } from '../utils/access.js';

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
          taskCount: tasks.filter((tk) => toId(tk.team) === tm.id).length,
        })),
      },
      'Dashboard stats calculated successfully.'
    );
  } catch (error) {
    return next(error);
  }
};

// Due-date reminders shown once after login: the user's own open tasks that are
// overdue or due within the next REMINDER_WINDOW_DAYS days.
const REMINDER_WINDOW_DAYS = 3;

export const getReminders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await DataStore.getTasks({ userId, assigneeId: userId });

    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const toReminder = (t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      team: t.team ? { id: t.team.id, name: t.team.name } : null,
    });
    const byDueDate = (a, b) => new Date(a.dueDate) - new Date(b.dueDate);

    const open = tasks.filter((t) => t.status !== 'Completed' && t.dueDate);
    const overdue = open.filter((t) => new Date(t.dueDate) < now).sort(byDueDate).map(toReminder);
    const dueSoon = open
      .filter((t) => new Date(t.dueDate) >= now && new Date(t.dueDate) <= windowEnd)
      .sort(byDueDate)
      .map(toReminder);

    return sendSuccess(res, { overdue, dueSoon, windowDays: REMINDER_WINDOW_DAYS }, 'Reminders retrieved.');
  } catch (error) {
    return next(error);
  }
};
