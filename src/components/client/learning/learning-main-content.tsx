"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, FileText, Link as LinkIcon, BarChart3, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { SectionTypeResponse } from '@/components/admin/courses/curriculum/curriculum-view';
import { LessonContentResponse, LessonTypeResponse, SectionTypeResponse } from '@/types/learning/learning.type';
import { LessonVideoPlayer } from './lesson-video-player';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';
import { formatFileSize } from '@/lib/utils';



interface LearningMainContentProps {
    activeSection: SectionTypeResponse;
    activeLesson: LessonTypeResponse;
    lessonContent: LessonContentResponse['lesson'];
    isContentPending: boolean;
    isToggling: boolean;
    onToggleCompletion: () => void;
    onSaveProgress: (lessonId: number, position: number) => void;
    onDownloadResource: (lessonId: number, resourceId: number) => void;
    isDownloading: boolean;
    navigation?: LessonContentResponse['navigation'];
    onSelectLesson: (lessonId: number) => void;
}

//overlay để tự động chuyển bài tiếp theo
function AutoNextOverlay({ title, seconds = 5, onConfirm, onCancel }: {
    title: string;
    seconds?: number;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const [left, setLeft] = useState(seconds);

    useEffect(() => {
        if (left <= 0) {
            onConfirm();
            return;
        }
        const t = setTimeout(() => setLeft(l => l - 1), 1000);
        return () => clearTimeout(t)

    }, [left])

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/85 p-4 text-center">
            <p className="text-xs text-slate-300">Bài tiếp theo</p>
            <p className="line-clamp-2 text-base font-semibold text-slate-50">{title}</p>
            <p className="text-sm text-slate-50">Tự chuyển sau {left}s</p>
            <div className="flex gap-2">
                <Button size="sm" variant='outline' onClick={onCancel}>Ở lại</Button>
                <Button size="sm" className='cursor-pointer' onClick={onConfirm}>Chuyển ngay</Button>
            </div>
        </div>
    );
}

