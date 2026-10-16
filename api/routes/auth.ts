import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authMiddleware, publicUser, signToken, type AppEnv } from "../auth.ts";
import { prisma } from "../db.ts";
import { readBody } from "../http.ts";

const registerSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(100),
  name: z.string().trim().min(1).max(80),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(1).max(100),
});

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/register", async (c) => {
  const parsed = await readBody(c, registerSchema);
  if (parsed.error) return parsed.error;
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return c.json({ error: "Email already registered" }, 409);
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.name,
    },
  });
  const token = await signToken(user.id);
  return c.json({ token, user: publicUser(user) }, 201);
});

authRoutes.post("/login", async (c) => {
  const parsed = await readBody(c, loginSchema);
  if (parsed.error) return parsed.error;
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ error: "Invalid email or password" }, 401);
  }
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return c.json({ error: "Invalid email or password" }, 401);
  }
  const token = await signToken(user.id);
  return c.json({ token, user: publicUser(user) });
});

const me = new Hono<AppEnv>();
me.use("*", authMiddleware);
me.get("/me", (c) => {
  return c.json({ user: publicUser(c.get("user")) });
});

authRoutes.route("/", me);
