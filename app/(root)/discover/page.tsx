import React from 'react'
import BookCard from "@/components/BookCard";
import BookStaggeredGrid from "@/components/BookStaggeredGrid";
import {getAllBooks} from "@/lib/actions/book.actions";
import Search from "@/components/Search";

const DiscoverPage = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
    const { query } = await searchParams;

    const bookResults = await getAllBooks(query)
    const books = bookResults.success ? bookResults.data ?? [] : []

    return (
        <main className="wrapper container pt-32 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-12">
                <div className="space-y-1">
                    <h2 className="text-4xl md:text-5xl font-serif font-black text-[#212a3b] dark:text-white italic">Discovery Hub</h2>
                    <p className="text-gray-500 dark:text-gray-200 font-medium tracking-tight">Explore the global pulse of AI-synthesized knowledge.</p>
                </div>
                <div className="w-full sm:w-auto">
                    <Search />
                </div>
            </div>

            {books.length > 0 ? (
                <BookStaggeredGrid>
                    {books.map((book: any) => (
                        <BookCard 
                            key={book._id} 
                            _id={book._id.toString()} 
                            title={book.title} 
                            author={book.author} 
                            coverURL={book.coverURL} 
                            slug={book.slug}
                            likes={book.likes}
                            commentsCount={book.commentsCount}
                            visibility={book.visibility}
                        />
                    ))}
                </BookStaggeredGrid>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                    <div className="size-24 bg-gray-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                        <span className="text-5xl">🔍</span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white italic">The Hub is quiet...</h3>
                        <p className="text-gray-500 dark:text-gray-300 max-w-sm mx-auto font-medium">Be the first to publish your distilled AI insights from your personal shelf.</p>
                    </div>
                </div>
            )}
        </main>
    )
}

export default DiscoverPage