export function LearningMainContent({ activeLesson, activeSection, lessonContent, isContentPending, isToggling, onToggleCompletion, onSaveProgress, onDownloadResource, isDownloading, navigation, onSelectLesson }: LearningMainContentProps) {
    const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'analytics'>('content');
    //tiến lùi video
    const prev = navigation?.prevLesson ?? null;
    const next = navigation?.nextLesson ?? null;
    const goToLesson = (lessonId: number) => {
        onSelectLesson(lessonId);
        window.scrollTo({ top: 0, behavior: 'smooth' });   // kéo lên đầu để thấy video bài mới
    };

    const safeHtml = useMemo(() => {
        const html = lessonContent?.content;
        if (!html) return '';
        const sanitized = DOMPurify.sanitize(html);
        // TipTap lưu rỗng dưới dạng '<p></p>' → coi như không có nội dung
        const textOnly = sanitized.replace(/<[^>]*>/g, '').trim();
        return textOnly ? sanitized : '';
    }, [lessonContent?.content]);

    const [showAutoNext, setShowAutoNext] = useState(false);
    useEffect(() => { setShowAutoNext(false); }, [activeLesson.id]);
    //xử lý tự động chuyển video khi kết thúc
    const handleVideoEnded = () => {
        //chỉ đánh dấu khi chưa hoàn thành tránh bấm nhầm thành "bỏ hoàn thành"
        if (!activeLesson?.isCompleted && !isToggling) {
            onToggleCompletion();
        }
        if (next) setShowAutoNext(true);
    }
    return (
        <main className="flex-1 flex flex-col gap-6 transition-colors">
            {/* Frame Video YouTube */}
            <div className="w-full aspect-video bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm relative flex-shrink-0">
                {isContentPending ? (
                    <div className="absolute inset-0 animate-pulse bg-slate-800" />
                ) : lessonContent?.videoId ? (
                    <LessonVideoPlayer
                        key={lessonContent.id}
                        videoId={lessonContent.videoId}
                        lessonId={lessonContent.id}
                        duration={lessonContent.duration}
                        startSeconds={lessonContent.lastPosition}
                        onSaveProgress={onSaveProgress}
                        onEnded={handleVideoEnded}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                        Bài học này chưa có video
                    </div>
                )}
                {showAutoNext && next && (
                    <AutoNextOverlay
                        title={next.title}
                        seconds={5}
                        onConfirm={() => { goToLesson(next.id); setShowAutoNext(false); }}
                        onCancel={() => setShowAutoNext(false)}
                    />
                )}
            </div>

            {/* Lesson Card & Interactive Details */}
            <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-6 transition-colors">

                {/* Header Bài học & Action Toggle Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <span className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium px-2.5 py-1 rounded-md mb-2 border border-slate-200 dark:border-slate-700">
                            Chương {activeSection.order}: {activeSection.title}
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-snug">
                            {activeLesson.order}. {activeLesson.title}
                        </h2>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            variant="outline"
                            disabled={!prev}
                            title={prev?.title}
                            onClick={() => prev && goToLesson(prev.id)}
                            className="gap-1.5 text-xs px-4 py-2.5 font-semibold"
                        >
                            <ChevronLeft className="w-4 h-4" /> Bài trước
                        </Button>
                        <Button
                            disabled={isToggling}
                            onClick={onToggleCompletion}
                            className={`self-start sm:self-center px-4 py-2.5 rounded-md font-semibold text-xs transition-all duration-150 border shadow-sm flex items-center gap-2 ${activeLesson.isCompleted
                                ? "border-slate-900 dark:border-slate-50 bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                        >
                            {activeLesson.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            <span>{activeLesson.isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}</span>
                        </Button>
                        <Button
                            disabled={!next}
                            title={next?.title}
                            onClick={() => next && goToLesson(next.id)}
                            className="gap-1.5 text-xs px-4 py-2.5 font-semibold"
                        >
                            Bài sau <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Segmented Tabs */}
                <div className="bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-lg inline-flex gap-1 border border-slate-200/60 dark:border-slate-700/60 self-start">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`px-3.5 py-1.5 font-medium text-xs rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'content' ? 'bg-white dark:bg-[#202020] text-slate-950 dark:text-slate-50  shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'}`}
                    >
                        <FileText className="w-3.5 h-3.5" /> Nội dung bài học
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-3.5 py-1.5 font-medium text-xs rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'resources' ? 'bg-white dark:bg-[#202020] text-slate-950 dark:text-slate-50 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'}`}
                    >
                        <LinkIcon className="w-3.5 h-3.5" /> Tài nguyên & Code
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-3.5 py-1.5 font-medium text-xs rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-white dark:bg-[#202020] text-slate-950 dark:text-slate-50 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50'}`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" /> Phân tích tiến độ
                    </button>
                </div>

                {/* Tab Content Views */}
                <div className="min-h-[160px]">

                    {activeTab === 'content' && (
                        isContentPending ? (
                            <div className="h-24 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        ) : !safeHtml ? (
                            <div className="flex flex-col items-center justify-center ">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Chưa có nội dung chữ cho bài học này
                                </p>
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    Nội dung tóm tắt hoặc ghi chú bài học sẽ hiển thị tại đây.
                                </p>
                            </div>

                        ) : (
                            <div
                                className="tiptap text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                                dangerouslySetInnerHTML={{ __html: safeHtml }}
                            />
                        )
                    )}

                    {activeTab === 'resources' && (
                        isContentPending ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                ))}
                            </div>
                        ) : !lessonContent?.resources?.length ? (
                            <div className="flex flex-col items-center justify-center">
                                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                                    <LinkIcon className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Chưa có tài nguyên đính kèm
                                </p>
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                    Tài liệu và mã nguồn liên quan sẽ hiển thị tại đây.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="font-medium text-xs text-slate-500 dark:text-slate-400">
                                    Tài liệu hướng dẫn và mã nguồn đính kèm bài học này ({lessonContent.resources.length} tệp):
                                </p>
                                {lessonContent.resources.map((resource) => (
                                    <div
                                        key={resource.id}
                                        className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between"
                                    >
                                        <div className="min-w-0 flex-1 mr-3">
                                            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-50 flex items-center gap-1.5 truncate">
                                                <FileText className="w-3.5 h-3.5" /> {resource.name}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {resource.mimeType}
                                                {resource.size != null && ` · ${formatFileSize(resource.size)}`}
                                            </p>
                                        </div>
                                        <button
                                            disabled={isDownloading}
                                            onClick={() => onDownloadResource(lessonContent.id, resource.id)}
                                            className="flex-shrink-0 px-3 py-1.5 bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 text-xs font-medium rounded-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                            Tải xuống
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </main>
    );
}
