import { auth } from "@/auth";
import CourseDetail from "@/components/client/course/course-detail/courseDetail";
import { SYSTEM_ROLES } from "@/constants/roles.constant";
import { CourseService } from "@/services/course";
import type { Metadata } from "next";
import { getSession } from "next-auth/react";

interface CourseDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}
export async function generateMetadata({
    params,
}: CourseDetailPageProps): Promise<Metadata> {
    const { slug } = await params;

    const course = await CourseService.getCourseBySlugServer(slug);

    return {
        title: `Khóa học ${course?.title || slug} | NevaGiveUp`, 
    };
}
export default async function CourseDetailPage({
    params,
}: CourseDetailPageProps) {
    const session = await auth();
    const { slug } = await params;
    const course = await CourseService.getCourseBySlugServer(slug);
    const isOwner = course.instructor.id === session?.user.id
    const isAdmin = session?.user?.role?.includes(SYSTEM_ROLES.ADMIN)
    return <CourseDetail slug={slug} isOwner={isOwner || null} isAdmin={isAdmin || null}/>;
}