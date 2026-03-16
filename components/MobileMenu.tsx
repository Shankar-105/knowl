'use client';

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Globe, Library, PlusCircle, User, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const MobileMenu = ({ user, pathName }: { user: any, pathName: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { signOut, openUserProfile } = useClerk();

    const items = [
        { label: "Discovery Hub", href: "/", icon: Globe },
        { label: "My Nodes", href: "/shelf", icon: Library, authRequired: true },
        { label: "Add Node", href: "/nodes/new", icon: PlusCircle, authRequired: true, highlight: true },
    ];

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="absolute top-14 right-0 w-[280px] bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-[101]"
                        >
                            <div className="p-4 space-y-2">
                                {items.map((item) => {
                                    if (item.authRequired && !user) return null;
                                    const isActive = pathName === item.href;

                                    return (
                                        <Link 
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-black transition-all",
                                                isActive 
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                                                    : item.highlight
                                                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </Link>
                                    );
                                })}

                                <div className="h-[1px] bg-gray-100 dark:bg-white/10 my-2" />

                                <SignedIn>
                                    <button 
                                        onClick={() => { openUserProfile(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-black text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                                    >
                                        <User size={18} />
                                        Profile Settings
                                    </button>
                                    <button 
                                        onClick={() => { signOut(); setIsOpen(false); }}
                                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                                    >
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </SignedIn>

                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-black bg-indigo-600 text-white shadow-lg">
                                            Sign In
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileMenu;
