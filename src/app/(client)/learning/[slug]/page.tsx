
import { LearningLayout } from "@/components/client/learning/learningLayout";
import { CourseService } from "@/services/course";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache } from "react";

const getCourse = cache((slug: string) => CourseService.getCourseBySlugServer(slug));
interface LearningPageProps {
    params: Promise<{
        slug: string;
    }>;
}
export async function generateMetadata({
    params,
}: LearningPageProps): Promise<Metadata> {
    const { slug } = await params;

    const course = await getCourse(slug);

    return {
        title: `Khóa học ${course?.title || slug} | NevaGiveUp`, 
    };
}
export default async function LearningPage({
    params,
}: LearningPageProps) {
    const { slug } = await params;
    const course = await getCourse(slug);
    if(!course?.isEnrolled){
        redirect(`/course/${slug}`);
    }
    return <LearningLayout slug={slug} />;
}