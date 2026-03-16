'use client';

import { useState, useEffect } from "react";
import { BookOpen, Zap, MessageSquare, Trophy, CheckCircle2, XCircle, RefreshCcw, Globe, Lock, Heart, Users, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateBookInsights } from "@/lib/actions/ai.actions";
import { toggleBookPrivacy, likeBook } from "@/lib/actions/knowledge.actions";
import { updateBookTags } from "@/lib/actions/book.actions";
import { voiceOptions, voiceCategories, DEFAULT_VOICE } from "@/lib/constants";
import { IBook } from "@/types";
import { useUser } from "@clerk/nextjs";
import VapiControls from "./VapiControls";
import {cn} from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";
import KnowledgeComments from "./KnowledgeComments";

export default function AIFeatures({ book }: { book: IBook }) {
    const { user } = useUser();
    const isOwner = user?.id === book.clerkId;
    
    const [activeTab, setActiveTab] = useState<"chat" | "about" | "flashcards" | "community">("chat");
    const [insights, setInsights] = useState(book.insights || "");
    const [flashcards, setFlashcards] = useState(book.flashcards || []);
    const [isLoading, setIsLoading] = useState(false);
    
    const [visibility, setVisibility] = useState<'private' | 'public'>(book.visibility || 'private');
    const [likes, setLikes] = useState(book.likes || []);
    const isLiked = user?.id ? likes.includes(user.id) : false;

    // Hashtag Modal State
    const [showHashtagModal, setShowHashtagModal] = useState(false);
    const [hashtags, setHashtags] = useState<string[]>(book.hashtags || []);
    const [hashtagInput, setHashtagInput] = useState("");

    const handleTogglePrivacy = async () => {
        if (!isOwner) return;
        
        // If moving from private to public, ask for hashtags
        if (visibility === 'private' && !showHashtagModal) {
            setShowHashtagModal(true);
            return;
        }

        const res = await toggleBookPrivacy(book._id, hashtags);
        if (res.success) {
            setVisibility(res.visibility as 'private' | 'public');
            setShowHashtagModal(false);
            toast.success(res.visibility === 'public' ? "Knowledge resources published to Hub!" : "Moved back to private shelf.");
        }
    };

    const addHashtag = () => {
        const tag = hashtagInput.trim().replace(/^#/, '');
        if (tag && !hashtags.includes(tag)) {
            setHashtags([...hashtags, tag]);
            setHashtagInput("");
        }
    };

    const removeHashtag = (tag: string) => {
        setHashtags(hashtags.filter(h => h !== tag));
    };

    const handleUpdateTags = async () => {
        const res = await updateBookTags(book._id, hashtags);
        if (res.success) {
            toast.success("Hashtags updated successfully!");
            setShowHashtagModal(false);
        } else {
            toast.error(res.error || "Failed to update hashtags.");
        }
    };

    const handleLike = async () => {
        if (!user) return toast.error("Please sign in to like knowledge.");
        const res = await likeBook(book._id);
        if (res.success) {
            setLikes(res.likes || []);
        }
    };
    
    // Auto-generate map/insights on mount if they don't exist
    useEffect(() => {
        if (!insights && !isLoading && isOwner) { // Only generate if owner
            setIsLoading(true);
            generateBookInsights(book._id).then((res) => {
                if (res.success) {
                    setInsights(res.insights || "");
                    setFlashcards(res.flashcards || []);
                }
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        }
    }, [book._id, insights, isLoading, isOwner]);
    
    // Flashcard State
    const [isChallengeMode, setIsChallengeMode] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [challengeEnded, setChallengeEnded] = useState(false);
    const [currentFlashcard, setCurrentFlashcard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        if (isChallengeMode && timeLeft > 0 && !challengeEnded) {
            const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isChallengeMode && timeLeft === 0 && !challengeEnded) {
            setChallengeEnded(true);
        }
    }, [isChallengeMode, timeLeft, challengeEnded]);

    const [selectedVoiceId, setSelectedVoiceId] = useState(book.persona || DEFAULT_VOICE);
    const [showVoiceMenu, setShowVoiceMenu] = useState(false);

    const handleAnswer = (correct: boolean) => {
        if (correct) setScore(prev => prev + 1);
        if (currentFlashcard < flashcards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentFlashcard(prev => prev + 1), 300);
        } else {
            setChallengeEnded(true);
        }
    };

    // Filter tabs based on visibility and ownership
    const visibleTabs = [
        { id: 'chat', label: 'AI Discourse', icon: MessageSquare },
        { id: 'about', label: 'About', icon: BookOpen },
        { id: 'flashcards', label: 'Flashcards', icon: Zap, restricted: true },
        { id: 'community', label: 'Community Pulse', icon: Users, publicOnly: true }
    ].filter(tab => {
        if (tab.restricted && !isOwner) return false;
        if (tab.publicOnly && visibility === 'private') return false;
        return true;
    });

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 relative">
            
            {/* Hashtag Modal */}
            <AnimatePresence>
                {showHashtagModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHashtagModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-[#111111] rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 dark:border-white/10"
                        >
                            <h3 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-2 italic">Discovery Hub</h3>
                            <p className="text-gray-500 text-sm mb-8 font-bold uppercase tracking-widest">Add hashtags to help others find this node</p>
                            
                            <div className="space-y-6">
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={hashtagInput}
                                        onChange={(e) => setHashtagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                                        placeholder="e.g. quantum-physics"
                                        className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    />
                                    <button 
                                        onClick={addHashtag}
                                        className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                    {hashtags.map(tag => (
                                        <span key={tag} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest group">
                                            #{tag}
                                            <button onClick={() => removeHashtag(tag)} className="hover:text-red-500">
                                                <XCircle size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                <button 
                                    onClick={visibility === 'public' && hashtags.length > 0 && book.hashtags?.length ? handleUpdateTags : handleTogglePrivacy}
                                    className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all transform active:scale-95"
                                >
                                    {visibility === 'public' && book.hashtags?.length ? "Update Hashtags" : "Publish Knowledge Resource"}
                                </button>
                                
                                <button 
                                    onClick={() => setShowHashtagModal(false)}
                                    className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Social Action Bar - Only for Public resources */}
            {visibility === 'public' && (
                <div className="flex flex-wrap items-center justify-between gap-6 px-10 py-6 bg-white/10 dark:bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Knowledge Type</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Globe size={16} className="text-emerald-400" />
                                <span className="font-serif font-black text-xl italic dark:text-white capitalize">{visibility}</span>
                            </div>
                        </div>
                        {isOwner && (
                            <button 
                                onClick={handleTogglePrivacy}
                                className="px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white"
                            >
                                Make Private
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {isOwner && (
                            <button 
                                onClick={() => setShowHashtagModal(true)}
                                className="px-6 py-3 rounded-2xl bg-indigo-600/10 text-indigo-600 border border-indigo-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                            >
                                Edit Tags
                            </button>
                        )}
                        <button 
                            onClick={handleLike}
                            suppressHydrationWarning
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border",
                                isLiked 
                                    ? "bg-red-500/10 text-red-500 border-red-500/20" 
                                    : "bg-white/5 text-gray-400 border-white/10 hover:border-red-500 hover:text-red-500"
                            )}
                        >
                            <Heart size={16} className={isLiked ? "fill-red-500" : ""} />
                            <span>{likes.length} Collective Likes</span>
                        </button>
                        <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={16} />
                            <span>{book.commentsCount || 0} Collective Comments</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Owner-only Private Control Bar */}
            {visibility === 'private' && isOwner && (
                <div className="flex items-center justify-between px-10 py-6 bg-white/5 dark:bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10">
                    <div className="flex items-center gap-4 text-gray-400">
                        <Lock size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Personal Shelf Insight Selection (Private)</span>
                    </div>
                    <button 
                        onClick={handleTogglePrivacy}
                        className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Publish to Knowledge Hub
                    </button>
                </div>
            )}

            {/* Premium Tab Navigation */}
            <div className="flex bg-white/10 dark:bg-black/40 backdrop-blur-3xl rounded-[2rem] p-2 shadow-2xl border border-white/20 dark:border-white/5 w-fit mx-auto relative z-20 overflow-x-auto max-w-full no-scrollbar">
                {visibleTabs.map((tab) => (
                    <button
                        key={tab.id}
                        suppressHydrationWarning
                        onClick={() => {
                            setActiveTab(tab.id as any);
                            if (tab.id === 'flashcards') {
                                setIsFlipped(false);
                                setIsChallengeMode(false);
                            }
                        }}
                        className={cn(
                            "relative flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all transform active:scale-95 whitespace-nowrap z-10",
                            activeTab === tab.id 
                                ? "text-white" 
                                : "text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="activeTabGlow" 
                                className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10 shadow-[0_10px_30px_rgba(79,70,229,0.3)]" 
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon size={16} strokeWidth={2.5} className={cn(activeTab === tab.id ? "text-white" : "text-gray-400")} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="relative min-h-[600px]">
                <AnimatePresence mode="wait">
                    {activeTab === "chat" && (
                        <motion.div
                            key="chat-view"
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {/* AI Discourse Header/Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-4">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                                        className={cn(
                                            "flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                                            showVoiceMenu ? "bg-indigo-600 text-white shadow-indigo-500/30" : "bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-black/5 dark:border-white/10 shadow-black/5"
                                        )}
                                    >
                                        <Zap size={14} className={showVoiceMenu ? "fill-white" : ""} />
                                        Assistant Resonance
                                    </button>
                                </div>
                                
                                {book.fileURL && (
                                    <a
                                        href={book.fileURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/5 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                                    >
                                        <Download size={14} />
                                        Download Node
                                    </a>
                                )}
                            </div>

                            {/* Voice Menu (Premium Selector) */}
                            <AnimatePresence>
                                {showVoiceMenu && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mb-8 overflow-hidden"
                                    >
                                        {/* Subtitle */}
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300/80 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                                Update the discovery tags for this knowledge node.
                            </p>
                                        <div className="premium-card p-10 bg-white/50 dark:bg-white/[0.02] border-indigo-500/10">
                                            <div className="space-y-10">
                                                {Object.entries(voiceCategories).map(([category, voices]) => (
                                                    <div key={category} className="space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                                            <div className="h-0.5 w-6 bg-indigo-500/30" />
                                                            {category} Resonance
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {voices.map((vKey) => {
                                                                const voice = (voiceOptions as any)[vKey];
                                                                const isSelected = selectedVoiceId === voice.id;
                                                                return (
                                                                    <button
                                                                        key={voice.id}
                                                                        onClick={() => {
                                                                            setSelectedVoiceId(voice.id);
                                                                            toast.success(`Connected to ${voice.name}'s resonance`);
                                                                        }}
                                                                        className={cn(
                                                                            "group flex flex-col p-6 rounded-3xl text-left transition-all duration-300 transform active:scale-[0.98] border",
                                                                            isSelected 
                                                                                ? "bg-indigo-600 border-transparent shadow-xl shadow-indigo-600/20 translate-y-[-4px]" 
                                                                                : "bg-white dark:bg-white/[0.03] border-black/5 dark:border-white/5 hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <span className={cn("text-xs font-black uppercase tracking-widest", isSelected ? "text-white/90" : "text-indigo-600 dark:text-indigo-400")}>
                                                                                {voice.name}
                                                                            </span>
                                                                            {isSelected && <CheckCircle2 size={16} className="text-white" />}
                                                                        </div>
                                                                        <p className={cn("text-[11px] font-medium leading-relaxed", isSelected ? "text-white/70" : "text-gray-500 dark:text-gray-400")}>
                                                                            {voice.description}
                                                                        </p>
                                                                        {!isSelected && (
                                                                            <div className="mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <div className="size-1 rounded-full bg-indigo-500" />
                                                                                <span className="text-[8px] font-black uppercase text-indigo-500 tracking-tighter">Sync Interface</span>
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <VapiControls book={book} voiceId={selectedVoiceId} />
                        </motion.div>
                    )}

                    {activeTab === "about" && (
                        <motion.div
                            key="about-view"
                            initial={{ opacity: 0, rotateX: 10, y: 20 }}
                            animate={{ opacity: 1, rotateX: 0, y: 0 }}
                            exit={{ opacity: 0, rotateX: -10, y: -20 }}
                            className="premium-card p-12 md:p-20 border-white/50 dark:border-white/5 shadow-2xl bg-white/80 dark:bg-black/40 backdrop-blur-xl"
                        >
                            <div className="max-w-3xl mx-auto">
                                <div className="flex items-center gap-6 mb-16">
                                    <div className="size-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-5xl font-serif font-black text-[#212a3b] dark:text-white tracking-tighter leading-tight italic">Resource <span className="text-indigo-600">Brief</span></h2>
                                        <div className="h-1 w-20 bg-indigo-600 mt-2 rounded-full" />
                                    </div>
                                </div>
                                
                                {isLoading ? (
                                    <div className="space-y-8">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="h-5 bg-black/5 dark:bg-white/5 rounded-2xl w-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="prose prose-xl dark:prose-invert max-w-none prose-indigo prose-headings:font-serif prose-headings:font-black prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-300">
                                        <ReactMarkdown>{insights || "Intelligence synthesis in progress..."}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}


                    {activeTab === "flashcards" && isOwner && (
                        <motion.div
                            key="flashcards-view"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center"
                        >
                             <div className="w-full max-w-3xl flex flex-col md:flex-row justify-between items-center mb-16 gap-10 text-center md:text-left" suppressHydrationWarning>
                                <div>
                                    <h2 className="text-5xl font-serif font-black text-[#212a3b] dark:text-white tracking-tighter italic flex items-center gap-4 justify-center md:justify-start">
                                        <Zap className="text-yellow-500 fill-yellow-500 size-10" /> 
                                        {isChallengeMode ? "The Gauntlet" : "Neural Check"}
                                    </h2>
                                    <div className="h-1.5 w-24 bg-yellow-500 mt-4 rounded-full mx-auto md:mx-0" />
                                </div>
                                
                                {!isLoading && flashcards.length > 0 && (
                                    <div className="flex flex-col items-center md:items-end gap-3">
                                        <div className="flex items-center gap-6 mb-2">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Score</span>
                                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{score}</span>
                                            </div>
                                            {isChallengeMode && (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Time</span>
                                                    <span className={cn("text-2xl font-black", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-gray-900 dark:text-white")}>{timeLeft}s</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="h-3 w-48 bg-white/50 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 shadow-inner">
                                            <motion.div 
                                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((currentFlashcard + 1) / flashcards.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isChallengeMode && !challengeEnded && (
                                <button 
                                    onClick={() => {
                                        setIsChallengeMode(true);
                                        setTimeLeft(60);
                                        setScore(0);
                                        setCurrentFlashcard(0);
                                    }}
                                    className="mb-12 px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                                >
                                    <Trophy size={18} />
                                    Initiate Knowledge Challenge
                                </button>
                            )}

                            {challengeEnded ? (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="premium-card p-16 text-center max-w-xl mx-auto"
                                >
                                    <div className="size-24 bg-yellow-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-yellow-500/20">
                                        <Trophy size={48} />
                                    </div>
                                    <h3 className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-4 italic">Neural Sync Complete</h3>
                                    <p className="text-gray-500 mb-10 text-lg uppercase font-black tracking-widest">Efficiency: {Math.round((score / flashcards.length) * 100)}%</p>
                                    <button 
                                        onClick={() => {
                                            setChallengeEnded(false);
                                            setIsChallengeMode(false);
                                            setCurrentFlashcard(0);
                                            setScore(0);
                                        }}
                                        className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black tracking-widest uppercase text-xs shadow-xl"
                                    >
                                        Recalibrate
                                    </button>
                                </motion.div>
                            ) : flashcards.length > 0 ? (
                                <div className="w-full max-w-2xl perspective-1000">
                                    <motion.div 
                                        className="relative w-full aspect-[1.6/1] cursor-pointer preserve-3d transition-all duration-700"
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        onClick={() => setIsFlipped(!isFlipped)}
                                    >
                                        {/* Front */}
                                        <div className="absolute inset-0 backface-hidden premium-card flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-white/[0.02] border-indigo-500/20">
                                            <span className="absolute top-8 left-8 text-[10px] font-black text-indigo-500 uppercase tracking-widest">Question</span>
                                            <p className="text-2xl md:text-3xl font-serif font-black text-gray-900 dark:text-white leading-tight italic">
                                                {flashcards[currentFlashcard].question}
                                            </p>
                                            <div className="absolute bottom-10 flex items-center gap-3 text-gray-400">
                                                <RefreshCcw size={14} className="animate-spin-slow" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Tap to reveal answer</span>
                                            </div>
                                        </div>

                                        {/* Back */}
                                        <div className="absolute inset-0 backface-hidden premium-card flex flex-col items-center justify-center p-12 text-center bg-indigo-600 text-white border-transparent shadow-[0_40px_100px_rgba(79,70,229,0.4)]" style={{ transform: 'rotateY(180deg)' }}>
                                            <span className="absolute top-8 left-8 text-[10px] font-black text-white/60 uppercase tracking-widest">Revelation</span>
                                            <p className="text-xl md:text-2xl font-medium leading-relaxed italic mb-12">
                                                {flashcards[currentFlashcard].answer}
                                            </p>
                                            
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAnswer(false); }}
                                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center gap-3 transition-all"
                                                >
                                                    <XCircle size={18} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Failed</span>
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAnswer(true); }}
                                                    className="px-8 py-4 bg-white text-indigo-600 rounded-2xl flex items-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <CheckCircle2 size={18} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Mastered</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                    
                                    <div className="mt-12 flex justify-center gap-4">
                                         <button 
                                            onClick={() => setShowHint(!showHint)}
                                            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-500 transition-colors"
                                         >
                                            {showHint ? "Hide Neural Hint" : "Request Hint"}
                                         </button>
                                    </div>
                                    {showHint && (
                                        <motion.p 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 text-center text-sm italic text-indigo-400 font-medium"
                                        >
                                            {flashcards[currentFlashcard].hint || "Focus on the secondary themes of the chapter."}
                                        </motion.p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-20 opacity-40">
                                    <p className="text-sm font-black uppercase tracking-widest">Synthesizing cards...</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "community" && (
                        <motion.div
                            key="community-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="premium-card bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/50 dark:border-white/5 overflow-hidden"
                        >
                            {/* Community Pulse Header */}
                            <div className="p-8 md:p-10 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 bg-indigo-600/10 text-indigo-600 rounded-[1.5rem] flex items-center justify-center border border-indigo-500/20">
                                        <Users size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                Community <span className="text-indigo-600 dark:text-indigo-400 italic">Pulse</span>
                                            </h2>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">Join the conversation about this knowledge node</p>
                                    </div>
                                </div>
                            </div>

                            {/* Full-Width Comments Section */}
                            <div className="p-8 md:p-10">
                                <KnowledgeComments bookId={book._id} bookOwnerId={book.clerkId} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
