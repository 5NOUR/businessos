# مرحلة البناء
FROM node:24-alpine AS build
WORKDIR /app

# نسخ كل المستودع
COPY . .

# تفعيل pnpm
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

# تثبيت جميع الاعتماديات
RUN pnpm install --frozen-lockfile

# توليد Prisma Client
RUN pnpm --filter @businessos/api exec prisma generate

# بناء التطبيق
RUN pnpm --filter @businessos/api build

# مرحلة الإنتاج
FROM node:24-alpine
WORKDIR /app

# تفعيل pnpm في مرحلة الإنتاج
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

# نسخ ملفات الجذر اللازمة لتثبيت الإنتاج
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/

# تثبيت اعتماديات الإنتاج فقط
RUN pnpm install --prod --frozen-lockfile

# نسخ ملفات البناء والتطبيق
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma

# توليد Prisma Client (احتياطي)
RUN pnpm --filter @businessos/api exec prisma generate

EXPOSE 4000
CMD ["node", "dist/main"]