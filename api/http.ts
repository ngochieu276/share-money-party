import type { Context } from "hono";
import type { ZodType } from "zod";

export async function readBody<T>(
  c: Context,
  schema: ZodType<T>,
): Promise<{ data: T; error?: never } | { data?: never; error: Response }> {
  const json = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      error: c.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        400,
      ),
    };
  }
  return { data: parsed.data };
}
