# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package.json yarn.lock ./
RUN npm install -g tsc typescript 
# Install dependencies
RUN yarn

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_PATH_IMAGES_BUDGET
ARG VITE_PATH_IMAGES

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PATH_IMAGES_BUDGET=$VITE_PATH_IMAGES_BUDGET
ENV VITE_PATH_IMAGES=$VITE_PATH_IMAGES

# Build the application
RUN yarn build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Serve the app with SPA fallback
CMD ["serve", "-s", "dist", "-l", "3000"]
