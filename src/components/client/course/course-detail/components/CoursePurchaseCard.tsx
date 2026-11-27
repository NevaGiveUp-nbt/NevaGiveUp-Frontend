import React from "react";
import { ArrowRight, ShoppingCart, Video, Infinity as InfinityIcon, Smartphone, Share2, CheckCircle, BarChart3, PenSquare, GraduationCap } from "lucide-react";
import { formatSectionDuration, formatter, getCoursePricing } from "@/lib/utils";
import { CourseTypeSchema } from "@/types/generated-zod/schemas/enums/CourseType.schema";

interface CoursePurchaseCardProps {
  isStickyVisible: boolean;
  price: number;
  discount: number;
  courseType: string;
  thumbnail: string;
  totalDuration: number;
  handleEnroll: () => void;
  handleLearning: () => void;
  addToCart: () => void;
  shareCourse: () => void;
  onEditCourse?: () => void;
  onViewStats?: () => void;
  onManageCourse?: () => void;
  isEnrolled: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

export default function CoursePurchaseCard({
  isStickyVisible,
  price,
  discount,
  courseType,
  thumbnail,
  totalDuration,
  handleEnroll,
  handleLearning,
  addToCart,
  shareCourse,
  onEditCourse,
  onViewStats,
  onManageCourse,
  isEnrolled,
  isOwner,
  isAdmin
}: CoursePurchaseCardProps) {
  const CourseType = CourseTypeSchema.enum;
  const { originalPrice, finalPrice, hasDiscount } = getCoursePricing(price, discount);
  const showDiscount = courseType === CourseType.PAID && hasDiscount;
  const discountPercent = showDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;
  const isRegularUser = !isOwner && !isAdmin;
  const showPurchaseInfo = isRegularUser && !isEnrolled; // loại khóa học, giảm %, giá
  const showEnrolledBadge = isRegularUser && isEnrolled;
  return (
    <div className={`lg:col-span-4 sticky z-30 transition-all duration-300 ${isStickyVisible ? 'top-36' : 'top-20'}`}>
      <div className="border border-border rounded-2xl bg-card p-5 shadow-lg space-y-5">

        <div className={`relative aspect-video rounded-xl overflow-hidden bg-muted border border-border transition-all duration-300 ${isStickyVisible ? 'max-h-0 opacity-0 mb-0 border-0' : 'max-h-[300px] opacity-100 mb-5'}`}>
          <img src={thumbnail} alt="Course Banner" className="w-full h-full object-cover" />
        </div>

        {(showPurchaseInfo || showEnrolledBadge) && (
          <div className="space-y-2">
            <div className={`flex items-center ${showPurchaseInfo ? 'justify-between' : ''}`}>
              {showPurchaseInfo && (
                <>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                    Loại khóa học: {courseType === CourseType.FREE ? "Miễn phí" : "Trả phí"}
                  </span>
                  {showDiscount && (
                    <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded">
                      Giảm {discountPercent}%
                    </span>
                  )}
                </>
              )}

              {showEnrolledBadge && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold">Bạn đã đăng ký khóa học này</span>
                </div>
              )}
            </div>

            {showPurchaseInfo && (
              <div className="flex items-baseline gap-3">
                {courseType === CourseType.FREE ? (
                  <div className="text-xl font-bold text-emerald-600">Miễn phí</div>
                ) : (
                  <div className="flex">
                    <span className="text-2xl mr-2 font-black text-primary tracking-tight">
                      {formatter.format(finalPrice)}
                    </span>
                    {showDiscount && (
                      <span className="text-muted-foreground font-medium line-through text-sm mt-0.5 flex items-center gap-2">
                        {formatter.format(originalPrice)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {isOwner ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
              <GraduationCap className="w-4 h-4 text-foreground/80 shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">
                Bạn là giảng viên của khóa học này
              </span>
            </div>

            <button
              onClick={onEditCourse}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
            >
              <PenSquare className="w-4 h-4" />
              <span>Chỉnh sửa khóa học</span>
            </button>

            {onViewStats && (
              <button
                onClick={onViewStats}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-foreground border border-input hover:bg-accent transition flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Xem thống kê
              </button>
            )}
          </div>
        ) : isAdmin ? (
          <div className="space-y-2.5 pt-1">

            <button
              onClick={onManageCourse}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Quản trị khóa học</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : isEnrolled ? (
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleLearning}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Xem khóa học</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleEnroll}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Đăng ký ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {courseType !== CourseType.FREE && (
              <button
                onClick={addToCart}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-foreground border border-input hover:bg-accent transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Thêm vào giỏ hàng
              </button>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Khóa học bao gồm:</h4>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <Video className="w-4 h-4 text-foreground/80" />
              <span>{formatSectionDuration(totalDuration)} video chất lượng cao</span>
            </li>
            <li className="flex items-center gap-2.5">
              <InfinityIcon className="w-4 h-4 text-foreground/80" />
              <span>Quyền truy cập trọn đời, cập nhật vĩnh viễn</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-foreground/80" />
              <span>Học trên máy tính, điện thoại, máy tính bảng</span>
            </li>
          </ul>
        </div>

        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <button onClick={shareCourse} className="hover:text-foreground flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" />
            Chia sẻ khóa học
          </button>

        </div>

      </div>
    </div>
  );
}
