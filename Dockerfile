# development stage
FROM node:12.18.2-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm install --loglevel verbose
COPY . ./
EXPOSE 8080
CMD ["npm", "start"]

# build a production-ready code 
FROM development as builder
RUN npm run build

# serve the production-ready code
FROM nginx:1.18.0-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html

