'use client';

import { Mic, MicOff, Send, Plus, History, ChevronRight, UserCircle } from "lucide-react";
import useVapi from "@/hooks/useVapi";
import { IBook } from "@/types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Transcript from "@/components/Transcript";
import HistorySidebar from "@/components/HistorySidebar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { voiceOptions } from "@/lib/constants";

const VapiControls = ({ book, voiceId }: { book: IBook, voiceId: string }) => {
    const {
        status, isActive, isTextLoading,
        currentViewMessages, currentMessage, currentUserMessage,
        start, stop, deleteSession, renameSession,
        clearError, limitError, isBillingError,
        sendText, startNewThread, persona, setPersona,
        threadArchive, selectedThreadId, setSelectedThreadId,
        hasArchive, setSelectedVoiceId,
    } = useVapi(book);

    const router = useRouter();
    const [textInput, setTextInput] = useState("");
    const [showHistory, setShowHistory] = useState(false);

    // KEY FIX: Sync the voiceId prop from AIFeatures into the hook's state
    // Without this, the hook's start() always uses the default voice regardless of user selection
    useEffect(() => {
        if (voiceId) {
            setSelectedVoiceId(voiceId);
        }
    }, [voiceId, setSelectedVoiceId]);

    // Resolve voice name for display
    const activeVoiceName = Object.values(voiceOptions).find(v => v.id === voiceId)?.name || 'Neural';

    const handleSendText = (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || isTextLoading) return;
        try {
            sendText(textInput);
            setTextInput("");
        } catch (_) {
            toast.error("Failed to send message.");
        }
    };

    useEffect(() => {
        if (limitError) {
            toast.error(limitError);
            const isBilling = isBillingError;
            setTimeout(() => {
                try {
                    if (isBilling) router.push("/subscriptions");
                    else router.push("/");
                    clearError();
                } catch (_) {}
            }, 0);
        }
    }, [limitError, isBillingError, router, clearError]);

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-8" suppressHydrationWarning>
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ===== LEFT: Book Info Card ===== */}
                <div className="w-full lg:w-[300px] lg:sticky lg:top-24 shrink-0">
                    <div className="bg-white dark:bg-[#111] rounded-3xl border border-black/5 dark:border-white/10 shadow-xl overflow-hidden">
                        {/* Cover */}
                        <div className="relative h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                            <Image
                                src={book.coverURL ? (book.coverURL.includes('vercel-storage.com') ? `/api/image-proxy?url=${encodeURIComponent(book.coverURL)}` : book.coverURL) : "/images/book-placeholder.png"}
                                alt={book.title}
                                width={85}
                                height={128}
                                className="rounded-xl shadow-2xl border-2 border-white dark:border-white/10 object-cover w-[85px] h-auto relative z-10 -rotate-2 hover:rotate-0 transition-transform duration-500"
                                priority
                            />
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-1">Current Focus</p>
                                <h4 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 line-clamp-1 leading-tight">
                                    {book.title}
                                </h4>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-black/5 dark:border-white/10">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current AI Profile</p>
                                <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-3">
                                    <UserCircle size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                                        Assisting in {activeVoiceName} Voice
                                    </span>
                                </div>

                                <button
                                    onClick={isActive ? stop : start}
                                    disabled={status === 'connecting' || status === 'starting'}
                                    suppressHydrationWarning
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                                        isActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    )}
                                >
                                    {(status === 'connecting' || status === 'starting') ? (
                                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : isActive ? <MicOff size={15} /> : <Mic size={15} />}
                                    {isActive ? 'Disconnect Voice' : 'Connect to Discussion'}
                                </button>

                                {isActive && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                                            {status === 'speaking' ? 'AI Speaking' : status === 'thinking' ? 'Thinking...' : 'Listening'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== RIGHT: Chat Panel ===== */}
                <div className="flex-1 w-full min-w-0 relative">
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-3xl border border-black/5 dark:border-white/10 shadow-xl flex flex-col h-[calc(100vh-120px)] min-h-[550px] overflow-hidden">

                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10 shrink-0 bg-white dark:bg-[#0c0c0c]" suppressHydrationWarning>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                                {!selectedThreadId ? 'Current Chat' : 'Past Thread'}
                            </span>
                            <div className="flex items-center gap-2">
                                {/* + New Thread button */}
                                <button
                                    onClick={() => {
                                        startNewThread();
                                        setShowHistory(false);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-all"
                                    suppressHydrationWarning
                                    title="Start a new thread"
                                >
                                    <Plus size={13} strokeWidth={3} />
                                    New
                                </button>
                                {/* Past Threads button — only show if there are archived messages */}
                                {hasArchive && (
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
                                        suppressHydrationWarning
                                    >
                                        <History size={13} />
                                        Past Threads
                                        <ChevronRight size={10} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-hidden min-h-0">
                            <Transcript
                                messages={currentViewMessages}
                                currentMessage={currentMessage}
                                currentUserMessage={currentUserMessage}
                                isTextLoading={isTextLoading}
                                isPastThread={!!selectedThreadId}
                            />
                        </div>

                        {/* Input Bar - disabled when viewing past thread */}
                        <div className="px-4 py-3 border-t border-black/5 dark:border-white/10 shrink-0 bg-white dark:bg-[#0c0c0c]">
                            {!selectedThreadId ? (
                                <form onSubmit={handleSendText} className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Ask anything about the node..."
                                        disabled={isTextLoading}
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 dark:text-white placeholder:text-gray-200 placeholder:text-xs transition-all disabled:opacity-60"
                                        suppressHydrationWarning
                                    />
                                    <button
                                        type="submit"
                                        disabled={!textInput.trim() || isTextLoading}
                                        className="bg-indigo-600 text-white size-11 rounded-xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-indigo-500/20 shrink-0"
                                        suppressHydrationWarning
                                    >
                                        <Send size={17} />
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center justify-center gap-2 py-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-100">Viewing past thread — </span>
                                    <button
                                        onClick={() => startNewThread()}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Start new chat
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <HistorySidebar
                        show={showHistory}
                        onClose={() => setShowHistory(false)}
                        threadArchive={threadArchive}
                        selectedThreadId={selectedThreadId}
                        onSelectThread={(id) => {
                            setSelectedThreadId(id);
                            setShowHistory(false);
                        }}
                        onDeleteThread={deleteSession}
                        onRenameThread={renameSession}
                        onNewChat={() => {
                            startNewThread();
                            setShowHistory(false);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VapiControls;
