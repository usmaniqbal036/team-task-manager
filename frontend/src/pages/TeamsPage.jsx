import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Users2 } from 'lucide-react';
import { teamService } from '../services/teamService.js';
import { taskService } from '../services/taskService.js';
import { TeamCard } from '../components/teams/TeamCard.jsx';
import { CreateTeamModal } from '../components/teams/CreateTeamModal.jsx';
import { EditTeamModal } from '../components/teams/EditTeamModal.jsx';
import { AddMemberModal } from '../components/teams/AddMemberModal.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { useToast } from '../hooks/useToast.js';

export const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [memberTargetTeam, setMemberTargetTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [teamsData, tasksData] = await Promise.all([
        teamService.getTeams(),
        taskService.getTasks(),
      ]);
      setTeams(teamsData);
      setTasks(tasksData);
    } catch (err) {
      toast.error('Could not load teams', err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;
    setSubmittingDelete(true);
    try {
      await teamService.deleteTeam(deletingTeam.id);
      toast.success('Team deleted', `"${deletingTeam.name}" has been removed.`);
      setDeletingTeam(null);
      loadData();
    } catch (err) {
      toast.error('Failed to delete team', err.message);
    } finally {
      setSubmittingDelete(false);
    }
  };

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.owner?.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Team Workspaces</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your departmental groups, member rosters, and permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading team workspaces..." className="h-64" />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={Users2}
          title={searchQuery ? 'No matching teams' : 'No teams found'}
          description={
            searchQuery
              ? `No teams matched "${searchQuery}". Try modifying your search term.`
              : 'Create a team workspace to begin assigning tasks and collaborating with colleagues.'
          }
          actionText={searchQuery ? 'Clear Search' : 'Create First Team'}
          onAction={searchQuery ? () => setSearchQuery('') : () => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => {
            const teamTaskCount = tasks.filter((t) => {
              const tid = typeof t.team === 'object' ? t.team.id : t.team;
              return tid === team.id;
            }).length;

            return (
              <TeamCard
                key={team.id}
                team={team}
                taskCount={teamTaskCount}
                onEdit={(t) => setEditingTeam(t)}
                onAddMember={(t) => setMemberTargetTeam(t)}
                onDelete={(t) => setDeletingTeam(t)}
              />
            );
          })}
        </div>
      )}

      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => loadData()}
      />

      <EditTeamModal
        isOpen={!!editingTeam}
        onClose={() => setEditingTeam(null)}
        team={editingTeam}
        onUpdated={() => loadData()}
      />

      <AddMemberModal
        isOpen={!!memberTargetTeam}
        onClose={() => setMemberTargetTeam(null)}
        team={memberTargetTeam}
        onMemberAdded={() => loadData()}
      />

      <ConfirmDialog
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onConfirm={handleDeleteTeam}
        title="Delete Team Workspace"
        message={`Are you sure you want to delete "${deletingTeam?.name}"? All tasks created under this team will also be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete Team & Tasks"
        isDestructive={true}
        loading={submittingDelete}
      />
    </div>
  );
};
