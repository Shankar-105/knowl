import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HeroSection = () => {
    return (
        <section className="wrapper mb-16 md:mb-24 pt-20">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12">
                {/* Hero Text */}
                <div className="space-y-6">
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-black tracking-tighter leading-[1.05] bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Synthesize <br />
                        <span className="text-indigo-600 dark:text-indigo-400 italic">Nodes</span> <br />
                        of Knowledge
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-gray-100 leading-relaxed font-medium">
                        Knowl transforms your research documents into interactive, 
                        social-ready knowledge nodes. Engage with AI resonance and 
                        a community of deep thinkers.
                    </p>
                </div>

                {/* Call to Action or Illustration */}
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <Image
                        src="/assets/hero-illustration.png"
                        alt="Vintage books and a globe"
                        width={500}
                        height={500}
                        className="relative object-contain transform group-hover:scale-105 transition-transform duration-700"
                        style={{ width: 'auto', height: 'auto' }}
                        priority
                    />
                </div>

                {/* Steps Section - Horizontal on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {[
                        { step: 1, title: "Upload PDF", desc: "Upload your node" },
                        { step: 2, title: "AI Processing", desc: "We analyze the content" },
                        { step: 3, title: "Voice Chat", desc: "Discuss with AI" }
                    ].map((item) => (
                        <div key={item.step} className="premium-glass dark:premium-glass-dark p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:translate-y-[-8px] transition-all border border-black/5 dark:border-white/5">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/20">
                                {item.step}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-200">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroSection
