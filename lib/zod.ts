import { z } from 'zod';
import {MAX_FILE_SIZE, ACCEPTED_FILE_TYPES, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE} from './constants';

export const UploadSchema = z.object({
    title: z.string().max(100, "Title is too long").optional(),
    persona: z.string().min(1, "Please select a voice"),
    pdfFile: z.instanceof(File, { message: "File is required" })
        .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 500MB")
        .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), "This file type is not supported"),
    coverImage: z.instanceof(File).optional()
        .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, "Image size must be less than 10MB")
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .jpg, .jpeg, .png and .webp formats are supported"),
});
