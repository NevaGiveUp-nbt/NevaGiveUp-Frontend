import { LessonSchema } from "@/types/generated-zod/schemas/models/Lesson.schema";
import z from "zod";
export const CreateLessonSchema = LessonSchema.pick({
    title: true,
    content: true,
    order: true,
    isPreview: true,
    sectionId: true,
}).extend({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    video: z.any().refine((file) => file instanceof File || (typeof window !== "undefined" && file instanceof FileList && file.length > 0), "Vui lòng chọn một file video").optional(),
    resources: z.any().optional(),
    content: z.string().optional(),
    order: z.number().int().min(1, "Thứ tự phải từ 1 trở lên").optional(),
    isPreview: z.boolean(),
    sectionId: z.number().min(1, "ID của Chương không được để trống"),
});

export const UpdateLessonSchema = CreateLessonSchema.omit({ order: true }).partial();

export type ICreateLesson = z.infer<typeof CreateLessonSchema>;
export type IUpdateLesson = z.infer<typeof UpdateLessonSchema>;
