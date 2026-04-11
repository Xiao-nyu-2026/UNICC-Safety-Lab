# ─────────────────────────────────────────────
# Stage 1: Build the React frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ─────────────────────────────────────────────
# Stage 2: Python + FastAPI runtime
# ─────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python source
COPY ai_engine_core.py ./
COPY main.py ./
COPY python_engine/ ./python_engine/

# Copy built frontend from stage 1 into Express's public directory
COPY --from=frontend-builder /app/dist ./dist

# Copy the Node/Express server files needed to serve the frontend
COPY server/ ./server/
COPY shared/ ./shared/

# Install Node.js (needed to run Express + serve static frontend)
RUN apt-get update && apt-get install -y --no-install-recommends nodejs npm \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Expose the single public port (Express + FastAPI both started internally)
EXPOSE 5000

# FastAPI starts as a subprocess of Express (see server/routes.ts startFastAPI)
CMD ["node", "dist/server/index.js"]
