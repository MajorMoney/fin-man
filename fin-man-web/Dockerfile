# Build
FROM node:18 AS build
WORKDIR /app
COPY package*.json nx.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run
FROM nginx:alpine
COPY --from=build /app/dist/fin-man-web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
