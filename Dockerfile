# Multi-stage production build for IndicVoice Lab
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies and build client
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install root dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code and built assets
COPY server.js ./
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server.js"]

