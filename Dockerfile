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

# نسخ الملفات والاعتماديات من مرحلة البناء
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main"]