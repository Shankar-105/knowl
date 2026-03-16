import React from 'react'
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import BookStaggeredGrid from "@/components/BookStaggeredGrid";
import {getAllBooks} from "@/lib/actions/book.actions";
import Search from "@/components/Search";

const Page = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
    const { query } = await searchParams;

    const bookResults = await getAllBooks(query)
    const books = bookResults.success ? bookResults.data ?? [] : []

    return (
        <main className="wrapper pt-10">
            <HeroSection />
            
            {/* Visual Spacer/Divider */}
            <div className="flex justify-center py-20">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto text-center pb-32">
                <h2 className="text-3xl font-serif font-black text-[#212a3b] dark:text-white italic mb-6">Built for Deep Thinkers</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    Join a community of researchers and developers transforming static PDFs into <br />
                    living, breathing conversational nodes. The future of knowledge is vocal.
                </p>
            </div>
        </main>
    )
}

export default Page
