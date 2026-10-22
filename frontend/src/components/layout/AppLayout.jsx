import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { TopNavbar } from './TopNavbar.jsx';
import { CreateTaskModal } from '../tasks/CreateTaskModal.jsx';
import { ReminderModal } from '../common/ReminderModal.jsx';
import { authService } from '../../services/authService.js';
import { REMINDERS_SEEN_KEY } from '../../utils/storageKeys.js';


export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [reminders, setReminders] = useState(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem(REMINDERS_SEEN_KEY)) return;
    let cancelled = false;
    authService
      .getReminders()
      .then((data) => {
        if (cancelled) return;
        sessionStorage.setItem(REMINDERS_SEEN_KEY, '1');
        if (data.overdue.length || data.dueSoon.length) {
          setReminders(data);
          setReminderOpen(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/teams/')) return 'Team Workspace';
    switch (pathname) {
      case '/dashboard':
        return 'Executive Dashboard';
      case '/teams':
        return 'Team Directory';
      case '/tasks':
        return 'Task Management';
      case '/docs':
        return 'Architecture & Assessment Docs';
      default:
        return 'Workspace';
    }
  };

  const handleTaskCreated = () => {
    setCreateTaskModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopNavbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCreateTask={() => setCreateTaskModalOpen(true)}
          title={getPageTitle(location.pathname)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{ refreshTrigger, openCreateTask: () => setCreateTaskModalOpen(true) }}
          />
        </main>
      </div>

      <ReminderModal
        isOpen={reminderOpen}
        onClose={() => setReminderOpen(false)}
        reminders={reminders}
      />

      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onCreated={handleTaskCreated}
      />
    </div>
  );
};
