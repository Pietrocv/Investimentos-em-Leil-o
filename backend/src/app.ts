import Fastify from "fastify";
import cors from "@fastify/cors";
import authPlugin from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.routes.js";
import { propertiesRoutes } from "./routes/properties.routes.js";
import { expensesRoutes } from "./routes/expenses.routes.js";
import { investorsRoutes } from "./routes/investors.routes.js";
import { propertyInvestorsRoutes } from "./routes/property-investors.routes.js";
import { investorPaymentsRoutes } from "./routes/investor-payments.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { settingsRoutes } from "./routes/settings.routes.js";

export async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(authPlugin);
  app.get("/health", async () => ({ status: "ok" }));
  await app.register(authRoutes);
  await app.register(propertiesRoutes);
  await app.register(expensesRoutes);
  await app.register(investorsRoutes);
  await app.register(propertyInvestorsRoutes);
  await app.register(investorPaymentsRoutes);
  await app.register(dashboardRoutes);
  await app.register(settingsRoutes);
  app.setErrorHandler((error, _request, reply) => {
    if ((error as any).issues) return reply.status(400).send({ message: "Erro de validacao", issues: (error as any).issues });
    if ((error as any).code === "P2002") return reply.status(409).send({ message: "Registro duplicado" });
    app.log.error(error);
    return reply.status(500).send({ message: "Erro interno" });
  });
  return app;
}
