import type { MiddlewareHandler } from "hono";
import * as jose from "jose";
import type { User } from "./generated/prisma/client.ts";
import { prisma } from "./db.ts";

export type AppEnv = {
  Variables: {
    user: User;
  };
};

function jwtSecret(): Uint8Array {
  const secret = Deno.env.get("JWT_SECRET");
  if (!secret) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(secret);
}

export async function signToken(userId: string): Promise<string> {
  return await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwtSecret());
}

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const { payload } = await jose.jwtVerify(token, jwtSecret());
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
};

export function publicUser(user: User) {
  return { id: user.id, email: user.email, name: user.name };
}
