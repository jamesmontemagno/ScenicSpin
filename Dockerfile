# Container to build, serve, and test the ScenicSpin static app
# - Uses supported Node LTS
# - Installs npm dependencies and Playwright Chromium
# Build with: docker build -t scenicspin .
# Run preview: docker run --rm -p 5173:5173 scenicspin
# Run tests: docker run --rm --shm-size=1g scenicspin npm run test:all

FROM node:22-bookworm-slim

ENV NODE_ENV=development
WORKDIR /app

# Install minimal TLS support for npm and Playwright downloads.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install pinned dependencies, including devDeps for tests.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

RUN npx playwright install --with-deps chromium

# Copy project files. .dockerignore prevents local state, secrets, and build artifacts from entering the image.
COPY . .

# Build the default site so template tokens are replaced
RUN node scripts/build.js pedalscape

# Expose the preview port used by the built preview site
EXPOSE 5173

# Serve the built output from dist/pedalscape
CMD ["node", "scripts/serve-dist.js", "pedalscape", "5173", "0.0.0.0"]