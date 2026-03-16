'use client';

import React, { useCallback, useRef } from 'react';
import { useController, FieldValues } from 'react-hook-form';
import { X } from 'lucide-react';
import { FileUploadFieldProps } from '@/types';
import { cn } from '@/lib/utils';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const FileUploader = <T extends FieldValues>({
    control,
    name,
    label,
    acceptTypes,
    disabled,
    icon: Icon,
    placeholder,
    hint,
}: FileUploadFieldProps<T>) => {
    const {
        field: { onChange, value },
    } = useController({ name, control });

    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                onChange(file);
            }
        },
        [onChange]
    );

    const onRemove = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange(null);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [onChange]
    );

    const isUploaded = !!value;

    return (
        <FormItem className="w-full">
            <FormLabel className="text-sm font-bold text-gray-500 dark:text-gray-100 uppercase tracking-widest ml-1 mb-3 block">{label}</FormLabel>
            <FormControl>
                <div
                    className={cn(
                        'relative group flex flex-col items-center justify-center min-h-[180px] rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden',
                        isUploaded 
                            ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-2 border-indigo-200 dark:border-indigo-500/30' 
                            : 'bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-black/40'
                    )}
                    onClick={() => !disabled && inputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept={acceptTypes.join(',')}
                        className="hidden"
                        ref={inputRef}
                        onChange={handleFileChange}
                        disabled={disabled}
                    />

                    {isUploaded ? (
                        <div className="flex flex-col items-center gap-3 relative w-full px-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="size-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                                <Icon className="text-white size-6" />
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{ (value as File).name }</p>
                            <button
                                type="button"
                                onClick={onRemove}
                                className="px-4 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-tighter transition-colors"
                            >
                                Remove File
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center p-8 space-y-2 group-hover:scale-105 transition-transform duration-300">
                            <div className="size-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 mb-2">
                                <Icon className="text-indigo-600 dark:text-indigo-400 size-7" />
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{placeholder}</p>
                            <p className="text-sm text-gray-400 dark:text-gray-300 font-medium">{hint}</p>
                            
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="size-2 bg-indigo-500 rounded-full animate-ping" />
                            </div>
                        </div>
                    )}
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    );
};

export default FileUploader;
