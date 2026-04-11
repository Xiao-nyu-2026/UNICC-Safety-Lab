# ─────────────────────────────────────────────
# Stage 1: Build the React + Express frontend
# ─────────────────────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy only the source files needed for the build
COPY vite.config.ts tsconfig*.json ./
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/

RUN npm run build


# ─────────────────────────────────────────────
# Stage 2: Production runtime
# node:20-slim already includes Node.js — no apt install needed
# ─────────────────────────────────────────────
FROM node:20-slim AS runtime

WORKDIR /app

# Install Python and pip (much lighter than installing Node via apt-get)
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 python3-pip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Install Node production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Python engine source
COPY ai_engine_core.py ./
COPY main.py ./
COPY python_engine/ ./python_engine/

# Copy compiled output from build stage
COPY --from=frontend-builder /app/dist ./dist

# Expose the single public port
EXPOSE 5000

# FastAPI starts as a subprocess of Express (see server/routes.ts)
CMD ["node", "dist/index.js"]
