import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
const schema = z.object({ cdiAnnualRate: z.coerce.number().min(0).max(100).optional().nullable(), notes: z.string().optional().nullable() });
async function current() { const first = await prisma.setting.findFirst(); return first || prisma.setting.create({ data: {} }); }
export async function settingsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);
  app.get("/settings", async () => current());
  app.patch("/settings", async (request) => { const setting = await current(); return prisma.setting.update({ where: { id: setting.id }, data: schema.parse(request.body) }); });
}
