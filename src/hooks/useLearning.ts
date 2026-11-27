import { LearningService } from "@/services/learning";
import { CurriculumResponse } from "@/types/learning/learning.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export const learningKeys = {
    course: (slug: string) => ['courses', slug, 'learning'] as const,
    curriculum: (slug: string) => [...learningKeys.course(slug), 'curriculum'] as const,
    lesson: (slug: string, lessonId: number | null) =>
        [...learningKeys.course(slug), 'lesson', lessonId] as const,
};
export function useCourseForLearner(slug: string) {
    return useQuery({
        queryKey: learningKeys.course(slug),
        queryFn: async () => {
            const result = await LearningService.getCourseForLearner(slug);
            return result;
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
    });
}

export function useCurriculum(slug: string) {
    return useQuery({
        queryKey: learningKeys.curriculum(slug),
        queryFn: async () => {
            const result = await LearningService.getCurriculum(slug);
            return result;
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
    });
}

export function useLessonContent(slug: string, lessonId: number | null) {
    return useQuery({
        queryKey: learningKeys.lesson(slug, lessonId),
        queryFn: async () => {
            const result = await LearningService.getLessonContent(slug, lessonId);
            return result;
        },
        enabled: lessonId !== null && !!slug,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
    });
}

export function useDownloadResource() {
    return useMutation({
        mutationFn: async ({ lessonId, resourceId }: { lessonId: number; resourceId: number }) => {
            const result = await LearningService.downloadResource(lessonId, resourceId);
            return result;
        },
        onSuccess: (data) => {
            window.open(data.url, '_blank');
        },
        onError: (error) => {
            toast.error(error.message || "Không thể tải tài nguyên");
        },
    });
}

export function useToggleLessonCompletion(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, complete }: { lessonId: number; complete: boolean }) =>
      complete
        ? LearningService.completeLesson(slug, lessonId)
        : LearningService.unCompleteLesson(slug, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: learningKeys.curriculum(slug) });
      qc.invalidateQueries({ queryKey: learningKeys.course(slug), exact: true });
    },
    onError: (error) => toast.error(error.message || "Không thể cập nhật trạng thái bài học"),
  });
}

export function useSaveLessonProgress(slug: string) {
     const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ lessonId, position }: { lessonId: number; position: number }) =>
            LearningService.saveLessonProgress(slug, lessonId, position),

          onSuccess: (_data, { lessonId }) => {
            // Cập nhật cache tại chỗ, không refetch: giữ lastLessonId trong curriculum luôn mới
            qc.setQueryData<CurriculumResponse>(learningKeys.curriculum(slug), (old) =>
                old && old.lastLessonId !== lessonId ? { ...old, lastLessonId: lessonId } : old,
            );
        },
    });

    
}

