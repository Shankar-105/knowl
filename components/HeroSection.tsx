import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HeroSection = () => {
    return (
        <section className="wrapper mb-10 md:mb-16">
            <div className="library-hero-card">
                <div className="library-hero-content">
                    {/* Left Part */}
                    <div className="library-hero-text">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter leading-[1.1] mb-8 bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/50 bg-clip-text text-transparent">
                            Synthesize <br />
                            <span className="text-indigo-600 dark:text-indigo-400 italic">Nodes</span> <br />
                            of Knowledge
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-12">
                            Knowl transforms your research documents into interactive, 
                            social-ready knowledge nodes. Engage with AI resonance and 
                            a community of deep thinkers.
                        </p>
                    </div>

                    {/* Center Part - Desktop */}
                    <div className="library-hero-illustration-desktop">
                        <Image
                            src="/assets/hero-illustration.png"
                            alt="Vintage books and a globe"
                            width={400}
                            height={400}
                            className="object-contain"
                            style={{ width: 'auto', height: 'auto' }}
                            priority
                        />
                    </div>

                    {/* Center Part - Mobile (Hidden on Desktop) */}
                    <div className="library-hero-illustration">
                        <Image
                            src="/assets/hero-illustration.png"
                            alt="Vintage books and a globe"
                            width={300}
                            height={300}
                            className="object-contain"
                            style={{ width: 'auto', height: 'auto' }}
                        />
                    </div>

                    {/* Right Part */}
                    <div className="library-steps-card min-w-65 max-w-70 z-10 shadow-soft-md">
                        <ul className="space-y-6">
                            <li className="library-step-item">
                                <div className="w-10 h-10 min-w-10 min-h-10 rounded-full border border-gray-300 flex items-center justify-center font-medium text-lg">1</div>
                                <div className="flex flex-col">
                                    <h3 className="library-step-title text-lg font-bold">Upload PDF</h3>
                                    <p className="library-step-description text-gray-500">Add your book file</p>
                                </div>
                            </li>
                            <li className="library-step-item">
                                <div className="w-10 h-10 min-w-10 min-h-10 rounded-full border border-gray-300 flex items-center justify-center font-medium text-lg">2</div>
                                <div className="flex flex-col">
                                    <h3 className="library-step-title text-lg font-bold">AI Processing</h3>
                                    <p className="library-step-description text-gray-500">We analyze the content</p>
                                </div>
                            </li>
                            <li className="library-step-item">
                                <div className="w-10 h-10 min-w-10 min-h-10 rounded-full border border-gray-300 flex items-center justify-center font-medium text-lg">3</div>
                                <div className="flex flex-col">
                                    <h3 className="library-step-title text-lg font-bold">Voice Chat</h3>
                                    <p className="library-step-description text-gray-500">Discuss with AI</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
