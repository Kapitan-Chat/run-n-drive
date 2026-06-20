# run-n-drive

Self-contained deployment monorepo for the **KapitanChat** stack:

| Service | Stack | Internal port | Source |
|---|---|---|---|
| `frontend` | React + Vite (served by nginx) | 80 | `KapitanChat/kapitan_chat_frontend` |
| `backend` | Django + DRF + Channels (ASGI/uvicorn) | 8000 | `KapitanChat/kapitan_chat_backend` |
| `storage` | FastAPI file microservice | 8001 | `StorageService` |
| `redis` | Redis (Django Channels layer) | 6379 | — |

The backend signs JWTs and StorageService verifies them, so both share the same
`SECRET_KEY` / `JWT_ALGORITHM`.

## Local development

```bash
cp .env.example .env      # adjust values if needed
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend / Swagger: http://localhost:8000/swagger/
- Storage docs: http://localhost:8001/docs

## Production (Coolify)

`compose.coolify.yaml` is tailored for [Coolify](https://coolify.io): its proxy
(Traefik) terminates TLS and forwards plain HTTP. Routing is declared via
`SERVICE_FQDN_*` magic variables — single domain, path-based:

```
/api/file  -> storage   (most specific, matched first)
/api, /ws  -> backend
/          -> frontend  (catch-all)
```

1. Coolify → new **Docker Compose** resource pointing at this repo and
   `compose.coolify.yaml`.
2. Paste the environment variables (see `.env.example`) into Coolify's
   **Environment Variables** tab — set real secrets for `SECRET_KEY` and
   `REDIS_PASSWORD`, and `DJANGO_DEBUG=False`.
3. Point the domain's DNS at the Coolify host and deploy — Coolify issues the
   TLS certificate automatically.

> `VITE_*` are baked into the frontend bundle at build time and must be the
> public HTTPS URLs. Change the domain → rebuild the frontend.

## Configuration

All configuration is environment-driven; see `.env.example` for the full list.
Secrets (`.env`, `.env.production`) are git-ignored — never commit them.
