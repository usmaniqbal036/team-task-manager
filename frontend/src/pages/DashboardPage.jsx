import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Users2, CheckCircle2, AlertTriangle, Plus, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/authService.js';
import { taskService } from '../services/taskService.js';

import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { PriorityBadge } from '../components/common/Badge.jsx';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal.jsx';
import { EditTaskModal } from '../components/tasks/EditTaskModal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { CreateTeamModal } from '../components/teams/CreateTeamModal.jsx';
import { formatRelativeTime, isOverdue } from '../utils/dateUtils.js';
import { useToast } from '../hooks/useToast.js';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const toastRef = useRef(toast);
  const { refreshTrigger, openCreateTask } = useOutletContext();

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      return await authService.getDashboardStats();
    } catch (err) {
      toastRef.current.error('Could not load dashboard stats', err.message);
      return null;
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const data = await fetchStats();
    if (data) setStats(data);
    setLoading(false);
  }, [fetchStats]);

  useEffect(() => {
    let ignore = false;
    fetchStats().then((data) => {
      if (ignore) return;
      if (data) setStats(data);
      setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, [fetchStats, refreshTrigger]);

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskService.updateStatus(task.id, newStatus);
      toastRef.current.success('Status updated', `Task "${task.title}" is now ${newStatus}`);
      fetchDashboardData();
      if (selectedTask?.id === task.id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      toastRef.current.error('Failed to change status', err.message);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await taskService.deleteTask(taskToDelete.id);
      toastRef.current.success('Task deleted', `"${taskToDelete.title}" was removed.`);
      setTaskToDelete(null);
      fetchDashboardData();
    } catch (err) {
      toastRef.current.error('Failed to delete task', err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Calculating workspace metrics..." className="h-64" />;
  }

  const statCards = [
    {
      title: 'Total Teams',
      value: stats?.totalTeams || 0,
      icon: Users2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Active workspaces you lead or collaborate in',
    },
    {
      title: 'Active Tasks',
      value: stats?.pendingTasks || 0,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${stats?.statusCounts?.['To Do'] || 0} to do · ${stats?.statusCounts?.['In Progress'] || 0} in progress`,
    },
    {
      title: 'Completed',
      value: stats?.completedTasks || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: `${stats?.totalTasks ? Math.round(((stats.completedTasks || 0) / stats.totalTasks) * 100) : 0}% completion rate`,
    },
    {
      title: 'Overdue Milestones',
      value: stats?.overdueTasks || 0,
      icon: AlertTriangle,
      color: stats?.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-500',
      bgColor: stats?.overdueTasks > 0 ? 'bg-rose-50' : 'bg-slate-50',
      description:
        stats?.overdueTasks > 0 ? 'Requires immediate attention' : 'All deadlines on track',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Here is your executive team workspace summary across all connected projects.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateTeamOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Users2 className="w-4 h-4 text-slate-500" />
            <span>Create Team</span>
          </button>
          <button
            onClick={openCreateTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {stats?.overdueTasks > 0 && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-rose-900">
                {stats.overdueTasks} {stats.overdueTasks === 1 ? 'task has' : 'tasks have'} passed
                the scheduled deadline
              </p>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Review assigned team members and update target due dates or milestones.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="font-semibold text-rose-800 underline hover:text-rose-950 text-xs shrink-0"
          >
            View Tasks
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">{card.title}</span>
                <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 block">
                  {card.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-lg ${card.bgColor} ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Tasks</h3>
              <p className="text-xs text-slate-500">Latest updates across your active teams</p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!stats?.recentTasks || stats.recentTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No tasks created yet. Click "+ New Task" above to start.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                          {task.title}
                        </h4>
                        <PriorityBadge priority={task.priority} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{task.team?.name || 'General'}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {task.assignedTo?.name
                            ? `Assigned to ${task.assignedTo.name}`
                            : 'Unassigned'}
                        </span>
                        {task.dueDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className={overdue ? 'text-rose-600 font-medium' : ''}>
                              {formatRelativeTime(task.dueDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        className="text-[11px] font-medium py-1 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Teams Overview</h3>
                <p className="text-xs text-slate-500">Workspaces & membership</p>
              </div>
              <button
                onClick={() => navigate('/teams')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {!stats?.teamsSummary || stats.teamsSummary.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No teams found. Create your first team to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.teamsSummary.map((tm) => (
                  <div
                    key={tm.id}
                    onClick={() => navigate(`/teams/${tm.id}`)}
                    className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{tm.name}</h4>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>
                        {tm.memberCount} {tm.memberCount === 1 ? 'member' : 'members'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {tm.taskCount} {tm.taskCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => setCreateTeamOpen(true)}
              className="w-full py-2 px-3 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      </div>

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onEdit={(t) => {
          setSelectedTask(null);
          setTaskToEdit(t);
        }}
        onDelete={(t) => {
          setSelectedTask(null);
          setTaskToDelete(t);
        }}
        onStatusChange={handleStatusChange}
      />

      <EditTaskModal
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        task={taskToEdit}
        onUpdated={() => {
          setTaskToEdit(null);
          fetchDashboardData();
        }}
      />

      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isDestructive={true}
      />

      <CreateTeamModal
        isOpen={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        onCreated={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};