'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Heart, User, MoreVertical, Pin, Trash2, Edit3, Check, X } from "lucide-react";
import { addComment, deleteComment, editComment, getCommentsForBook, likeComment, togglePinComment } from "@/lib/actions/knowledge.actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface IComment {
    _id: string;
    clerkId: string;
    userImage?: string;
    userName: string;
    createdAt: string | Date;
    text: string;
    likes?: string[]; 
    isPinned?: boolean;
}

export default function KnowledgeComments({ bookId, bookOwnerId }: { bookId: string, bookOwnerId?: string }) {
    const { user } = useUser();
    const [comments, setComments] = useState<IComment[]>([]);
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [showActionsId, setShowActionsId] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoading(true);
        getCommentsForBook(bookId)
            .then((res) => {
                if (res.success) setComments((res.data || []) as IComment[]);
            })
            .catch(() => {/* silently fail */})
            .finally(() => setIsLoading(false));
    }, [bookId]);

    // Normalize: ensure likes is always an array
    const normalizeComment = (c: IComment): IComment => ({
        ...c,
        likes: Array.isArray(c.likes) ? c.likes : [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return toast.error("Please write something first.");
        if (!user) return toast.error("Please sign in to comment.");

        setIsSubmitting(true);
        try {
            const res = await addComment(bookId, text);
            if (res.success && res.data) {
                setComments(prev => [normalizeComment(res.data), ...prev]);
                setText("");
                toast.success("Insight shared!");
            } else {
                toast.error(res.error || "Failed to post comment.");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTogglePin = async (commentId: string) => {
        if (!user || user.id !== bookOwnerId) return;

        setComments(prev => prev.map(c => 
            c._id === commentId ? { ...c, isPinned: !c.isPinned } : c
        ).sort((a, b) => {
            if (a._id === commentId || b._id === commentId) {
                // re-sort after pin toggle
                return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
            }
            return 0;
        }));

        try {
            const res = await togglePinComment(commentId);
            if (!res.success) {
                toast.error("Failed to toggle pin.");
                // refresh to correct state
                getCommentsForBook(bookId).then(r => {
                    if (r.success) setComments((r.data || []) as IComment[]);
                });
            } else {
                toast.success(res.isPinned ? "Insight pinned to top!" : "Insight unpinned.");
            }
        } catch {
            toast.error("Pinning error.");
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm("Are you sure you want to remove this insight?")) return;
        
        try {
            const res = await deleteComment(commentId);
            if (res.success) {
                setComments(prev => prev.filter(c => c._id !== commentId));
                toast.success("Insight removed.");
            } else {
                toast.error(res.error || "Failed to delete.");
            }
        } catch {
            toast.error("Deletion error.");
        }
    };

    const handleEdit = async (commentId: string) => {
        if (!editText.trim()) return;
        try {
            const res = await editComment(commentId, editText);
            if (res.success) {
                setComments(prev => prev.map(c => c._id === commentId ? { ...c, text: editText } : c));
                setEditingCommentId(null);
                toast.success("Insight updated.");
            } else {
                toast.error(res.error || "Failed to update.");
            }
        } catch {
            toast.error("Edit error.");
        }
    };
    const handleLikeComment = async (commentId: string) => {
        if (!user) return toast.error("Sign in to like insights!");

        // Optimistic UI update
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                const hasLiked = c.likes?.includes(user.id);
                const newLikes = hasLiked
                    ? c.likes?.filter(id => id !== user.id)
                    : [...(c.likes || []), user.id];
                return { ...c, likes: newLikes };
            }
            return c;
        }));

        try {
            const res = await likeComment(commentId);
            if (!res.success) {
                toast.error("Failed to update like status.");
                // Refresh to sync state if failed
                getCommentsForBook(bookId).then(r => {
                    if (r.success) setComments((r.data || []) as IComment[]);
                });
            }
        } catch {
            toast.error("An error occurred while liking.");
            // Refresh to sync state if failed
            getCommentsForBook(bookId).then(r => {
                if (r.success) setComments((r.data || []) as IComment[]);
            });
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <MessageSquare className="text-indigo-600 dark:text-indigo-400" size={18} />
                    <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 italic">Discussion</h3>
                </div>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="size-10 rounded-full shrink-0 object-cover" />
                ) : (
                    <div className="size-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                        <User size={18} className="text-indigo-500" />
                    </div>
                )}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e as any)}
                        placeholder="Share your perspective..."
                        className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 pr-14 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !text.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="size-10 rounded-xl bg-gray-100 dark:bg-white/5 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-1/3" />
                                    <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-lg w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                        <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                            <MessageSquare size={24} className="text-indigo-400" />
                        </div>
                        <p className="text-sm font-bold dark:text-white mb-1">No insights yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-300">Be the first to share your perspective</p>
                    </div>
                ) : (
                    comments.map((rawComment) => {
                        const comment = normalizeComment(rawComment);
                        const isLiked = user ? (comment.likes || []).includes(user.id) : false;
                        const isBookAuthor = comment.clerkId === bookOwnerId;
                        const isOwnComment = user?.id === comment.clerkId;
                        const canModerate = user?.id === bookOwnerId;

                        return (
                            <div key={comment._id} className={cn(
                                "group relative flex gap-3 p-4 rounded-2xl transition-all duration-300",
                                comment.isPinned ? "bg-indigo-600/[0.03] border border-indigo-500/10" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                            )}>
                                {comment.isPinned && (
                                    <div className="absolute -top-2 -left-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
                                        <Pin size={10} className="fill-white" />
                                    </div>
                                )}

                                {comment.userImage ? (
                                    <img
                                        src={comment.userImage}
                                        alt={comment.userName}
                                        className="size-10 rounded-full object-cover shrink-0 border border-black/5 dark:border-white/5"
                                    />
                                ) : (
                                    <div className="size-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                        <User size={16} className="text-indigo-400" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm text-gray-900 dark:text-gray-200">{comment.userName}</span>
                                            {comment.clerkId === bookOwnerId && (
                                                <span className="px-2 py-0.5 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                                                    Author
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-500 dark:text-gray-200 font-medium tracking-tight">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {/* Actions Menu */}
                                        {(isOwnComment || canModerate) && (
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setShowActionsId(showActionsId === comment._id ? null : comment._id)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                                                >
                                                    <MoreVertical size={14} />
                                                </button>

                                                {showActionsId === comment._id && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                                    >
                                                        {canModerate && (
                                                            <button 
                                                                onClick={() => { handleTogglePin(comment._id); setShowActionsId(null); }}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5"
                                                            >
                                                                <Pin size={12} className={comment.isPinned ? "fill-current" : ""} />
                                                                {comment.isPinned ? "Unpin" : "Pin Insight"}
                                                            </button>
                                                        )}
                                                        {isOwnComment && (
                                                            <button 
                                                                onClick={() => { setEditingCommentId(comment._id); setEditText(comment.text); setShowActionsId(null); }}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5"
                                                            >
                                                                <Edit3 size={12} />
                                                                Edit
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => { handleDelete(comment._id); setShowActionsId(null); }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                            Delete
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {editingCommentId === comment._id ? (
                                        <div className="space-y-3 mb-3">
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                placeholder="Add a thought to this node..."
                                                className="flex-1 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[50px] resize-none"
                                                rows={2}
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button 
                                                    onClick={() => setEditingCommentId(null)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(comment._id)}
                                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600 dark:text-gray-100 leading-relaxed break-words mb-2">{comment.text}</p>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <button
                                            suppressHydrationWarning
                                            onClick={() => handleLikeComment(comment._id)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-90",
                                                isLiked
                                                    ? "bg-red-500/10 text-red-500"
                                                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <Heart size={11} className={isLiked ? "fill-red-500" : ""} />
                                            <span>{(comment.likes || []).length > 0 ? comment.likes?.length : ''}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
