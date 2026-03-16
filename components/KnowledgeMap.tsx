'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, AlertCircle, Maximize2 } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function KnowledgeMap({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [renderError, setRenderError] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        
        mermaid.initialize({
            startOnLoad: false,
            theme: theme === 'dark' ? 'dark' : 'base',
            themeVariables: {
                primaryColor: theme === 'dark' ? '#4f46e5' : '#f3e4c7',
                primaryTextColor: theme === 'dark' ? '#fff' : '#212a3b',
                primaryBorderColor: theme === 'dark' ? '#6366f1' : '#212a3b',
                lineColor: theme === 'dark' ? '#818cf8' : '#663820',
                edgeLabelBackground: 'transparent',
            },
            securityLevel: 'loose',
            fontFamily: 'Inter, system-ui, sans-serif'
        });

        const sanitizeMermaid = (input: string) => {
            const lines = input.trim().split('\n');
            const result: string[] = [];
            let rootAdded = false;

            lines.forEach(line => {
                let trimmed = line.trim();
                if (!trimmed) return;
                
                if (trimmed.toLowerCase() === 'mindmap') {
                    if (!result.includes('mindmap')) result.push('mindmap');
                    return;
                }

                // Strip hierarchy symbols, brackets, and existing quotes
                let content = trimmed.replace(/[\*\-\(\)\[\]\{\}\#\+\"\'\:]/g, ' ').trim();
                
                // Collapse multiple spaces into one
                content = content.replace(/\s+/g, ' ').trim();
                if (!content) return;

                // Re-wrap in quotes for Mermaid safety
                const cleanContent = `"${content}"`;

                if (!rootAdded) {
                    // First non-mindmap line is ALWAYS the root
                    result.push(cleanContent);
                    rootAdded = true;
                } else {
                    // Any subsequent line MUST be indented
                    // We try to preserve original relative indentation depth
                    const originalIndent = (line.match(/^\s*/)?.[0] || '').length;
                    const indent = ' '.repeat(Math.max(2, originalIndent + 2));
                    result.push(`${indent}${cleanContent}`);
                }
            });

            if (result[0]?.toLowerCase() !== 'mindmap') {
                result.unshift('mindmap');
            }

            // Final check: Mermaid mindmaps HATE empty lines or trailing symbols
            return result.filter(v => v.trim()).join('\n');
        };

        if (ref.current && chart) {
            setIsRendering(true);
            setRenderError(null);
            
            const cleanedChart = sanitizeMermaid(chart);

            mermaid.render(id, cleanedChart).then(({ svg }) => {
                if (ref.current) {
                    ref.current.innerHTML = svg;
                    // Inject responsive styles to the SVG
                    const svgElement = ref.current.querySelector('svg');
                    if (svgElement) {
                        svgElement.style.width = '100%';
                        svgElement.style.height = 'auto';
                        svgElement.style.maxWidth = '100%';
                    }
                }
                setIsRendering(false);
            }).catch(err => {
                console.error('Mermaid render error:', err);
                setRenderError("The map looks a bit complex for our canvas. Try regenerating or simplified excerpts.");
                setIsRendering(false);
            });
        }
    }, [chart, theme]);

    return (
        <div className="relative w-full h-[600px] bg-white dark:bg-black/40 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden group/map shadow-inner">
            <AnimatePresence mode="wait">
                {isRendering && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm"
                    >
                        <RefreshCcw className="size-10 text-indigo-500 animate-spin mb-4" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600">Visualizing Neural Network...</p>
                    </motion.div>
                )}

                {renderError ? (
                    <motion.div 
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center"
                    >
                        <AlertCircle className="size-16 text-red-500 mb-6 opacity-20" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Topology Overflow</h3>
                        <p className="text-gray-500 dark:text-gray-200 text-sm max-w-xs mb-8">{renderError}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95"
                        >
                            Force Recalibration
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="map-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex items-center justify-center p-8 overflow-auto no-scrollbar"
                    >
                        <div ref={ref} className="w-full h-full flex items-center justify-center transition-transform duration-500" />
                        
                        {/* Map Controls */}
                        <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover/map:opacity-100 transition-opacity">
                            <button className="size-10 bg-white dark:bg-white/10 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors shadow-lg shadow-black/5">
                                <Maximize2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
