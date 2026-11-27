"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search, PlayCircle, CheckCircle2 } from 'lucide-react';
import { SectionTypeResponse } from '@/types/learning/learning.type';
import { formatLessonDuration } from '@/lib/utils';



interface LearningSidebarProps {
    isDataPending: boolean;
    sections: SectionTypeResponse[];
    activeSectionId: number | null;
    activeLessonId: number | null;
    onSelectLesson: (id: number) => void;
}

export function LearningSidebar({ isDataPending, sections, activeSectionId, activeLessonId, onSelectLesson }: LearningSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [openSections, setOpenSections] = useState<number[]>([]);

    const toggleSection = (id: number) => {
        setOpenSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    //tự mở chương chứa bài đang học
    useEffect(() => {
        if (activeSectionId == null) return;
        setOpenSections(prev => prev.includes(activeSectionId) ? prev : [...prev, activeSectionId])
    }, [activeSectionId])

    const { totalLessons, completedLessons, totalSeconds, totalResources, progressPercentage } = useMemo(() => {
        let total = 0;
        let completed = 0;
        let seconds = 0;
        let resources = 0;
        sections.forEach(s => {
            s.lessons.forEach(l => {
                total++;
                seconds += l.duration!;
                if (l.isCompleted) completed++;
                resources += l.resourceCount;
            });
        });
        return {
            totalLessons: total,
            completedLessons: completed,
            totalSeconds: seconds,
            totalResources: resources,
            progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }, [sections]);

    return (
        <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm md:max-h-[calc(100vh-8.5rem)] transition-colors">
            {/* Total Course Progress Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiến độ khóa học</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-50">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-900 dark:bg-slate-50 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>{completedLessons}/{totalLessons} bài học</span>
                    <span>Tổng {Math.round(totalSeconds / 60)} phút</span>
                    <span>Tổng {totalResources} tài nguyên</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm bài học..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs font-medium bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-50"
                    />
                </div>
            </div>

            {/* Scrollable Accordion Section List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {sections.map(section => {
                    const totalSecLessons = section.lessons.length;
                    const completedSecLessons = section.lessons.filter(l => l.isCompleted).length;
                    const sectionProgress = totalSecLessons > 0 ? Math.round((completedSecLessons / totalSecLessons) * 100) : 0;
                    // khi đang tìm kiếm thì mở hết các chương có kết quả
                    const isOpen = searchQuery ? true : openSections.includes(section.id);

                    const filteredLessons = section.lessons.filter(l =>
                        l.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
                    );

                    if (searchQuery && filteredLessons.length === 0) return null;

                    const lessonsToDisplay = searchQuery ? filteredLessons : section.lessons;

                    return (
                        <div key={section.id} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full p-4 flex items-center justify-between bg-white dark:bg-[#121212] hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors focus:outline-none"
                            >
                                <div className="text-left pr-2 w-full">
                                    <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 block mb-0.5">Chương {section.order}</span>
                                    <h3 className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-50 mb-2">{section.title}</h3>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-slate-900 dark:bg-slate-50 h-full transition-all duration-300" style={{ width: `${sectionProgress}%` }}></div>
                                    </div>
                                </div>
                                <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">
                                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </span>
                            </button>

                            {isOpen && (
                                <div className="bg-slate-50/40 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
                                    {lessonsToDisplay.map(lesson => {
                                        const isActive = lesson.id === activeLessonId;


                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => onSelectLesson(lesson.id)}
                                                className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors ${isActive ? 'bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 font-medium' : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-300'}`}
                                            >
                                                <span className={`mt-0.5 flex items-center justify-center rounded-full ${lesson.isCompleted ? (isActive ? 'text-slate-900 dark:text-slate-50 bg-slate-100 dark:bg-slate-900' : 'text-slate-50 dark:text-slate-900 bg-slate-900 dark:bg-slate-50') : (isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500')}`}>
                                                    {lesson.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-xs leading-snug font-medium">
                                                        {lesson.order}. {lesson.title}
                                                    </p>
                                                    <p className={`text-[10px] mt-1 ${isActive ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'} font-normal`}>
                                                        {formatLessonDuration(lesson.duration!)} • {lesson.resourceCount} tài nguyên
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Help CTA */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Cần hỗ trợ kiến thức?</p>
                <a href="#" className="text-xs font-semibold text-slate-900 dark:text-slate-50 hover:underline inline-flex items-center gap-1">
                    Hỏi đáp cùng Giảng viên <span>➔</span>
                </a>
            </div>
        </aside>
    );
}
