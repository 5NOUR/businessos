# مرحلة البناء
FROM node:24-alpine AS build
WORKDIR /app

# نسخ ملفات الجذر الضرورية
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/

# تثبيت الاعتماديات
RUN npm install -g pnpm@11.25.0 && pnpm install --frozen-lockfile

# نسخ باقي الملفات
COPY apps/api apps/api
COPY apps/api/prisma apps/api/prisma

# بناء التطبيق
RUN pnpm --filter @businessos/api build

# مرحلة الإنتاج
FROM node:24-alpine
WORKDIR /app

# نسخ ملفات الإنتاج
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/prisma ./prisma

# توليد Prisma Client
RUN npx prisma generate

EXPOSE 4000
CMD ["node", "dist/main"]