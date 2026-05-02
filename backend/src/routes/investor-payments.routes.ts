import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
const schema = z.object({ investorId: z.string(), amount: z.coerce.number().nonnegative(), paymentDate: z.coerce.date().optional().nullable(), description: z.string().optional().nullable() });
export async function investorPaymentsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);
  app.get("/properties/:propertyId/payments", async (request) => { const { propertyId } = z.object({ propertyId: z.string() }).parse(request.params); return prisma.investorPayment.findMany({ where: { propertyId }, include: { investor: true }, orderBy: { createdAt: "desc" } }); });
  app.post("/properties/:propertyId/payments", async (request, reply) => { const { propertyId } = z.object({ propertyId: z.string() }).parse(request.params); return reply.status(201).send(await prisma.investorPayment.create({ data: { ...schema.parse(request.body), propertyId } })); });
  app.patch("/investor-payments/:id", async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); return prisma.investorPayment.update({ where: { id }, data: schema.partial().parse(request.body) }); });
  app.delete("/investor-payments/:id", async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); await prisma.investorPayment.delete({ where: { id } }); return { ok: true }; });
}
