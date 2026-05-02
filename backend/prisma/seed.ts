import { PrismaClient, ExpenseCategory, PropertyStatus, PropertyType, SplitType } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

const expenseSets: Record<string, [string, ExpenseCategory, number][]> = {
  "Casa Esplanada V": [["Registro e ITBI", "CARTORIO_1", 4200], ["Materiais", "MATERIAL", 7800], ["Mao de obra", "MAO_DE_OBRA", 6500], ["Laudo", "LAUDO", 650], ["Agua", "AGUA", 320], ["Luz", "LUZ", 280], ["IPTU", "IPTU", 900], ["Comissao imobiliaria", "COMISSAO_IMOBILIARIA", 6200]],
  "Aracati 108 A": [["Condominio anterior", "CONDOMINIO", 2600], ["Mao de obra", "MAO_DE_OBRA", 5400], ["Material obra", "MATERIAL", 4300], ["Cartorio", "CARTORIO_1", 3900], ["Pia", "MATERIAL", 850], ["Piso", "MATERIAL", 1900], ["Condominio", "CONDOMINIO", 1800]],
  "Montana B13 01": [["Garantidora", "OUTROS", 1450], ["Pia", "MATERIAL", 900], ["Mao de obra", "MAO_DE_OBRA", 6200], ["Material", "MATERIAL", 5100], ["Condominio", "CONDOMINIO", 2200], ["Laudo", "LAUDO", 650], ["IPTU", "IPTU", 700], ["Comissao imobiliaria prevista", "COMISSAO_IMOBILIARIA", 5600]],
  "Recanto Jovens 02 A8": [["Acordo saida", "ACORDO_SAIDA", 2500], ["Condominio", "CONDOMINIO", 2100], ["IPTU", "IPTU", 680], ["Mao de obra", "MAO_DE_OBRA", 5800], ["Material de obra", "MATERIAL", 4700], ["Cartorio", "CARTORIO_2", 3700], ["Pia", "MATERIAL", 850], ["Laudo", "LAUDO", 650]],
  "Lisboa Life": [["Cartorio", "CARTORIO_1", 4100], ["Reforma", "REFORMA", 7900], ["Condominio", "CONDOMINIO", 1500], ["Comissao corretor", "COMISSAO_CORRETOR", 4500]],
  "Ed Papaver": [["Cartorio", "CARTORIO_1", 4000], ["Material", "MATERIAL", 5600], ["Mao de obra", "MAO_DE_OBRA", 6400], ["IPTU", "IPTU", 600], ["Comissao imobiliaria", "COMISSAO_IMOBILIARIA", 5200]]
};

async function main() {
  await prisma.user.upsert({ where: { email: "pietro@teste.com" }, update: {}, create: { name: "Pietro", email: "pietro@teste.com", passwordHash: await bcrypt.hash("123456", 10) } });
  const investorNames = ["Pietro", "Victor", "Rodrigo", "Jeff", "Bia", "Jeferson", "Izabela"];
  const investors: Record<string, string> = {};
  for (const name of investorNames) {
    const investor = await prisma.investor.upsert({ where: { id: name.toLowerCase() }, update: {}, create: { id: name.toLowerCase(), name, email: `${name.toLowerCase()}@exemplo.com` } });
    investors[name] = investor.id;
  }
  const properties = [
    { name: "Casa Esplanada V", purchasePrice: 75305.50, currentAppraisal: 170000, expectedSalePrice: 153000, finalSalePrice: 145279.04, status: "VENDIDO", links: [["Pietro", 37652.75], ["Victor", 37652.75]] },
    { name: "Aracati 108 A", purchasePrice: 67068.27, currentAppraisal: 135000, expectedSalePrice: 133000, finalSalePrice: 133000, status: "VENDIDO", links: [["Pietro", 67068.27]] },
    { name: "Montana B13 01", purchasePrice: 62819.40, currentAppraisal: 153000, expectedSalePrice: 142000, status: "A_VENDA", links: [["Pietro", 31409.70], ["Jeferson", 31409.70]] },
    { name: "Recanto Jovens 02 A8", purchasePrice: 59444.27, currentAppraisal: 145000, expectedSalePrice: 140000, status: "A_VENDA", links: [["Bia", 59444.27]] },
    { name: "Lisboa Life", purchasePrice: 70000, currentAppraisal: 135000, expectedSalePrice: 128500, finalSalePrice: 128500, status: "VENDIDO", links: [["Pietro", 35000], ["Rodrigo", 35000]] },
    { name: "Ed Papaver", purchasePrice: 71404.20, currentAppraisal: 136800, expectedSalePrice: 127640, finalSalePrice: 127640, status: "VENDIDO", links: [["Izabela", 71404.20]] }
  ] as const;
  for (const item of properties) {
    const property = await prisma.property.create({ data: { name: item.name, type: PropertyType.APARTAMENTO, status: item.status as PropertyStatus, purchasePrice: item.purchasePrice, currentAppraisal: item.currentAppraisal, expectedSalePrice: item.expectedSalePrice, finalSalePrice: "finalSalePrice" in item ? item.finalSalePrice : undefined, city: "Sete Lagoas", purchaseDate: new Date("2024-01-15"), saleDate: item.status === "VENDIDO" ? new Date("2024-09-15") : undefined, condominiumMonths: 3, condominiumMonthlyValue: 450, condominiumTotal: 1350, registryNumber: `MAT-${item.name.slice(0, 3).toUpperCase()}`, iptuNumber: `IPTU-${item.name.length}`, notes: "Registro criado pelo seed do MVP." } });
    for (const [description, category, amount] of expenseSets[item.name]) await prisma.expense.create({ data: { propertyId: property.id, description, category, amount, paymentDate: new Date("2024-03-10") } });
    for (const [name, contribution] of item.links) await prisma.propertyInvestor.create({ data: { propertyId: property.id, investorId: investors[name], initialContribution: contribution, splitType: SplitType.POR_APORTE } });
    const links = await prisma.propertyInvestor.findMany({ where: { propertyId: property.id } });
    const total = links.reduce((s, l) => s + Number(l.initialContribution), 0);
    for (const link of links) await prisma.propertyInvestor.update({ where: { id: link.id }, data: { ownershipPercent: total ? Number(link.initialContribution) / total * 100 : 0 } });
  }
  await prisma.setting.create({ data: { cdiAnnualRate: 10.65, notes: "Configuracao inicial para comparacao futura com CDI." } });
}
main().finally(async () => prisma.$disconnect());
