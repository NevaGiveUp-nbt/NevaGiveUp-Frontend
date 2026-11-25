This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## GitHub Actions CI

[Frontend CI](.github/workflows/ci.yml) chạy khi mở hoặc cập nhật PR vào `main`, push lên `main` và khi chọn **Run workflow** trong tab **Actions**. Runner dùng Node.js 24, cài theo lockfile, sinh Zod schema, chạy ESLint và production build.

1. Tạo fine-grained personal access token với quyền **Contents → Read-only** giới hạn ở repo `nbt2308/NevaGiveUp-Backend`. [Tài liệu token GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
2. Trong repo frontend, vào **Settings → Secrets and variables → Actions → New repository secret**. Đặt tên `BACKEND_READ_TOKEN`.
3. Push workflow lên một nhánh trong repo frontend, mở PR vào `main` và xem **Frontend checks**. PR từ fork thiếu secret để checkout backend private.

Workflow ghim commit backend ở trường `ref`. Khi cần schema mới, đưa thay đổi lên BE trước, rồi cập nhật `ref` trong PR của FE. Runner sinh `src/types/generated-zod/` trước khi build, nên có thể giữ thư mục trong `.gitignore`.

Lỗi build chặn CI. ESLint hiện ghi cảnh báo vì repo đang có lỗi lint. Sau khi xử lý các lỗi đó, bỏ `continue-on-error` và bước **Report existing lint issues** để yêu cầu lint pass.

## Deploy trên Vercel

Tạo project Vercel cho FE, chọn Node.js **24.x** và cấu hình biến môi trường production. Đặt `NEXT_PUBLIC_API_URL` trỏ tới API production có đuôi `/api/v1` và khai báo các biến Auth.js tương ứng. Dùng `vercel link` từ repo FE để lấy `orgId` và `projectId` trong `.vercel/project.json`. [Node.js trên Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

1. Tạo GitHub Environment `production` dành cho `main`. Thêm `VERCEL_TOKEN`, `VERCEL_ORG_ID` và `VERCEL_PROJECT_ID` vào secrets của environment đó.
2. Thêm job deploy dùng `needs: check`, `environment: production` và `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`. Dùng lại các bước checkout, cài dependencies và generate từ job CI để lấy đúng commit FE và BE. Cài Vercel CLI ở một phiên bản đã chọn, truyền ba secret qua `env` của bước chạy CLI, rồi chạy từ `Front-end/`.
3. Nếu project đã kết nối Git, tắt Git auto-deploy để nhận bản build từ Actions. [Cấu hình Git của Vercel](https://vercel.com/docs/project-configuration/git-configuration)

```bash
vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
vercel build --prod --token="$VERCEL_TOKEN"
vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
```

`vercel build` tạo `.vercel/output` và `vercel deploy --prebuilt` gửi kết quả build lên Vercel. [Hướng dẫn Vercel với GitHub Actions](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel)
