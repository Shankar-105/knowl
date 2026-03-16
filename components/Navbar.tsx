'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Plus } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import SettingsSidebar from "./SettingsSidebar";
import MobileMenu from "./MobileMenu";

const navItems = [
    { label: "Discovery Hub", href: "/discover" },
    { label: "My Nodes", href: "/shelf", authRequired: true },
];

const Navbar = () => {
    const pathName = usePathname();
    const { user, isLoaded } = useUser();
    const [showSettings, setShowSettings] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl opacity-0">
                <div className="premium-glass dark:premium-glass-dark rounded-2xl px-6 py-10" />
            </header>
        );
    }

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
            <div className="premium-glass dark:premium-glass-dark rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg">
                <Link href="/" className="flex gap-2 items-center group">
                    <div className="size-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                        <span className="text-white font-black text-xl italic drop-shadow-sm">K</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        Knowl
                    </span>
                </Link>

                <nav className="hidden lg:flex gap-8 items-center bg-black/5 dark:bg-white/5 px-6 py-2 rounded-full border border-black/5 dark:border-white/5">
                    {navItems.map(({ label, href, authRequired }) => {
                        // Use suppressHydrationWarning pattern: always render, but hide with CSS if needed
                        const isActive = pathName === href || (href !== '/' && pathName.startsWith(href));

                        if (authRequired) {
                            return (
                                <SignedIn key={label}>
                                    <Link
                                        href={href}
                                        className={cn(
                                            'text-sm font-bold transition-all hover:text-indigo-600 dark:hover:text-indigo-400',
                                            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'
                                        )}
                                    >
                                        {label}
                                    </Link>
                                </SignedIn>
                            );
                        }

                        return (
                            <Link
                                href={href}
                                key={label}
                                className={cn(
                                    'text-sm font-bold transition-all hover:text-indigo-600 dark:hover:text-indigo-400',
                                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'
                                )}
                            >
                                {label}
                            </Link>
                        );
                    })}

                    <SignedIn>
                        <div className="h-4 w-[1px] bg-gray-300 dark:bg-white/10 mx-1" />
                        <Link href="/nodes/new" className="flex items-center gap-3 group">
                            <div className="p-3 bg-indigo-50 dark:bg-white/5 rounded-xl border border-indigo-100 dark:border-white/10 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
                                <Plus size={24} className="text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-gray-900 dark:text-white text-base">Add New Node</span>
                                <span className="text-xs text-gray-500 dark:text-gray-200 italic">Synthesize your PDF</span>
                            </div>
                        </Link>
                    </SignedIn>
                </nav>

                <div className="flex gap-4 items-center">
                    <ThemeToggle />
                    
                    <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block mx-1" />

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden">
                        <MobileMenu user={user} pathName={pathName} />
                    </div>

                    <div className="hidden lg:flex gap-3 items-center">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <div className="text-sm font-black bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer">
                                    Sign In
                                </div>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/profile"
                                className={cn(
                                    "flex items-center gap-2 group p-1 pr-3 rounded-full transition-all border border-transparent",
                                    pathName === '/profile' ? "bg-indigo-600/10 border-indigo-500/20" : "hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                            >
                                {user?.imageUrl && (
                                    <img
                                        src={user.imageUrl}
                                        alt="Profile"
                                        className="size-8 rounded-full border-2 border-white dark:border-[#141414] shadow-sm shadow-black/10 group-hover:scale-110 transition-transform"
                                    />
                                )}
                                <span className={cn(
                                    "text-sm font-bold transition-colors",
                                    pathName === '/profile' ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-100"
                                )}>
                                    {user?.firstName}
                                </span>
                            </Link>

                            <div className="relative group/settings">
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="p-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <Settings size={20} className="group-hover/settings:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </div>
            
            <SettingsSidebar show={showSettings} onClose={() => setShowSettings(false)} />
        </header>
    );
};

export default Navbar;
