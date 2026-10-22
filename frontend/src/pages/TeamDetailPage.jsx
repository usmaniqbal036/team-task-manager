import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users2,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Crown,
  UserX,
  Search,
  Layers,
} from 'lucide-react';
import { teamService } from '../services/teamService.js';
import { taskService } from '../services/taskService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

import { TaskTable } from '../components/tasks/TaskTable.jsx';
import { TaskKanban } from '../components/tasks/TaskKanban.jsx';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal.jsx';
import { EditTaskModal } from '../components/tasks/EditTaskModal.jsx';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal.jsx';
import { EditTeamModal } from '../components/teams/EditTeamModal.jsx';
import { AddMemberModal } from '../components/teams/AddMemberModal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { getInitials, getAvatarColor } from '../utils/formatters.js';

export const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskInitialStatus, setTaskInitialStatus] = useState('To Do');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [deleteTeamOpen, setDeleteTeamOpen] = useState(false);

  const loadTeamAndTasks = useCallback(async () => {
    if (!id) return;
    try {
      const [teamData, tasksData] = await Promise.all([
        teamService.getTeamById(id),
        taskService.getTasks({ teamId: id }),
      ]);
      setTeam(teamData);
      setTasks(tasksData);
    } catch (err) {
      toast.error('Could not load team workspace', err.message);
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    loadTeamAndTasks();
  }, [loadTeamAndTasks]);

  if (loading) {
    return <LoadingSpinner label="Loading workspace..." className="h-64" />;
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Team workspace not found.</p>
        <button
          onClick={() => navigate('/teams')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
        >
          Back to Teams
        </button>
      </div>
    );
  }

  const isOwner = team.owner?.id === user?.id;
  const memberList = team.members || [];
  const pendingInvites = team.pendingInvites || [];

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskService.updateStatus(task.id, newStatus);
      toast.success('Status updated', `Task moved to ${newStatus}`);
      loadTeamAndTasks();
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
      loadTeamAndTasks();
    } catch (err) {
      toast.error('Failed to delete task', err.message);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await teamService.removeMember(team.id, memberToRemove.id);
      toast.success('Member removed', `${memberToRemove.name} was removed from the team.`);
      setMemberToRemove(null);
      loadTeamAndTasks();
    } catch (err) {
      toast.error('Failed to remove member', err.message);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await teamService.deleteTeam(team.id);
      toast.success('Team deleted', `"${team.name}" has been deleted.`);
      navigate('/teams');
    } catch (err) {
      toast.error('Failed to delete team', err.message);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all') {
      const aid = t.assignedTo?.id || 'unassigned';
      if (aid !== assigneeFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/teams')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Teams</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                {team.name}
              </h2>
              {isOwner && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>Owner</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {team.description || 'No description provided for this team.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <span>Owned by {team.owner?.name}</span>
              <span aria-hidden="true">·</span>
              <span>{memberList.length} members</span>
              <span aria-hidden="true">·</span>
              <span>{tasks.length} total tasks</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isOwner && (
              <>
                <button
                  onClick={() => setAddMemberOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Member</span>
                </button>
                <button
                  onClick={() => setEditTeamOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Team</span>
                </button>
                <button
                  onClick={() => setDeleteTeamOpen(true)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                  title="Delete team workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => {
                setTaskInitialStatus('To Do');
                setCreateTaskOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Team Roster ({memberList.length})
            </h3>
          </div>
          {isOwner && (
            <button
              onClick={() => setAddMemberOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              + Invite Member
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {memberList.map((m) => {
            const isMemberOwner = m.id === team.owner?.id;
            const canRemove = isOwner && !isMemberOwner;

            return (
              <div
                key={m.id}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${getAvatarColor(
                    m.name
                  )}`}
                >
                  {getInitials(m.name)}
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-slate-800 truncate block max-w-[130px]">
                    {m.name}
                  </span>
                </div>
                {isMemberOwner ? (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Lead
                  </span>
                ) : canRemove ? (
                  <button
                    onClick={() => setMemberToRemove({ id: m.id, name: m.name })}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                    title={`Remove ${m.name}`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {pendingInvites.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pending invitations ({pendingInvites.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {pendingInvites.map((invite) => (
                <span
                  key={invite.email}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  {invite.email}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[180px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {memberList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-end sm:self-center">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={
            search || statusFilter !== 'all' ? 'No matching tasks' : 'No tasks in this workspace'
          }
          description={
            search || statusFilter !== 'all'
              ? 'Try adjusting your filters or search keywords.'
              : 'Add milestones and tasks to organize your team workflow.'
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
        initialTeamId={team.id}
        initialStatus={taskInitialStatus}
        onCreated={() => loadTeamAndTasks()}
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
        onUpdated={() => loadTeamAndTasks()}
      />

      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"?`}
        confirmLabel="Delete Task"
        isDestructive={true}
      />

      <EditTeamModal
        isOpen={editTeamOpen}
        onClose={() => setEditTeamOpen(false)}
        team={team}
        onUpdated={() => loadTeamAndTasks()}
      />

      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        team={team}
        onMemberAdded={() => loadTeamAndTasks()}
      />

      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from "${team.name}"? They will lose access to team tasks.`}
        confirmLabel="Remove Member"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={deleteTeamOpen}
        onClose={() => setDeleteTeamOpen(false)}
        onConfirm={handleDeleteTeam}
        title="Delete Entire Workspace"
        message={`Are you sure you want to delete "${team.name}"? All associated tasks will be permanently removed.`}
        confirmLabel="Delete Workspace"
        isDestructive={true}
      />
    </div>
  );
};
