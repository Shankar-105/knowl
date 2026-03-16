'use client';

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Heart, MessageSquare, Lock, Globe } from 'lucide-react';

interface BookCardProps {
    _id: string;
    title: string;
    author: string;
    coverURL: string;
    slug: string;
    likes?: string[];
    commentsCount?: number;
    visibility?: 'private' | 'public';
    isShelf?: boolean;
}

const BookCard = ({ _id, title, author, coverURL, slug, likes = [], commentsCount = 0, visibility = 'private', isShelf = false }: BookCardProps) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="group relative"
        >
            <Link href={`/books/${slug}`}>
                <motion.div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        rotateY,
                        rotateX,
                        transformStyle: "preserve-3d",
                    }}
                    className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/20 dark:border-white/5 shadow-2xl transition-all duration-500 group-hover:shadow-indigo-500/20"
                >
                    <img 
                        src={coverURL || '/assets/book-cover-placeholder.png'} 
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Visibility Tag - Only in My Shelf/Private space */}
                    {visibility === 'private' && (
                        <div className="absolute top-4 left-4 z-10" style={{ transform: "translateZ(60px)" }}>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                                <Lock size={12} className="text-amber-400" /> My Nodes
                            </div>
                        </div>
                    )}
                    {/* Show Public Tag only in Personal Shelf if the book is public there */}
                    {(visibility === 'public' && isShelf) && (
                        <div className="absolute top-4 left-4 z-10" style={{ transform: "translateZ(60px)" }}>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                                <Globe size={12} className="text-emerald-400" /> Knowl Hub
                            </div>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3" style={{ transform: "translateZ(40px)" }}>
                        <div className="space-y-1">
                            <h3 className="line-clamp-2 text-xl font-serif font-black text-white leading-tight">
                                {title}
                            </h3>
                            <p className="text-xs font-bold text-gray-200 dark:text-gray-100 tracking-wide uppercase italic">
                                by {author}
                            </p>
                        </div>
                        
                        {/* Social Counts - Only for Public Books */}
                        {visibility === 'public' && (
                            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                                <div className="flex items-center gap-1.5 text-white/90">
                                    <Heart size={14} className={likes.length > 0 ? "fill-red-500 text-red-500" : ""} />
                                    <span className="text-xs font-bold font-mono">{likes.length}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/90">
                                    <MessageSquare size={14} />
                                    <span className="text-xs font-bold font-mono">{commentsCount}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    )
}

export default BookCard;
