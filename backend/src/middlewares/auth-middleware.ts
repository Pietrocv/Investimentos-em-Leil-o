import { FastifyReply, FastifyRequest } from "fastify";

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ message: "Token invalido ou ausente" });
  }
}
