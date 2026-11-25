import { CourseType } from "../generated-zod/schemas/models/Course.schema";
import { LessonType } from "../generated-zod/schemas/models/Lesson.schema";
import { LessonResourceType } from "../generated-zod/schemas/models/LessonResource.schema";
import { SectionType } from "../generated-zod/schemas/models/Section.schema";

export type CourseTypeResponse = Omit<CourseType, "sections"> & {
    totalLesson: number;
    completedLesson: number;
    sections: SectionTypeResponse[];
};

export type SectionTypeResponse = Omit<SectionType, "lessons"> & {
    lessonCount: number;
    totalDuration: number;
    lessons: LessonTypeResponse[];
    
};

export type LessonTypeResponse = LessonType & {
    resourceCount: number;
    isCompleted: boolean;
};

export interface CurriculumResponse {
    sections: SectionTypeResponse[];
    lastLessonId: number | null;                 
}

export interface LessonContentResponse {
    lesson: {
        id: number;
        title: string;
    videoId: string | null;
    duration: number | null;
    content: string | null;
    order: number;
    isPreview: boolean;
    isCompleted: boolean;
    lastPosition: number;                      
    resources: LessonResourceType[];
  };
  navigation: {
    prevLesson: { id: number; title: string } | null;
    nextLesson: { id: number; title: string } | null;
  } | null;
}