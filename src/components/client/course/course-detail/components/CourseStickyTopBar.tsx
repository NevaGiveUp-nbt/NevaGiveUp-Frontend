import React from "react";
import { ArrowRight, PenSquare, Star } from "lucide-react";
import { CourseTypeSchema } from "@/types/generated-zod/schemas/enums/CourseType.schema";
import { formatter, getCoursePricing } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CourseStickyTopBarProps {
  isStickyVisible: boolean;
  course: {
    title: string;
    averageRating?: number;
    reviewCount?: number;
    studentCount?: number;
    courseType: string;
    price: number;
    discount: number;
    isEnrolled: boolean;


  };
  isAdmin: boolean;
  isOwner: boolean;
  handleEnroll: () => void;
  handleLearning: () => void;
  onManageCourse?: () => void;
  onEditCourse?: () => void;
}

export default function CourseStickyTopBar({
  isStickyVisible,
  course,
  handleEnroll,
  handleLearning,
  isAdmin,
  isOwner,
  onEditCourse,
  onManageCourse
}: CourseStickyTopBarProps) {
  const CourseType = CourseTypeSchema.enum;
  const { originalPrice, finalPrice, hasDiscount } = getCoursePricing(course.price, course.discount);

  const isRegularUser = !isOwner && !isAdmin;
  const showPurchaseInfo = isRegularUser && !course.isEnrolled; // loại khóa học, giảm %, giá
  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 bg-background border-b border-border shadow-sm transition-all duration-300 ${isStickyVisible
        ? "translate-y-0 opacity-100"
        : "translate-y-[-100%] opacity-0 pointer-events-none"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">


            <h2 className="text-sm md:text-base font-bold text-foreground truncate">
              {course.title}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <div className="flex items-center gap-1 text-foreground font-semibold">
              <span>{course.averageRating || 0}</span>
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>•</span>
            <span>{course.reviewCount || 0} đánh giá</span>
            <span>•</span>
            <span>{course.studentCount || 0} học viên</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {showPurchaseInfo ?
            (<div className="hidden lg:flex items-baseline gap-2">
              {course.courseType === CourseType.FREE ? (
                <div className="text-xl font-bold text-emerald-600">Miễn phí</div>
              ) : (
                <div className="flex">
                  <span className="text-2xl mr-2 font-black text-primary tracking-tight">
                    {formatter.format(finalPrice)}
                  </span>
                  {course.courseType === CourseType.PAID && hasDiscount && (
                    <span className="text-muted-foreground font-medium line-through text-sm mt-0.5 flex items-center gap-2">
                      {formatter.format(originalPrice)}
                    </span>
                  )}
                </div>
              )}
            </div>
            ): null}
          {
            isAdmin ? (
              <Button
                onClick={onManageCourse}
                className="py-3 px-4"
              >
                <span>Quản trị khóa học</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

            ) : isOwner ? (
              <Button
                onClick={onEditCourse}
                className="py-3 px-4 text-sm font-semibold"
              >
                <PenSquare className="w-4 h-4 text-sm font-semibold" />
                <span>Chỉnh sửa khóa học</span>
              </Button>
            ) : course.isEnrolled ? (
              <Button
                onClick={handleLearning}
                className="py-3 px-4 text-sm font-semibold"
              >
                <span>Xem khóa học</span>
                <ArrowRight className="w-4 h-4 text-sm font-semibold" />
              </Button>
            ) : (
              <Button
                onClick={handleEnroll}
                className="py-3 px-4 text-sm font-semibold"
              >
                Đăng ký ngay
              </Button>
            )

          }

        </div>
      </div>
    </div>
  );
}
