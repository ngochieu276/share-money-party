import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth.ts";
import { matchRoutes, nestedMatchRoutes } from "./routes/matches.ts";
import { memberRoutes } from "./routes/members.ts";
import { partyRoutes } from "./routes/parties.ts";

function allowedOrigins(): string[] {
  const extras = [
    Deno.env.get("FRONTEND_ORIGIN") ?? "",
    Deno.env.get("DEPLOY_FRONTEND") ?? "",
  ]
    .join(",")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return [...new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...extras,
  ])];
}

const origins = allowedOrigins();

const app = new Hono();

app.use(
  "*",
  cors({
    origin: origins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/members", memberRoutes);
app.route("/parties", partyRoutes);
app.route("/parties", nestedMatchRoutes);
app.route("/matches", matchRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = Number(Deno.env.get("PORT") ?? "8080");
Deno.serve({ port }, app.fetch);
