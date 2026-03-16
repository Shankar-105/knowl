'use client';

import React, {useEffect, useState} from 'react';
import {Input} from "@/components/ui/input";
import {Search as SearchIcon} from "lucide-react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

const Search = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [query, setQuery] = useState(searchParams.get('query') || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);

            if (query) {
                params.set('query', query);
            } else {
                params.delete('query');
            }

            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, pathname, router]);

    return (
        <div className="relative group">
            <SearchIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 group-hover:text-indigo-500 transition-colors"
                size={18}
            />
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search nodes by title, author, or #hashtags..."
                className="w-full h-14 pl-12 pr-6 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all"
            />
        </div>
    );
};

export default Search;
