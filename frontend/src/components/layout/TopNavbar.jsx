import React, { useState } from 'react';
import { Menu, Plus, User, ShieldCheck, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { getInitials, getAvatarColor } from '../../utils/formatters.js';
import { Modal } from '../common/Modal.jsx';

export const TopNavbar = ({ onOpenSidebar, onOpenCreateTask, title = 'Overview' }) => {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus-visible:outline-indigo-600"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenCreateTask && (
            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600"
              aria-label="User account menu"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs ${getAvatarColor(
                  user?.name
                )}`}
              >
                {getInitials(user?.name)}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Account Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Account Profile"
        description="Your authenticated account information"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(
                user?.name
              )}`}
            >
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h4>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Session Authenticated</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">User ID</span>
              <span className="font-mono text-slate-700">{user?.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Session Cookie</span>
              <span className="font-mono text-slate-700">ttm.sid (HttpOnly)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Registered On</span>
              <span className="text-slate-700">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active session'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setShowProfileModal(false);
                logout();
              }}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
            >
              Log Out of Session
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
