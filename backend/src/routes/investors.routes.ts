import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
const schema = z.object({ name: z.string().min(1), email: z.string().email().optional().nullable(), phone: z.string().optional().nullable(), document: z.string().optional().nullable(), notes: z.string().optional().nullable() });
export async function investorsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);
  app.get("/investors", async () => prisma.investor.findMany({ orderBy: { name: "asc" } }));
  app.post("/investors", async (request, reply) => reply.status(201).send(await prisma.investor.create({ data: schema.parse(request.body) })));
  app.get("/investors/:id", async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); return prisma.investor.findUniqueOrThrow({ where: { id }, include: { propertyInvestors: { include: { property: true } }, payments: true } }); });
  app.patch("/investors/:id", async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); return prisma.investor.update({ where: { id }, data: schema.partial().parse(request.body) }); });
  app.delete("/investors/:id", async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); await prisma.investor.delete({ where: { id } }); return { ok: true }; });
}
