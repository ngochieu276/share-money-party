# Share Party

Split a drinking-party bill after the night is over. Members, attendees, betting matches, and a settlement table that always adds up to the receipt.

## Local setup

```bash
# Postgres on host port 5433
docker compose up -d

# API — http://localhost:8080
cd api
cp .env.example .env
deno install
deno task db:generate
deno task db:migrate:deploy
deno task dev

# Web — http://localhost:5173
cd web
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), create an account, add members, then log a party.

## Deploy

### API (Fly.io)

From `api/`:

1. `fly apps create` (set `app` in `fly.toml`)
2. `fly secrets set DATABASE_URL=... JWT_SECRET=... FRONTEND_ORIGIN=https://your-frontend.vercel.app,http://localhost:5173`
3. `fly deploy`

Health check: `GET /health`. Release command runs `prisma migrate deploy`. Do not bake `DATABASE_URL` into the image.

### Web (Vercel)

Root directory: `web`.

Environment:

- `NEXT_PUBLIC_API_URL` — Fly API origin
- `NEXT_PUBLIC_SITE_URL` — this Vercel origin

When the frontend URL changes, update `FRONTEND_ORIGIN` and redeploy the API.

## Formula

`S2 = S0 − S1`, `A0 = S2 / N`, each person pays `A0 + Li` (their betting losses).
