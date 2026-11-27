import axiosClient from "../lib/axiosClient";


export const LearningService = {

    getCourseForLearner: async (slug: string) => {
        try {
            const response = await axiosClient.get(`/learning/courses/${slug}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    getCurriculum: async (slug: string) => {
        try {
            const response = await axiosClient.get(`/learning/courses/${slug}/curriculum`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    getLessonContent: async (slug: string, lessonId: number | null) => {
        try {
            const response = await axiosClient.get(`/learning/courses/${slug}/lessons/${lessonId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    downloadResource: async (lessonId: number, resourceId: number) => {
        try {
            const response = await axiosClient.get(`/learning/lessons/${lessonId}/resources/${resourceId}/download`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    completeLesson: async (slug: string, lessonId: number) => {
        try {
            const response = await axiosClient.post(`/learning/courses/${slug}/lessons/${lessonId}/complete`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    unCompleteLesson: async (slug: string, lessonId: number) => {
        try {
            const response = await axiosClient.post(`/learning/courses/${slug}/lessons/${lessonId}/uncomplete`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    saveLessonProgress: async (slug: string, lessonId: number, position: number) => {
        try {
            const res = await axiosClient.put(
                `/learning/courses/${slug}/lessons/${lessonId}/progress`,
                { position },
            );
            return res.data;
        } catch (error: any) {
            throw new Error(error.message)
        }
    }


}