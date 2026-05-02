import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { calculateDashboardSummary } from "../services/financial-calculations.js";
export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard/summary", { preHandler: [authMiddleware] }, async (request) => {
    const userId = (request.user as any).sub;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    const properties = await prisma.property.findMany({ include: { expenses: true, investors: { include: { investor: true } }, payments: true } });
    return calculateDashboardSummary(properties, user);
  });
}
