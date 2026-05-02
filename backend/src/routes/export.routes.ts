import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { calculateInvestorReturns, calculatePropertySummary } from "../services/financial-calculations.js";

function csvValue(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function row(values: unknown[]) {
  return values.map(csvValue).join(";");
}

export async function exportRoutes(app: FastifyInstance) {
  app.get("/export/spreadsheet.csv", { preHandler: [authMiddleware] }, async (_request, reply) => {
    const properties = await prisma.property.findMany({
      include: {
        expenses: { include: { paidByInvestor: true } },
        investors: { include: { investor: true } },
        payments: { include: { investor: true } }
      },
      orderBy: { purchaseDate: "asc" }
    });

    const lines: string[] = [];
    lines.push(row(["IMOVEIS"]));
    lines.push(row(["Nome", "Unidade", "Cidade", "Bairro", "Tipo", "Status", "Compra", "Custos", "Custo total", "Venda prevista", "Venda realizada", "Lucro", "Data compra", "Data venda"]));
    for (const property of properties) {
      const summary = calculatePropertySummary(property);
      lines.push(row([
        property.name,
        property.unit,
        property.city,
        property.district,
        property.type,
        property.status,
        summary.totalPurchase,
        summary.totalExtraExpenses,
        summary.totalCost,
        property.expectedSalePrice,
        property.finalSalePrice,
        summary.finalProfit,
        property.purchaseDate?.toISOString().slice(0, 10),
        property.saleDate?.toISOString().slice(0, 10)
      ]));
    }

    lines.push("");
    lines.push(row(["CUSTOS"]));
    lines.push(row(["Imovel", "Descricao", "Categoria", "Valor", "Data", "Pago por", "Metodo", "Observacoes"]));
    for (const property of properties) {
      for (const expense of property.expenses) {
        lines.push(row([property.name, expense.description, expense.category, expense.amount, expense.paymentDate?.toISOString().slice(0, 10), expense.paidByInvestor?.name || "Geral", expense.paymentMethod, expense.notes]));
      }
    }

    lines.push("");
    lines.push(row(["INVESTIDORES POR IMOVEL"]));
    lines.push(row(["Imovel", "Investidor", "Aporte", "% Participacao", "Custo dividido", "Custo direto", "Custo total individual", "Retorno previsto", "Retorno realizado", "Pago", "Saldo"]));
    for (const property of properties) {
      for (const investor of calculateInvestorReturns(property)) {
        lines.push(row([property.name, investor.investor?.name, investor.initialContribution, investor.ownershipPercent, investor.sharedExpenses, investor.directExpenses, investor.totalInvestorCost, investor.expectedReturn, investor.finalReturn, investor.amountAlreadyPaid, investor.balanceToPay]));
      }
    }

    lines.push("");
    lines.push(row(["PAGAMENTOS"]));
    lines.push(row(["Imovel", "Investidor", "Valor", "Data", "Descricao"]));
    for (const property of properties) {
      for (const payment of property.payments) {
        lines.push(row([property.name, payment.investor.name, payment.amount, payment.paymentDate?.toISOString().slice(0, 10), payment.description]));
      }
    }

    reply.header("Content-Type", "text/csv; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="investindo-com-leilao.csv"');
    return `\uFEFF${lines.join("\n")}`;
  });
}
