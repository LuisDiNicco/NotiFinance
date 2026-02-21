# NotiCore - Event-Driven Notification Engine

A production-ready Notification engine built with NestJS traversing Domain-Driven Design strictly adhering to Hexagonal architectures. 

## Features
- **Idempotency** powered by Redis
- **Message Broker routing** via RabbitMQ
- **Strict Data Validation** on HTTP bound configurations
- **Configurable Template Engine** natively baked-in
- **Generic Channel Dispatching** (supports Mock Email and Socket.io paths natively)
- **Centralized Pino.js Tracing** with correlationId persistence

## Prerequisites
- Node.js v20+
- Docker & Docker Compose (for Postgres, Redis, RabbitMQ)

## Getting Started

### 1. Infrastructure Up
Boot up the backing services:
```bash
docker-compose up -d
```

### 2. Installation
Install strict dependencies:
```bash
npm install
```

### 3. Running the Engine
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### 4. Testing
We include e2e and domain-level unit tests natively isolated:
```bash
# Unit Tests
npm run test

# E2E test
npm run test:e2e
```

## Architecture
See `architecture.md` for a comprehensive detail on how Hexagonal isolation was achieved here.

## How it works (The Flow)
1. Send an HTTP `POST /events` with a strictly validated UUID event payload.
2. The endpoint checks Redis for idempotency.
3. It emits the event onto the AMQP bus and returns 202.
4. The background consumer receives the event, pulls active user preferences, retrieves the desired notification template string, compiles it, and routes to Mock active workers.
