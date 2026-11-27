"use client";
import React from 'react';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LearningHeaderProps {
    courseData?: {
        title: string;
        category: string;
        thumbnail: string | null;
    } | null;
    isSidebarVisible: boolean;
    isDataPending: boolean;
    toggleSidebar: () => void;
}

export function LearningHeader({
    courseData,
    isSidebarVisible,
    isDataPending,
    toggleSidebar
}: LearningHeaderProps) {
    const courseName = courseData?.title || '';
    const courseCategory = courseData?.category ?? '';
    const courseThumbnail = courseData?.thumbnail || '';

    return (
        <header className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 px-5 py-3.5 rounded-xl shadow-sm transition-colors">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner shrink-0`}>
                    {
                    isDataPending ? (
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    ) : courseThumbnail ? (
                        <img
                            src={courseThumbnail}
                            alt={courseName.slice(0, 2).toUpperCase()}
                            className="h-full w-full rounded-lg object-cover"
                            onError={(e) => {

                                (e.target as HTMLElement).style.display = 'none'
                            }}
                        />
                    ) : (
                        getInitials(courseName)
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Khóa học</span>
                        {isDataPending ? (
                            <Skeleton className="h-3 w-20" />
                        ) : (
                            <span className="text-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium border border-slate-200 dark:border-slate-700">{courseCategory}</span>
                        )}
                    </div>
                    {isDataPending ? (
                        <Skeleton className="h-3 w-40 mt-1" />
                    ) : (
                        <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight mt-1">{courseName}</h1>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className={`px-3 py-1.5 text-xs font-semibold border rounded-md shadow-sm transition-all flex items-center gap-1.5 focus:outline-none 
                    ${isSidebarVisible
                            ? 'bg-white dark:bg-[#121212] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 text-slate-50 dark:text-slate-900 border-transparent'}`}
                    title="Ẩn hoặc hiện danh sách bài học"
                >
                    {isSidebarVisible ? (
                        <>
                            <PanelRightClose className="w-4 h-4" /> <span>Ẩn danh mục</span>
                        </>
                    ) : (
                        <>
                            <PanelLeftClose className="w-4 h-4" /> <span>Hiện danh mục</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}
