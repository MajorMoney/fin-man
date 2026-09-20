FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json nx.json ./
COPY tsconfig*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/fin-man-web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
