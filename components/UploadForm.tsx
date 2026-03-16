'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadSchema } from '@/lib/zod';
import { BookUploadFormValues } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES } from '@/lib/constants';
import FileUploader from './FileUploader';
import LoadingOverlay from './LoadingOverlay';
import {useAuth, useUser} from "@clerk/nextjs";
import { toast } from 'sonner';
import {checkBookExists, createBook, saveBookSegments} from "@/lib/actions/book.actions";
import {useRouter} from "next/navigation";
import {parsePDFFile} from "@/lib/utils";

type UploadApiResponse = {
    url: string;
    pathname: string;
};

const uploadViaApi = async (
    file: File | Blob,
    pathname: string,
    contentType: string,
    access?: 'public' | 'private'
) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pathname', pathname);
    formData.append('contentType', contentType);
    if (access) {
        formData.append('access', access);
    }

    const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.error || 'Upload failed');
    }

    return payload as UploadApiResponse;
};

const UploadForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [pdfPreview, setPdfPreview] = useState<{ title: string, content: string, cover: string } | null>(null);
    const { userId } = useAuth();
    const { user } = useUser();
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            pdfFile: undefined,
            coverImage: undefined,
        },
    });

    const onSubmit = async (data: BookUploadFormValues) => {
        if(!userId) {
           return toast.error("Please login to upload books");
        }

        setIsSubmitting(true);

        // PostHog -> Track Book Uploads...

        try {
            const existsCheck = await checkBookExists(data.title);

            if(existsCheck.exists && existsCheck.book) {
                toast.info("Book with same title already exists.");
                form.reset()
                router.push(`/books/${existsCheck.book.slug}`)
                return;
            }

            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
            const pdfFile = data.pdfFile;

            const parsedPDF = await parsePDFFile(pdfFile);

            if(parsedPDF.content.length === 0) {
                toast.error("Failed to parse PDF. Please try again with a different file.");
                return;
            }

            setPdfPreview({
                title: pdfFile.name,
                content: parsedPDF.content[0]?.text.substring(0, 300) + "...",
                cover: parsedPDF.cover
            });

            // Auto-fill title if empty
            if (!form.getValues('title')) {
                form.setValue('title', pdfFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
            }

            const uploadedPdfBlob = await uploadViaApi(pdfFile, `${fileTitle}.pdf`, 'application/pdf');

            let coverUrl: string;

            if(data.coverImage) {
                const coverFile = data.coverImage;
                const uploadedCoverBlob = await uploadViaApi(coverFile, `${fileTitle}_cover.png`, coverFile.type, 'public');
                coverUrl = uploadedCoverBlob.url;
            } else {
                const response = await fetch(parsedPDF.cover)
                const blob = await response.blob();

                const uploadedCoverBlob = await uploadViaApi(blob, `${fileTitle}_cover.png`, 'image/png', 'public');
                coverUrl = uploadedCoverBlob.url;
            }

            const book = await createBook({
                clerkId: userId,
                title: data.title,
                author: user?.fullName || "Anonymous Researcher",
                persona: "rachel", // Default to Rachel initially, user can change later in Hub
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL: coverUrl,
                fileSize: pdfFile.size,
            });

            if(!book.success) {
                toast.error(book.error as string || "Failed to create book");
                if (book.isBillingError) {
                    router.push("/subscriptions");
                }
                return;
            }

            if(book.alreadyExists) {
                toast.info("Book with same title already exists.");
                form.reset()
                router.push(`/books/${book.data.slug}`)
                return;
            }

            const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);

            if(!segments.success) {
                toast.error("Failed to save book segments");
                throw new Error("Failed to save book segments");
            }

            form.reset();
            router.push('/');
        } catch (error) {
            console.error(error);

            const message = error instanceof Error ? error.message : 'Failed to upload book. Please try again later.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    return (
        <>
            {isSubmitting && <LoadingOverlay />}

            <div className="mx-auto max-w-4xl px-4 sm:px-6 mb-32">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 1. PDF File Upload */}
                            <div className="premium-card premium-card-hover p-2">
                                <FileUploader
                                    control={form.control}
                                    name="pdfFile"
                                    label="Library Asset (PDF)"
                                    acceptTypes={ACCEPTED_PDF_TYPES}
                                    icon={Upload}
                                    placeholder="Drop your PDF here"
                                    hint="Maximum size: 50MB"
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* 2. Cover Image Upload */}
                            <div className="premium-card premium-card-hover p-2">
                                <FileUploader
                                    control={form.control}
                                    name="coverImage"
                                    label="Node Cover (Optional)"
                                    acceptTypes={ACCEPTED_IMAGE_TYPES}
                                    icon={ImageIcon}
                                    placeholder="Upload cover art"
                                    hint="Auto-generated if left empty"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="premium-card p-8 md:p-10 shadow-xl space-y-8 border-white/40 dark:border-white/5">
                            <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <div className="size-2 bg-white rounded-full animate-pulse" />
                                </div>
                                Node Details
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="col-span-1">
                                            <FormLabel className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest ml-1">Node Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="h-14 bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                    placeholder="e.g. Beyond Good and Evil"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage className="dark:text-red-400" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Neural Analysis Preview */}
                        <AnimatePresence>
                            {pdfPreview && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="premium-card p-8 bg-indigo-600/[0.02] border-indigo-500/20"
                                >
                                    <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                        <div className="size-8 bg-indigo-600/10 rounded-lg flex items-center justify-center">
                                            <div className="size-2 bg-indigo-600 rounded-full animate-ping" />
                                        </div>
                                        Neural Signature
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8">
                                        <div className="w-32 h-44 rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-gray-100 dark:bg-white/5 relative group">
                                            <img src={pdfPreview.cover} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        animate={{ x: ["-100%", "100%"] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        className="h-full w-1/3 bg-indigo-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles size={12} className="text-indigo-500" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Neural Signature</p>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic border-l-2 border-indigo-500/20 pl-4">
                                                    "{pdfPreview.content}"
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {["OCR Analyzed", "Semantic Map", "Structure Linked"].map(tag => (
                                                    <div key={tag} className="px-3 py-1 bg-white dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5 text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                        <div className="size-1 bg-green-500 rounded-full" />
                                                        {tag}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 6. Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="group relative px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Synthesize Node
                                    <div className="size-6 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                                        →
                                    </div>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
};

export default UploadForm;
