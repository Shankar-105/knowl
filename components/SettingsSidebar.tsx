'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, LogOut, User, Mail, ExternalLink, ChevronRight } from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';

interface SettingsSidebarProps {
  show: boolean;
  onClose: () => void;
}

const SettingsSidebar = ({ show, onClose }: SettingsSidebarProps) => {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop - solid blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar - fully opaque */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0, transition: { type: "spring", damping: 28, stiffness: 220 } }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-[320px] z-[101] flex flex-col"
            style={{ background: 'var(--settings-bg, #ffffff)' }}
          >
            {/* Inner wrapper handles dark/light properly */}
            <div className="h-full flex flex-col bg-white dark:bg-[#111111] border-l border-gray-200 dark:border-white/10 shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#111111]">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Settings size={16} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Account</span>
                </div>
                <button
                  onClick={onClose}
                  className="size-8 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 dark:text-gray-200 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* User Info Card */}
              <div className="p-5 bg-white dark:bg-[#111111]">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      className="size-14 rounded-xl object-cover border-2 border-white dark:border-white/20 shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="size-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                      <User size={24} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-100 flex items-center gap-1 mt-1 truncate">
                      <Mail size={10} />
                      {user?.primaryEmailAddress?.emailAddress || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="px-5 space-y-2 bg-white dark:bg-[#111111] flex-1">
                <button
                  onClick={() => { openUserProfile(); onClose(); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                      <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Manage Account</span>
                  </div>
                  <ExternalLink size={13} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              </div>

              {/* Sign Out Footer */}
              <div className="p-5 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#111111]">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-3 h-11 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsSidebar;
