# Use official Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy monorepo package.json and yarn.lock
COPY package.json yarn.lock ./

# Copy the rest of the monorepo (Dockerignore will help keep size down)
COPY . .

# Install dependencies (workspace-aware)
RUN yarn install --frozen-lockfile

# Optional: build TypeScript backend
WORKDIR /app/apps/node
RUN yarn build

# Expose server port
EXPOSE 7070

# Start the backend
CMD ["yarn", "start"]