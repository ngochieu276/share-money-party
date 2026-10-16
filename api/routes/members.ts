import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, type AppEnv } from "../auth.ts";
import { cachedRead, invalidateUserReads } from "../cache.ts";
import { prisma } from "../db.ts";
import { readBody } from "../http.ts";

const nameSchema = z.string().trim().min(1).max(80);

const createSchema = z.object({
  name: nameSchema,
});

const importSchema = z.object({
  names: z.array(nameSchema).min(1).max(200),
});

const updateSchema = z.object({
  name: nameSchema,
});

export const memberRoutes = new Hono<AppEnv>();
memberRoutes.use("*", authMiddleware);

memberRoutes.get("/", async (c) => {
  const userId = c.get("user").id;
  const members = await cachedRead(userId, "members", () =>
    prisma.member.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  );
  return c.json({ members });
});

memberRoutes.post("/", async (c) => {
  const parsed = await readBody(c, createSchema);
  if (parsed.error) return parsed.error;
  const userId = c.get("user").id;
  const member = await prisma.member.create({
    data: { userId, name: parsed.data.name },
  });
  invalidateUserReads(userId);
  return c.json({ member }, 201);
});

memberRoutes.post("/import", async (c) => {
  const parsed = await readBody(c, importSchema);
  if (parsed.error) return parsed.error;
  const userId = c.get("user").id;
  const unique = [...new Set(parsed.data.names)];
  await prisma.member.createMany({
    data: unique.map((name) => ({ userId, name })),
  });
  invalidateUserReads(userId);
  const members = await prisma.member.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return c.json({ members }, 201);
});

memberRoutes.patch("/:id", async (c) => {
  const parsed = await readBody(c, updateSchema);
  if (parsed.error) return parsed.error;
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const existing = await prisma.member.findFirst({ where: { id, userId } });
  if (!existing) return c.json({ error: "Not found" }, 404);
  const member = await prisma.member.update({
    where: { id },
    data: { name: parsed.data.name },
  });
  invalidateUserReads(userId);
  return c.json({ member });
});

memberRoutes.delete("/:id", async (c) => {
  const userId = c.get("user").id;
  const id = c.req.param("id");
  const existing = await prisma.member.findFirst({ where: { id, userId } });
  if (!existing) return c.json({ error: "Not found" }, 404);
  const used = await prisma.partyAttendee.count({ where: { memberId: id } });
  if (used > 0) {
    return c.json({ error: "Member is in a party" }, 409);
  }
  await prisma.member.delete({ where: { id } });
  invalidateUserReads(userId);
  return c.json({ ok: true });
});
