import { SectionSchema } from "@/types/generated-zod/schemas/models/Section.schema";
import z from "zod";

export const CreateSectionSchema = SectionSchema.pick({
    title: true,
    order: true,
    courseId: true
}).extend({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    order: z.number().int().min(1, "Thứ tự phải từ 1 trở lên").optional(),
    courseId: z.string().min(1, "ID khóa học không được để trống"),
});

export const UpdateSectionSchema = SectionSchema.pick({
    title: true,
    courseId: true
}).extend({
    title: z.string().min(1, "Tiêu đề không được để trống").optional(),
    courseId: z.string().min(1, "ID khóa học không được để trống"),
})



export type ICreateSection = z.infer<typeof CreateSectionSchema>;
export type IUpdateSection = z.infer<typeof UpdateSectionSchema>;
