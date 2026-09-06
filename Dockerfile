# مرحلة البناء
FROM node:20-bullseye-slim AS build
WORKDIR /app

# نسخ كل المستودع
COPY . .

# تثبيت pnpm
RUN npm install -g pnpm@11.25.0

# تثبيت جميع الاعتماديات
RUN pnpm install --frozen-lockfile

# توليد Prisma Client
RUN pnpm --filter @businessos/api exec prisma generate

# بناء التطبيق
RUN pnpm --filter @businessos/api build

# مرحلة الإنتاج
FROM node:20-bullseye-slim
WORKDIR /app

# نسخ كل شيء من مرحلة البناء
COPY --from=build /app /app

# لا حاجة لتثبيت OpenSSL إضافي (Bullseye يحتوي على libssl1.1)

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]