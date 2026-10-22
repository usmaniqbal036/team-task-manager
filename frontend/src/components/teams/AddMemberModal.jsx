import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { teamService } from '../../services/teamService.js';
import { authService } from '../../services/authService.js';
import { useToast } from '../../hooks/useToast.js';
import { getInitials, getAvatarColor } from '../../utils/formatters.js';

export const AddMemberModal = ({ isOpen, onClose, team, onMemberAdded }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submittingUserId, setSubmittingUserId] = useState(null);
  const [directEmail, setDirectEmail] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSearchResults([]);
      setDirectEmail('');
      return;
    }
    const fetchInitial = async () => {
      setLoadingSearch(true);
      try {
        const users = await authService.searchUsers('');
        setSearchResults(users);
      } catch {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    };
    fetchInitial();
  }, [isOpen]);

  const handleSearch = async (val) => {
    setQuery(val);
    setLoadingSearch(true);
    try {
      const users = await authService.searchUsers(val);
      setSearchResults(users);
    } catch {
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  if (!team) return null;

  const currentMemberIds = new Set((team.members || []).map((m) => m.id));
  const isOwner = (userId) => team.owner?.id === userId;

  const handleAddMember = async (userId, userName) => {
    setSubmittingUserId(userId);
    try {
      const updated = await teamService.addMember(team.id, { userId });
      toast.success('Member added', `${userName} is now part of ${team.name}.`);
      onMemberAdded(updated);
      onClose();
    } catch (err) {
      toast.error('Failed to add member', err.message || 'Please try again.');
    } finally {
      setSubmittingUserId(null);
    }
  };

  const handleAddByEmail = async (e) => {
    e.preventDefault();
    if (!directEmail.trim()) return;

    setSubmittingUserId('email');
    try {
      const email = directEmail.trim();
      const updated = await teamService.addMember(team.id, { email });
      const wasInvited = (updated.pendingInvites || []).some(
        (invite) => invite.email === email.toLowerCase()
      );
      if (wasInvited) {
        toast.info('Invitation recorded', `${email} will join ${team.name} once they register.`);
      } else {
        toast.success('Member added', `${email} was added to ${team.name}.`);
      }
      onMemberAdded(updated);
      onClose();
    } catch (err) {
      toast.error('Failed to add member', err.message || 'Please verify the email.');
    } finally {
      setSubmittingUserId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Member to ${team.name}`}
      description="Add registered colleagues, or invite anyone by email. Invitees join when they register."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Search Registered Users
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-slate-100">
          {loadingSearch ? (
            <div className="p-4 text-center text-xs text-slate-500">Searching directory...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching users found. Try searching or enter an exact email below.
            </div>
          ) : (
            searchResults.map((usr) => {
              const alreadyMember = currentMemberIds.has(usr.id);
              const isTeamOwner = isOwner(usr.id);

              return (
                <div
                  key={usr.id}
                  className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarColor(
                        usr.name
                      )}`}
                    >
                      {getInitials(usr.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{usr.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{usr.email}</p>
                    </div>
                  </div>

                  {isTeamOwner ? (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Owner
                    </span>
                  ) : alreadyMember ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Check className="w-3 h-3" />
                      <span>Member</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddMember(usr.id, usr.name)}
                      disabled={submittingUserId === usr.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{submittingUserId === usr.id ? 'Adding...' : 'Add'}</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleAddByEmail} className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Or Add by Exact Email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="colleague@example.com"
              value={directEmail}
              onChange={(e) => setDirectEmail(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!directEmail.trim() || submittingUserId === 'email'}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
            >
              {submittingUserId === 'email' ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
