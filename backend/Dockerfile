# Production Dockerfile for Google Cloud Run (plain JavaScript, no build step)
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Use non-root node user for container security
USER node

EXPOSE 8080

CMD ["node", "server.js"]
