# Prompt for the backend team — fix stuck async jobs (issue #3b)

**Status (2026-09-12): implemented, not yet deployed.** Everything this
prompt asks for exists in `vetta-backend` on branch `fix/empty-dist-on-rebuild`
(worker entrypoint, deploy recipes in `docs/deploying-workers.md`, the Vercel
Cron drain as an explicit fallback, full error/retry taxonomy). What remains
is operational: merge the branch into whatever Vercel tracks, and provision
the worker service (Render blueprint is ready) with its env vars. See
`BACKEND_ISSUES.md` issue #3b for the current status note.

Copy everything below the line into your backend repo's assistant / hand it to whoever owns deployment.

---

## Problem

Our NestJS + Prisma + BullMQ backend is deployed on **Vercel** (`vetta-backend.vercel.app`).
Every queued job is stuck forever:

- `POST /research` returns `201` with `status: "PENDING"`.
- `GET /research/:id` still shows `status: PENDING`, `attempts: 0`, `provider: null`,
  `model: null`, `result: null`, `completedAt: null` — indefinitely (verified after >1 hour).
- It never becomes `COMPLETED` or `FAILED`.
- `GET /research/cost-analytics` stays `{ totalCostUsd: 0 }`.
- Same symptom for `POST /imports/leads` and the campaign pipeline stages (`start` → validate → assign-leads → …).

### Root cause

Vercel serverless functions are **request-scoped** — they die when the HTTP response is sent.
There is **no long-running process to run the BullMQ workers / queue processors**, so jobs are
enqueued but nothing consumes them. `@nestjs/bull` / `bullmq` `Worker`s and `@Processor()` classes
only run inside a persistent Node process.

## Required fix — run the workers as a separate always-on service (recommended)

Split the deployment into two runtimes sharing the **same Redis and Postgres**:

1. **Web (keep on Vercel)** — HTTP only. Register queues as *producers* (so controllers can
   `queue.add(...)`), but **do not** start the processors here.
2. **Worker (new, always-on)** — a long-lived Node process that runs the BullMQ workers. Host it
   anywhere that supports a persistent process: Railway, Render (Background Worker), Fly.io, a Docker
   container on ECS/Cloud Run, or a small VM.

Concrete steps:

- Add an env flag, e.g. `APP_ROLE=web | worker` (or `WORKER=true`).
- In `AppModule` (or a `WorkerModule`), only import/register the `BullModule.registerQueue`
  **processors** (`@Processor()` providers, `BullBoard`, cron schedulers, `@nestjs/schedule`
  `ScheduleModule`) when `APP_ROLE=worker`. The web build registers the queues **without** processors.
- Add a second entrypoint that boots Nest **without** the HTTP listener for the worker:

  ```ts
  // src/worker.ts
  import { NestFactory } from '@nestjs/core';
  import { WorkerModule } from './worker.module';

  async function bootstrap() {
    const app = await NestFactory.createApplicationContext(WorkerModule);
    await app.init();
    // BullMQ Workers registered by @Processor() start consuming here and stay alive.
  }
  bootstrap();
  ```

- `package.json`: `"start:worker": "node dist/worker.js"`.
- Deploy that command as a Background Worker / service on the chosen host, with the **same**
  `REDIS_URL`, `DATABASE_URL`, `ANTHROPIC_API_KEY` (or per-org provider creds), `AWS_*`, etc.
- Make sure Redis is a shared managed instance reachable from both (Upstash, Redis Cloud, etc.),
  **not** an ephemeral one.
- Confirm the BullMQ connection uses `maxRetriesPerRequest: null` and `enableReadyCheck: false`
  (required by BullMQ for workers).

### Acceptance test

```
POST /research { "leadId": "<id>", "type": "COMPANY_RESEARCH" }   -> 201 PENDING
# within a few seconds:
GET /research/:id  -> status RUNNING, then COMPLETED
#   attempts >= 1, provider = "claude" (or configured), model set
#   data.result has companySummary, painPoints[], callAngle, confidenceScore
GET /research/cost-analytics -> totalCostUsd > 0
```

Also verify `POST /imports/leads` finishes and a campaign `start` progresses through its pipeline.

## Alternative A — Vercel Cron drains the queue (Vercel-only, quick but limited)

If a separate service isn't possible right now:

1. Add a protected endpoint `POST /internal/jobs/drain` that pulls up to N jobs off each queue and
   processes them **inline** (reuse the existing processor logic), guarded by a shared secret header.
2. Add a `vercel.json` cron calling it every minute:

   ```json
   { "crons": [{ "path": "/internal/jobs/drain", "schedule": "* * * * *" }] }
   ```

Caveats: 1-minute minimum granularity, Vercel function timeout (10s Hobby / up to 60–300s Pro) —
long Claude calls may exceed it; process 1–2 jobs per invocation and rely on retries.

## Alternative B — synchronous processing on serverless

Make `POST /research` (and imports) `await` the processing instead of enqueuing, and return the
finished record. Simplest, but the request holds open for the full AI latency and will hit Vercel's
function timeout on anything slow or batched. Only viable if research calls are consistently fast.

---

**Recommendation:** Alternative A to unblock today, then the separate worker service as the real fix.
The frontend already starts jobs, polls `GET /research/:id` every 5s, renders `result`
(`companySummary` / `painPoints` / `callAngle` / `confidenceScore`), and shows cost — it needs no
changes once jobs actually complete.
