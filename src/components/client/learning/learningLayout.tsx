"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LearningHeader } from './learning-header';
import { LearningSidebar } from './learning-sidebar';
import { LearningMainContent } from './learning-main-content';
import { useCourseForLearner, useCurriculum, useLessonContent, useDownloadResource, useSaveLessonProgress, useToggleLessonCompletion } from '@/hooks/useLearning';
import { SectionTypeResponse } from '@/types/learning/learning.type';

//Hiển thị đúng lesson đang học, nếu chưa học bài nào thì hiển thị bài đầu tiên, nếu đã học hết thì hiển thị bài cuối cùng
//Nếu có lastLessonId từ server, ưu tiên hiển thị bài đó
function getResumeLessonId(sections: SectionTypeResponse[], lastLessonId?: number | null) {
    const all = sections.flatMap(s => s.lessons);
    if (lastLessonId && all.some(l => l.id === lastLessonId)) return lastLessonId;
    return (all.find(l => !l.isCompleted) ?? all[all.length - 1])?.id ?? null;
}

export function LearningLayout({ slug }: { slug: string }) {
    const { data: courseForLearner, isPending: isPendingCourseForLearner } = useCourseForLearner(slug)
    const { data: curriculum, isPending: isPendingCurriculum } = useCurriculum(slug)

    //lấy data cho sidebar và content
    const sections: SectionTypeResponse[] = useMemo(() => curriculum?.sections ?? [], [curriculum]);
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    //chọn đúng bài đang học lần cuối
    useEffect(() => {
        if (activeLessonId == null && curriculum) {
            setActiveLessonId(getResumeLessonId(curriculum.sections, curriculum.lastLessonId));
        }
    }, [curriculum, activeLessonId]);

    const activeLessonData = useMemo(() => {
        for (const section of sections) {
            const lesson = section.lessons.find(l => l.id === activeLessonId);
            if (lesson) return { lesson, section };
        }
        return null;
    }, [activeLessonId, sections]);


    //lấy data content
    const { data: lessonContent, isPending: isPendingLessonContent } = useLessonContent(slug, activeLessonId)

    //save progress
    const { mutate: saveProgress, isPending: isPendingSaveProgress } = useSaveLessonProgress(slug)

    //toggle completion
    const { mutate: toggleCompletion, isPending: isPendingToggleCompletion } = useToggleLessonCompletion(slug);

    //download resource
    const { mutate: downloadResource, isPending: isPendingDownload } = useDownloadResource();

    //useCallback(fn, [deps]): bắt thằng react giữ lại đúng 1 hàm trừ khi deps thay đổi 
    //(lessonId: number, position: number): tham số rời để truyền vào Lesson video player (react-youtube)
    const handleSaveProgress = useCallback(
        (lessonId: number, position: number) => saveProgress({ lessonId, position }),
        [saveProgress],
    );

    const handleDownloadResource = useCallback(
        (lessonId: number, resourceId: number) => downloadResource({ lessonId, resourceId }),
        [downloadResource],
    );

    const handleToggleCompletion = () => {
        if (!activeLessonData) return;
        toggleCompletion({ lessonId: activeLessonData.lesson.id, complete: !activeLessonData.lesson.isCompleted });
    }

    return (
        <div className="container p-4 md:p-6  mx-auto min-h-screen flex flex-col gap-6 font-sans transition-colors">
            <LearningHeader
                courseData={courseForLearner?.course}
                isSidebarVisible={isSidebarVisible}
                isDataPending={isPendingCourseForLearner}
                toggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
            />

            <div className="flex-1 flex flex-col md:flex-row gap-6">
                {activeLessonData ? (
                    <LearningMainContent
                        activeLesson={activeLessonData.lesson}
                        activeSection={activeLessonData.section}
                        lessonContent={lessonContent?.lesson}
                        isContentPending={isPendingLessonContent}
                        isToggling={isPendingToggleCompletion}
                        onToggleCompletion={handleToggleCompletion}
                        onSaveProgress={handleSaveProgress}
                        onDownloadResource={handleDownloadResource}
                        isDownloading={isPendingDownload}
                        navigation={lessonContent?.navigation}
                        onSelectLesson={setActiveLessonId}
                    />
                ) : (
                    <main className="flex-1">
                        <div className="w-full aspect-video rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    </main>
                )}

                {isSidebarVisible && (
                    <LearningSidebar
                        isDataPending={isPendingCurriculum}
                        sections={sections}
                        activeSectionId={activeLessonData?.section.id ?? null}
                        activeLessonId={activeLessonId}
                        onSelectLesson={setActiveLessonId}
                    />
                )}
            </div>
        </div>
    );
}