import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { calculateDashboardSummary } from "../services/financial-calculations.js";
export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard/summary", { preHandler: [authMiddleware] }, async () => {
    const properties = await prisma.property.findMany({ include: { expenses: true, investors: true, payments: true } });
    return calculateDashboardSummary(properties);
  });
}
