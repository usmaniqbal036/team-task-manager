import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, UserPlus, Trash2, Crown, ArrowRight } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth.js';
import { getInitials, getAvatarColor } from '../../utils/formatters.js';

export const TeamCard = ({ team, onEdit, onAddMember, onDelete, taskCount = 0 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isOwner = team.owner?.id === user?.id;
  const memberList = team.members || [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                onClick={() => navigate(`/teams/${team.id}`)}
                className="text-base font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer truncate"
              >
                {team.name}
              </h3>
              {isOwner && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>Owner</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>
                {memberList.length} {memberList.length === 1 ? 'member' : 'members'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </span>
              <span aria-hidden="true">·</span>
              <span>Led by {team.owner?.name || 'Owner'}</span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600"
              aria-label="Team actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(`/teams/${team.id}`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Workspace</span>
                  </button>

                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onAddMember(team);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                        <span>Add Member</span>
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(team);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit Settings</span>
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(team);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Delete Team</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed min-h-[32px]">
          {team.description || 'No description provided for this team workspace.'}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex -space-x-1.5 overflow-hidden py-1">
          {memberList.slice(0, 5).map((m, idx) => (
            <div
              key={m.id || idx}
              title={m.name}
              className={`inline-block w-7 h-7 rounded-full ring-2 ring-white flex items-center justify-center font-bold text-[10px] ${getAvatarColor(
                m.name
              )}`}
            >
              {getInitials(m.name)}
            </div>
          ))}
          {memberList.length > 5 && (
            <div className="w-7 h-7 rounded-full ring-2 ring-white bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-semibold">
              +{memberList.length - 5}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(`/teams/${team.id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
