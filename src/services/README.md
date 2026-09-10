# Frontend service layer

Clean interfaces for product capabilities whose **backend does not exist yet**.
Each module exposes the shape the real API will have, and is currently backed by
an **isolated mock adapter** (`*.mock.js`) so nothing fake leaks into the code
that talks to the live API in [`src/api/`](../api).

## Rules

- UI imports the service (`import { demoRequests } from '../services/demoRequests'`),
  never the mock directly.
- The mock lives in its own file and is the only place sample data is produced.
- When the real endpoint ships, add it to `src/api/resources/`, then point the
  service at `api.*` and delete the mock. The UI does not change.
- Mocks simulate latency and can be told to fail (`__mock.failNext()`), so
  loading and error states are exercised in development.

## Modules

| Module | Purpose | Real endpoint |
|---|---|---|
| `demoRequests` | "Book a demo" / contact form submissions | _none yet_ |
