import { PrismaClient, ExpenseCategory, PropertyStatus, PropertyType, SplitType } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

const expenseSets: Record<string, [string, ExpenseCategory, number][]> = {
  "Casa Esplanada V": [["Registro e ITBI", "CARTORIO_1", 4200], ["Materiais", "MATERIAL", 7800], ["Mao de obra", "MAO_DE_OBRA", 6500], ["Laudo", "LAUDO", 650], ["Agua", "AGUA", 320], ["Luz", "LUZ", 280], ["IPTU", "IPTU", 900], ["Comissao imobiliaria", "COMISSAO_IMOBILIARIA", 6200]],
  "Aracati 108 A": [["Condominio anterior", "CONDOMINIO", 2600], ["Mao de obra", "MAO_DE_OBRA", 5400], ["Material obra", "MATERIAL", 4300], ["Cartorio", "CARTORIO_1", 3900], ["Pia", "MATERIAL", 850], ["Piso", "MATERIAL", 1900], ["Condominio", "CONDOMINIO", 1800]],
  "Jaspe 07": [["Gasto cartorio 1", "CARTORIO_1", 5372.05], ["Matricula", "MATRICULA", 130], ["Laudo", "LAUDO", 750], ["Mao de obra", "MAO_DE_OBRA", 1000], ["Mao de obra complementar", "MAO_DE_OBRA", 20], ["Condominio", "CONDOMINIO", 595], ["Vazamento, tintas, lonas e texturas", "MATERIAL", 731], ["Material de reformas", "MATERIAL", 180], ["Limpeza e finalizacao", "LIMPEZA", 200], ["Material de limpeza", "MATERIAL", 150], ["Cartorio 2", "CARTORIO_2", 8804], ["Matricula 2", "MATRICULA", 146], ["Matricula 3", "MATRICULA", 118.24], ["IPTU e ultimo condominio", "IPTU", 775], ["Comissao loja", "COMISSAO_IMOBILIARIA", 3000]],
  "Monte Siao I P 201": [["Cartorio 1", "CARTORIO_1", 6414.41], ["Reforma 1", "REFORMA", 700], ["Cartorio 2", "CARTORIO_2", 8680], ["Condominio montante", "CONDOMINIO", 600], ["Condominio divida", "CONDOMINIO", 6484.01], ["Comissao corretor", "COMISSAO_CORRETOR", 1100], ["Comissao loja", "COMISSAO_IMOBILIARIA", 3000]],
  "Monte Siao V N 201": [["Cartorio 1", "CARTORIO_1", 6649.29], ["Reforma", "REFORMA", 750], ["Condominio", "CONDOMINIO", 1853.06], ["Chaveiro", "CHAVEIRO", 70], ["IPTU", "IPTU", 370.09], ["Cartorio 2", "CARTORIO_2", 5311.47], ["Comissao loja", "COMISSAO_IMOBILIARIA", 3000]],
  "Montana A15 01": [["Cartorio 1", "CARTORIO_1", 5641.34], ["Cartorio 2", "CARTORIO_2", 7827.85], ["Laudo", "LAUDO", 750], ["Material eletrico", "MATERIAL", 101.85], ["Chuveiro", "MATERIAL", 65], ["Mao de obra e macaneta", "MAO_DE_OBRA", 672], ["Limpeza", "LIMPEZA", 100], ["Condominio", "CONDOMINIO", 450], ["Matricula onus", "MATRICULA", 246.97], ["Comissao corretor", "COMISSAO_CORRETOR", 2500], ["Comissao loja", "COMISSAO_IMOBILIARIA", 2500]],
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
    { name: "Casa Esplanada V", purchasePrice: 75305.50, currentAppraisal: 170000, expectedSalePrice: 153000, finalSalePrice: 145279.04, status: "VENDIDO", purchaseDate: "2025-01-15", saleDate: "2026-02-15", links: [["Pietro", 37652.75], ["Victor", 37652.75]] },
    { name: "Aracati 108 A", purchasePrice: 67068.27, currentAppraisal: 135000, expectedSalePrice: 133000, finalSalePrice: 133000, status: "VENDIDO", purchaseDate: "2026-01-15", saleDate: "2026-09-15", links: [["Pietro", 67068.27]] },
    { name: "Jaspe 07", unit: "07", purchasePrice: 62624.60, currentAppraisal: 142000, expectedSalePrice: 131000, finalSalePrice: 131000, status: "VENDIDO", purchaseDate: "2024-10-01", saleDate: "2025-07-01", links: [["Pietro", 42626.60], ["Victor", 20000]] },
    { name: "Monte Siao I P 201", unit: "P 201", purchasePrice: 67068.27, currentAppraisal: 140000, expectedSalePrice: 132000, finalSalePrice: 132000, status: "VENDIDO", purchaseDate: "2025-06-26", saleDate: "2025-10-26", links: [["Pietro", 67068.27]] },
    { name: "Monte Siao V N 201", unit: "N 201", purchasePrice: 76464.05, currentAppraisal: 132000, expectedSalePrice: 110000, finalSalePrice: 110000, status: "VENDIDO", purchaseDate: "2025-07-14", saleDate: "2025-12-26", links: [["Pietro", 76464.05]] },
    { name: "Montana A15 01", unit: "A15 01", district: "Ypiranga", purchasePrice: 73400, currentAppraisal: 138000, expectedSalePrice: 128270.28, finalSalePrice: 128270.28, status: "VENDIDO", purchaseDate: "2025-01-15", saleDate: "2025-09-15", links: [["Pietro", 25700], ["Jeff", 36700], ["Bia", 11000]] },
    { name: "Montana B13 01", unit: "B13 01", district: "Ypiranga", purchasePrice: 62819.40, currentAppraisal: 153000, expectedSalePrice: 142000, status: "A_VENDA", purchaseDate: "2026-01-15", links: [["Pietro", 31409.70], ["Jeferson", 31409.70]] },
    { name: "Recanto Jovens 02 A8", purchasePrice: 59444.27, currentAppraisal: 145000, expectedSalePrice: 140000, status: "A_VENDA", purchaseDate: "2026-01-15", links: [["Bia", 59444.27]] },
    { name: "Lisboa Life", purchasePrice: 70000, currentAppraisal: 135000, expectedSalePrice: 128500, finalSalePrice: 128500, status: "VENDIDO", purchaseDate: "2024-01-15", saleDate: "2024-09-15", links: [["Pietro", 35000], ["Rodrigo", 35000]] },
    { name: "Ed Papaver", purchasePrice: 71404.20, currentAppraisal: 136800, expectedSalePrice: 127640, finalSalePrice: 127640, status: "VENDIDO", purchaseDate: "2025-01-15", saleDate: "2025-09-15", links: [["Pietro", 71404.20]] }
  ] as const;
  for (const item of properties) {
    const existing = await prisma.property.findFirst({ where: { name: item.name } });
    const propertyData = { name: item.name, unit: "unit" in item ? item.unit : undefined, district: "district" in item ? item.district : undefined, type: PropertyType.APARTAMENTO, status: item.status as PropertyStatus, purchasePrice: item.purchasePrice, currentAppraisal: item.currentAppraisal, expectedSalePrice: item.expectedSalePrice, finalSalePrice: "finalSalePrice" in item ? item.finalSalePrice : undefined, city: "Sete Lagoas", purchaseDate: new Date(item.purchaseDate), saleDate: "saleDate" in item ? new Date(item.saleDate) : undefined, condominiumMonths: 3, condominiumMonthlyValue: 450, condominiumTotal: 1350, registryNumber: `MAT-${item.name.slice(0, 3).toUpperCase()}`, iptuNumber: `IPTU-${item.name.length}`, notes: "Registro criado pelo seed do MVP." };
    if (existing) {
      await prisma.property.update({ where: { id: existing.id }, data: propertyData });
      continue;
    }
    const property = await prisma.property.create({ data: propertyData });
    for (const [description, category, amount] of expenseSets[item.name]) await prisma.expense.create({ data: { propertyId: property.id, description, category, amount, paymentDate: new Date("2024-03-10") } });
    for (const [name, contribution] of item.links) await prisma.propertyInvestor.create({ data: { propertyId: property.id, investorId: investors[name], initialContribution: contribution, splitType: SplitType.POR_APORTE } });
    const links = await prisma.propertyInvestor.findMany({ where: { propertyId: property.id } });
    const total = links.reduce((s, l) => s + Number(l.initialContribution), 0);
    for (const link of links) await prisma.propertyInvestor.update({ where: { id: link.id }, data: { ownershipPercent: total ? Number(link.initialContribution) / total * 100 : 0 } });
  }
  const setting = await prisma.setting.findFirst();
  if (!setting) await prisma.setting.create({ data: { cdiAnnualRate: 10.65, notes: "Configuracao inicial para comparacao futura com CDI." } });
}
main().finally(async () => prisma.$disconnect());
