# Multi-purpose container to build, serve and test the ScenicSpin static app
# - Installs Node, Python (for simple static preview) and Playwright dependencies
# - Installs npm dependencies and Playwright browsers
# Build with: docker build -t scenicspin .
# Run preview: docker run --rm -p 5173:5173 scenicspin
# Run tests: docker run --rm --shm-size=1g scenicspin npm run test:e2e

FROM node:18-bullseye-slim

ENV NODE_ENV=development
WORKDIR /app

# Install system deps (python3 used by npm start script for static server)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python-is-python3 ca-certificates wget gnupg \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifest and install deps (including devDeps for tests)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Uncomment the following line to install Playwright browsers and required OS dependencies for testing
# RUN npx playwright install --with-deps || true

# Copy project files
COPY . .

# Build the default site so template tokens are replaced
RUN node scripts/build.js pedalscape

# Expose the preview port used by the built preview site
EXPOSE 5173

# Serve the built output from dist/pedalscape
CMD ["sh", "-c", "python3 -m http.server 5173 --bind 0.0.0.0 --directory dist/pedalscape"]