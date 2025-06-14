# Use official Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy root package.json + lockfile + workspaces
COPY ../../package.json ../../yarn.lock ./

# Install workspace tools
RUN npm install -g yarn && yarn install --frozen-lockfile

# Copy backend project
COPY . .

# Optional: build TS
# RUN yarn build

EXPOSE 7070
CMD ["yarn", "start"]