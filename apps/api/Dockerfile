# مرحلة البناء
FROM node:20-alpine AS build
WORKDIR /app

# نسخ ملفات الجذر
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY packages ./packages

# تثبيت pnpm والاعتماديات
RUN npm install -g pnpm && pnpm install --lockfile=false

# توليد Prisma Client وبناء التطبيق
WORKDIR /app/apps/api
RUN pnpm exec prisma generate
RUN pnpm build

# إنشاء مجلد نشر يحتوي على ملفات الإنتاج فقط
RUN pnpm --filter @businessos/api deploy --legacy --prod /deploy/api

# مرحلة الإنتاج
FROM node:20-alpine
WORKDIR /app
COPY --from=build /deploy/api ./
EXPOSE 4000
CMD ["node", "dist/main"]