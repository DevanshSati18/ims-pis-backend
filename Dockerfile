# ----------- BUILD STAGE -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build


# ----------- PRODUCTION STAGE -----------
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Create upload directory (fallback if not mounted)
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]