# Bản đồ Mapping API Backend - Frontend (Trang Learning)

Tài liệu này ghi chú cách tích hợp các API từ `learning.service.ts` (Backend) vào các component của trang Học tập (Frontend).

## 1. `LearningLayout` (Wrapper & Load Data ban đầu)
Component này chịu trách nhiệm fetch data tổng quan của khóa học trước khi truyền xuống các component con.
- **API sử dụng**: 
  - `API 3: getCourseForLearner(userId, slug)`
- **Mục đích**: 
  - Kiểm tra xem user đã mua khóa học chưa (nếu chưa thì backend sẽ block hoặc Frontend redirect ra ngoài).
  - Lấy thông tin cơ bản: `title`, `courseType`.
  - Lấy thông tin tổng quan `progress`, `status`, `totalLessons`, `completedLessons` để mồi dữ liệu ban đầu cho UI.

## 2. `LearningHeader` (Thanh điều hướng trên cùng)
- **API sử dụng**: Data lấy từ `API 3: getCourseForLearner` (Truyền từ Layout xuống dưới dạng props).
- **Mục đích**: 
  - Hiển thị tên khóa học.
  - Hiển thị tag/danh mục.

## 3. `LearningSidebar` (Danh sách chương & bài học)
- **API sử dụng**: 
  - `API 4: getCurriculum(userId, slug)`
- **Mục đích**: 
  - Render toàn bộ danh sách Chương (Sections) và Bài học (Lessons) bên Sidebar.
  - Render icon trạng thái hoàn thành (`isCompleted`) hoặc icon khóa bài học.
  - Hiển thị thời lượng (`duration`) của từng bài.

## 4. `LearningMainContent` (Nội dung chính của bài học)
Đây là vùng render nội dung chi tiết. Mỗi khi người dùng bấm vào một bài học ở Sidebar, Frontend sẽ gọi API lấy chi tiết bài đó.

- **API sử dụng chính**: 
  - `API 5: getLessonContent(userId, slug, lessonId)`
- **Mục đích**: 
  - Lấy `videoId` để nạp vào iFrame YouTube.
  - Lấy `content` (văn bản HTML) để render vào Tab **Nội dung bài học**.
  - Lấy danh sách `resources` (file đính kèm) để hiển thị trong Tab **Tài nguyên & Code**.
  - Lấy `navigation` (thông tin bài Prev / Next) để làm nút chuyển bài nhanh.

### Các tương tác con bên trong `LearningMainContent`:

#### 4.1. Nút "Đánh dấu hoàn thành"
- **API sử dụng**: 
  - `API 8: completeLesson(userId, slug, lessonId)`
- **Mục đích**: 
  - Cập nhật trạng thái bài giảng hiện tại thành "Đã hoàn thành".
  - Backend sẽ tự động tính toán lại % tiến độ và trả về `courseProgress` mới.
  - Frontend dùng `%` mới này update ngay lập tức thanh Progress bar trên Sidebar và biểu đồ.

#### 4.2. Tab "Tài nguyên & Code" (Tải file đính kèm)
- **API sử dụng**: 
  - `API 6: downloadResource(userId, lessonId, resourceId)`
- **Mục đích**: 
  - Không expose URL thật của file. Khi user bấm "Tải code", Frontend gọi API này để lấy Pre-signed URL (tồn tại trong 5 phút) từ Cloudflare R2 / AWS S3 rồi mới cho phép tải file.

#### 4.3. Tab "Phân tích tiến độ" (Biểu đồ Recharts)
- **API sử dụng**: Không cần gọi API riêng. Sử dụng mảng dữ liệu lấy từ `API 4: getCurriculum`.
- **Mục đích**: Frontend tự filter lấy số `lessons.isCompleted` chia cho tổng số lessons trong từng Section để vẽ biểu đồ.

---

## 5. Các API KHÔNG dùng trong trang Learning
- **`API 1: getEnrollmentStatus`**: Dùng ở trang "Chi tiết khóa học" (Bên ngoài trang Learning) để hiển thị nút "Vào học" hay nút "Mua khóa học".
- **`API 2: getMyCourses`**: Dùng ở trang "Khóa học của tôi" (Dashboard/Profile học viên) để hiển thị danh sách các khóa học đã mua.
- **`API 7: recalculateProgress`**: Dùng nội bộ backend hoặc khi có trigger từ Admin, frontend trang learning thường không gọi trực tiếp API này (vì API 8 đã tính gộp luôn rồi).
