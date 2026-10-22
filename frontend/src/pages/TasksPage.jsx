import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, CheckSquare, LayoutGrid, List } from 'lucide-react';
import { taskService } from '../services/taskService.js';
import { teamService } from '../services/teamService.js';
import { useToast } from '../hooks/useToast.js';
import { useAuth } from '../hooks/useAuth.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { TaskTable } from '../components/tasks/TaskTable.jsx';
import { TaskKanban } from '../components/tasks/TaskKanban.jsx';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal.jsx';
import { EditTaskModal } from '../components/tasks/EditTaskModal.jsx';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const TasksPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { refreshTrigger, openCreateTask } = useOutletContext();

  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskInitialStatus, setTaskInitialStatus] = useState('To Do');

  const loadData = useCallback(async () => {
    try {
      const [tasksData, teamsData] = await Promise.all([
        taskService.getTasks(),
        teamService.getTeams(),
      ]);
      setTasks(tasksData);
      setTeams(teamsData);
    } catch (err) {
      toast.error('Failed to load tasks', err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskService.updateStatus(task.id, newStatus);
      toast.success('Status updated', `Task moved to ${newStatus}`);
      loadData();
      if (selectedTask?.id === task.id) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      toast.error('Failed to change status', err.message);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await taskService.deleteTask(taskToDelete.id);
      toast.success('Task deleted', `"${taskToDelete.title}" was removed.`);
      setTaskToDelete(null);
      loadData();
    } catch (err) {
      toast.error('Failed to delete task', err.message);
    }
  };

  const allAssigneesMap = new Map();
  teams.forEach((t) => {
    (t.members || []).forEach((m) => {
      allAssigneesMap.set(m.id, m.name);
    });
  });

  const filteredTasks = tasks.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (teamFilter !== 'all') {
      const tid = typeof t.team === 'object' ? t.team.id : t.team;
      if (tid !== teamFilter) return false;
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'me') {
        if (t.assignedTo?.id !== user?.id) return false;
      } else if (assigneeFilter === 'unassigned') {
        if (t.assignedTo) return false;
      } else if (t.assignedTo?.id !== assigneeFilter) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Task Central</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse, prioritize, and track task deliveries across all your teams
          </p>
        </div>

        <button
          onClick={() => {
            setTaskInitialStatus('To Do');
            setCreateTaskOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Teams</option>
            {teams.map((tm) => (
              <option key={tm.id} value={tm.id}>
                {tm.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
            {Array.from(allAssigneesMap.entries()).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-end md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table List</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading tasks..." className="h-64" />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={
            search || teamFilter !== 'all' || statusFilter !== 'all'
              ? 'No matching tasks'
              : 'No tasks created yet'
          }
          description={
            search || teamFilter !== 'all' || statusFilter !== 'all'
              ? 'Try modifying your search keywords or filter criteria.'
              : 'Add milestones and tasks to assign to your team members.'
          }
          actionText="+ Create Task"
          onAction={() => {
            setTaskInitialStatus('To Do');
            setCreateTaskOpen(true);
          }}
        />
      ) : viewMode === 'kanban' ? (
        <TaskKanban
          tasks={filteredTasks}
          onSelectTask={(t) => setSelectedTask(t)}
          onStatusChange={handleStatusChange}
          onAddTaskToColumn={(colStatus) => {
            setTaskInitialStatus(colStatus);
            setCreateTaskOpen(true);
          }}
        />
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onSelectTask={(t) => setSelectedTask(t)}
          onEditTask={(t) => setTaskToEdit(t)}
          onDeleteTask={(t) => setTaskToDelete(t)}
          onStatusChange={handleStatusChange}
        />
      )}

      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        initialStatus={taskInitialStatus}
        onCreated={() => loadData()}
      />

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
        onUpdated={() => loadData()}
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
    </div>
  );
};
