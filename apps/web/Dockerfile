# مرحلة البناء
FROM node:20-alpine AS build
WORKDIR /app

# نسخ ملفات الجذر اللازمة للـ workspaces
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web ./apps/web
COPY packages ./packages

RUN npm install -g pnpm && pnpm install --lockfile=false

WORKDIR /app/apps/web
RUN pnpm build

# مرحلة الإنتاج مع Nginx
FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]