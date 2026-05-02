import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
const schema = z.object({ paidByInvestorId: z.string().optional().nullable(), description: z.string().min(1), category: z.enum(["COMPRA","CARTORIO_1","CARTORIO_2","REFORMA","MATERIAL","MAO_DE_OBRA","CONDOMINIO","IPTU","LAUDO","COMISSAO_CORRETOR","COMISSAO_IMOBILIARIA","LUZ","AGUA","ACORDO_SAIDA","MATRICULA","CERTIDAO","CHAVEIRO","LIMPEZA","INDICACAO","OUTROS"]), amount: z.coerce.number().nonnegative(), paymentDate: z.coerce.date().optional().nullable(), paymentMethod: z.string().optional().nullable(), notes: z.string().optional().nullable() });
export async function expensesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);
  app.get("/properties/:propertyId/expenses", async (request) => { const { propertyId } = z.object({ propertyId: z.string() }).parse(request.params); return prisma.expense.findMany({ where: { propertyId }, include: { paidByInvestor: true }, orderBy: { createdAt: "desc" } }); });
  app.post("/properties/:propertyId/expenses", async (request, reply) => { const { propertyId } = z.object({ propertyId: z.string() }).parse(request.params); const body = schema.parse(request.body); return reply.status(201).send(await prisma.expense.create({ data: { ...body, propertyId } })); });
  app.patch("/expenses/:id", async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); return prisma.expense.update({ where: { id }, data: schema.partial().parse(request.body) }); });
  app.delete("/expenses/:id", async (request) => { const { id } = z.object({ id: z.string() }).parse(request.params); await prisma.expense.delete({ where: { id } }); return { ok: true }; });
}
