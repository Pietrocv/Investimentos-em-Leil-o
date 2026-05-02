import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const body = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6) }).parse(request.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return reply.status(409).send({ message: "Email ja cadastrado" });
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({ data: { name: body.name, email: body.email, passwordHash }, select: { id: true, name: true, email: true, createdAt: true } });
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return reply.status(201).send({ user, token });
  });

  app.post("/auth/login", async (request, reply) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return reply.status(401).send({ message: "Credenciais invalidas" });
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  });

  app.get("/auth/me", { preHandler: [authMiddleware] }, async (request) => {
    const id = (request.user as any).sub;
    return prisma.user.findUniqueOrThrow({ where: { id }, select: { id: true, name: true, email: true, createdAt: true } });
  });
}
