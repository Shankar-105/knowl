'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'danger'
}: ConfirmationModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden outline-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`size-14 rounded-2xl flex items-center justify-center ${
                  variant === 'danger' ? 'bg-red-50 dark:bg-red-500/20 text-red-600' :
                  variant === 'warning' ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-600' :
                  'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600'
                }`}>
                  <AlertCircle size={28} />
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all group"
                >
                  <X size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                </button>
              </div>
              
              <h3 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
              <p className="text-gray-500 dark:text-gray-200 leading-relaxed font-medium">{message}</p>
            </div>
            
            <div className="p-8 bg-gray-50/50 dark:bg-white/[0.02] flex gap-4 border-t border-black/5 dark:border-white/5">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98] shadow-xl ${
                  variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                  variant === 'warning' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20' :
                  'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
