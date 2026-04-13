# =============================================================================
# Multi-stage Dockerfile for running Playwright tests in CI or locally
# =============================================================================
# Usage:
#   docker build -t e2e-tests .
#   docker run --rm e2e-tests npm test
#   docker run --rm e2e-tests npm run test:api
# =============================================================================

# --- Stage 1: Install dependencies ---
FROM node:22-slim AS deps

WORKDIR /app

# Copy package files first — Docker caches this layer if deps don't change
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# --- Stage 2: Test runner ---
# Use Playwright's official image — includes browsers + OS dependencies
# This avoids the "missing shared library" headaches on Linux
FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy project files
COPY . .

# Default: run all tests on Chromium
# Override at runtime: docker run e2e-tests npm run test:api
CMD ["npx", "playwright", "test", "--project=chromium"]
