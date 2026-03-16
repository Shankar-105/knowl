'use client';

import { motion } from "framer-motion";
import { Share2, Twitter, Linkedin, Copy } from "lucide-react";
import { toast } from "sonner";
import { IBook } from "@/types";

export default function ShareInsight({ book }: { book: IBook }) {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `I'm synthesizing "${book.title}" on Knowl! Interacting with these AI knowledge nodes is incredible. Check it out!`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="mt-12 mb-12 w-full max-w-4xl mx-auto">
            <div className="p-4 md:px-8 md:py-4 rounded-3xl premium-glass dark:premium-glass-dark border border-white/20 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0">
                        <Share2 size={18} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#212a3b] dark:text-white opacity-70">
                        Share Enlightenment
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                        className="size-10 rounded-xl bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        title="Share on X"
                    >
                        <Twitter size={16} />
                    </button>
                    <button 
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                        className="size-10 rounded-xl bg-[#0077b5] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        title="Share on LinkedIn"
                    >
                        <Linkedin size={16} />
                    </button>
                    <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-3 px-5 h-10 rounded-xl bg-white dark:bg-white/5 text-[#212a3b] dark:text-gray-300 border border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-sm"
                    >
                        <Copy size={16} />
                        <span>Copy Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
