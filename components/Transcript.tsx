'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Messages } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TranscriptProps {
  messages: Messages[];
  currentMessage: string;
  currentUserMessage: string;
  isTextLoading?: boolean;
  isPastThread?: boolean;
}

const Transcript = ({
  messages = [],
  currentMessage,
  currentUserMessage,
  isTextLoading,
  isPastThread,
}: TranscriptProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    try {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    } catch (_) {}
  };

  useEffect(() => {
    const timeout = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeout);
  }, [messages, currentMessage, currentUserMessage, isTextLoading]);

  const isEmpty = (messages?.length ?? 0) === 0 && !currentMessage && !currentUserMessage && !isTextLoading;

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div ref={scrollRef} className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center py-16"
          >
            <div className="size-16 bg-indigo-600/10 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-5 relative">
              <div className="absolute inset-0 bg-indigo-600/20 rounded-2xl blur-xl animate-pulse" />
              <MessageSquare size={28} className="text-indigo-600 dark:text-white relative" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-serif font-black text-[#212a3b] dark:text-white mb-2 tracking-tight">
              Describe what you need.
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-300 max-w-xs font-medium">
              Type below to chat with the AI, or connect voice on the left.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {(messages || []).map((message, index) => (
              <motion.div
                key={`${message.sessionId ?? 'new'}-${index}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={cn("flex flex-col", message.role === 'user' ? 'items-end' : 'items-start')}
              >
                <div className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white rounded-bl-sm'
                )}>
                  {message.content}
                </div>
              </motion.div>
            ))}

            {/* Voice streaming indicators */}
            {currentUserMessage && (
              <div className="flex flex-col items-end">
                <div className="bg-indigo-600 text-white max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm text-sm animate-pulse">
                  {currentUserMessage}
                </div>
              </div>
            )}
            {currentMessage && (
              <div className="flex flex-col items-start">
                <div className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm">
                  {currentMessage}
                  <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-2 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {/* Text AI thinking indicator */}
            {isTextLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-gray-100 dark:bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm text-sm flex items-center gap-2 text-gray-500 dark:text-gray-300">
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transcript;
