import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { calculateInvestorReturns, calculatePropertySummary } from "../services/financial-calculations.js";

const propertySchema = z.object({
  name: z.string().min(1), unit: z.string().optional().nullable(), city: z.string().optional().nullable(), district: z.string().optional().nullable(), address: z.string().optional().nullable(),
  type: z.enum(["APARTAMENTO", "CASA", "LOTE", "OUTRO"]).default("APARTAMENTO"), status: z.enum(["EM_ANALISE", "ARREMATADO", "EM_REGULARIZACAO", "EM_REFORMA", "A_VENDA", "VENDIDO", "CANCELADO"]).default("EM_ANALISE"),
  purchasePrice: z.coerce.number().nonnegative(), currentAppraisal: z.coerce.number().nonnegative().optional().nullable(), oldAppraisal: z.coerce.number().nonnegative().optional().nullable(), expectedSalePrice: z.coerce.number().nonnegative().optional().nullable(), finalSalePrice: z.coerce.number().nonnegative().optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(), appraisalDate: z.coerce.date().optional().nullable(), saleDate: z.coerce.date().optional().nullable(), returnDate: z.coerce.date().optional().nullable(),
  registryNumber: z.string().optional().nullable(), iptuNumber: z.string().optional().nullable(), buyerCpf: z.string().optional().nullable(), condominiumMonths: z.coerce.number().int().nonnegative().optional().nullable(), condominiumMonthlyValue: z.coerce.number().nonnegative().optional().nullable(), condominiumTotal: z.coerce.number().nonnegative().optional().nullable(), condominiumLastPaidMonth: z.string().optional().nullable(), notes: z.string().optional().nullable()
});
const include = { expenses: { include: { paidByInvestor: true } }, investors: { include: { investor: true } }, payments: { include: { investor: true } } };

export async function propertiesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);
  app.get("/properties", async () => prisma.property.findMany({ include, orderBy: { createdAt: "desc" } }));
  app.post("/properties", async (request, reply) => {
    const body = propertySchema.parse(request.body);
    const property = await prisma.property.create({ data: body });
    return reply.status(201).send(property);
  });
  app.get("/properties/:id", async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const property = await prisma.property.findUniqueOrThrow({ where: { id }, include });
    return { ...property, summary: calculatePropertySummary(property), investorReturns: calculateInvestorReturns(property) };
  });
  app.patch("/properties/:id", async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = propertySchema.partial().parse(request.body);
    return prisma.property.update({ where: { id }, data: body });
  });
  app.delete("/properties/:id", async (request) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.property.delete({ where: { id } });
    return { ok: true };
  });
}
