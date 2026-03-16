import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Clock, Plus, Pencil, Trash2, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HistorySidebarProps {
  show: boolean;
  onClose: () => void;
  threadArchive: { threadId: string; timestamp: Date; title: string }[];
  selectedThreadId?: string | null;
  onSelectThread: (threadId: string | null) => void;
  onDeleteThread: (threadId: string) => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  onNewChat: () => void;
}

const HistorySidebar = ({
  show, onClose, threadArchive, selectedThreadId,
  onSelectThread, onDeleteThread, onRenameThread, onNewChat
}: HistorySidebarProps) => {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  const startRename = (threadId: string, currentTitle: string) => {
    setDeletingThreadId(null);
    setEditingThreadId(threadId);
    setEditValue(currentTitle);
  };

  const handleRename = (threadId: string) => {
    if (editValue.trim()) onRenameThread(threadId, editValue.trim());
    setEditingThreadId(null);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0, transition: { type: 'spring', damping: 26, stiffness: 160 } }}
            exit={{ opacity: 0, x: 380 }}
            className="fixed top-0 right-0 h-full w-[380px] z-[110] flex flex-col"
          >
            <div className="h-full flex flex-col bg-white dark:bg-[#111] border-l border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#111] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                    <History size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Past Threads</span>
                    <p className="text-[10px] text-gray-400">{threadArchive.length} threads</p>
                  </div>
                </div>
                <button onClick={onClose} className="size-8 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 dark:text-gray-300 transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Thread List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24 bg-gray-50 dark:bg-[#0d0d0d]">
                {threadArchive.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-8 py-20">
                    <Clock size={36} className="mb-3 text-gray-400 dark:text-gray-200" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-200 uppercase tracking-widest">No past threads yet</p>
                  </div>
                ) : (
                  threadArchive.map((thread) => (
                    <div key={thread.threadId} className="relative">
                      {/* Delete Confirmation — rendered as modal overlay on the card, with enough height */}
                      <AnimatePresence>
                        {deletingThreadId === thread.threadId && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="absolute inset-0 z-20 bg-white dark:bg-[#1c1c1e] rounded-2xl border-2 border-red-300 dark:border-red-800 shadow-2xl flex flex-col items-center justify-center gap-3 p-5 min-h-[100px]"
                          >
                            <div className="size-9 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                              <AlertTriangle size={18} className="text-red-500" />
                            </div>
                            <p className="text-xs font-bold text-gray-800 dark:text-white text-center leading-snug">
                              Delete this thread forever?
                            </p>
                            <div className="flex gap-2 w-full">
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeletingThreadId(null); }}
                                className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all border border-gray-200 dark:border-white/10"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteThread(thread.threadId); setDeletingThreadId(null); }}
                                className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Thread Card */}
                      <div
                        onClick={() => { if (deletingThreadId !== thread.threadId && !editingThreadId) onSelectThread(thread.threadId); }}
                        className={cn(
                          "group/item w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer min-h-[80px]",
                          selectedThreadId === thread.threadId
                            ? "bg-indigo-600 border-transparent shadow-lg shadow-indigo-500/20"
                            : "bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                        )}
                      >
                        {/* Top Row: status dot + date */}
                        <div className="flex items-center justify-between">
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider", selectedThreadId === thread.threadId ? "text-white/60" : "text-gray-400 dark:text-gray-300")}>
                            Thread
                          </span>
                          <span className={cn("text-[9px] font-medium", selectedThreadId === thread.threadId ? "text-white/50" : "text-gray-400 dark:text-gray-400")}>
                            {thread.timestamp?.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Title or Edit Input */}
                        {editingThreadId === thread.threadId ? (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleRename(thread.threadId); if (e.key === 'Escape') setEditingThreadId(null); }}
                              className={cn(
                                "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none ring-2 ring-indigo-400",
                                selectedThreadId === thread.threadId
                                  ? "bg-white/20 text-white placeholder-white/50"
                                  : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                              )}
                              placeholder="Thread name..."
                            />
                            <button onClick={() => handleRename(thread.threadId)} className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-white flex-shrink-0">
                              <Check size={13} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <p className={cn("text-sm font-medium line-clamp-1 pr-14", selectedThreadId === thread.threadId ? "text-white" : "text-gray-800 dark:text-gray-100")}>
                            {thread.title}
                          </p>
                        )}

                        {/* Action Buttons */}
                        {!editingThreadId && deletingThreadId !== thread.threadId && (
                          <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); startRename(thread.threadId, thread.title); }}
                              className={cn(
                                "p-1.5 rounded-lg transition-all",
                                selectedThreadId === thread.threadId
                                  ? "bg-white/20 text-white hover:bg-white/30"
                                  : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 border border-gray-200 dark:border-white/10"
                              )}
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingThreadId(thread.threadId); }}
                              className={cn(
                                "p-1.5 rounded-lg transition-all",
                                selectedThreadId === thread.threadId
                                  ? "bg-white/20 text-white hover:bg-red-400"
                                  : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 border border-gray-200 dark:border-white/10"
                              )}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* New Chat Button */}
              <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#111] shrink-0">
                <button
                  onClick={onNewChat}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={16} strokeWidth={3} /> New Thread
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;
