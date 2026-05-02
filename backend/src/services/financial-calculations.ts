type Money = number | string | { toNumber: () => number } | null | undefined;

function n(value: Money) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "object" && "toNumber" in value) return value.toNumber();
  return Number(value) || 0;
}

export function calculateMonthsBetweenDates(startDate?: Date | string | null, endDate?: Date | string | null) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth());
}

export function calculatePropertySummary(property: any) {
  const totalPurchase = n(property.purchasePrice);
  const totalExtraExpenses = (property.expenses || []).reduce((sum: number, expense: any) => sum + n(expense.amount), 0);
  const totalCost = totalPurchase + totalExtraExpenses;
  const expectedSale = n(property.expectedSalePrice);
  const finalSale = n(property.finalSalePrice);
  const expectedProfit = expectedSale ? expectedSale - totalCost : null;
  const finalProfit = finalSale ? finalSale - totalCost : expectedProfit;
  const expectedProfitPercent = expectedProfit !== null && totalCost > 0 ? expectedProfit / totalCost : null;
  const finalProfitPercent = finalProfit !== null && totalCost > 0 ? finalProfit / totalCost : null;
  return {
    totalPurchase,
    totalExtraExpenses,
    totalCost,
    expectedSalePrice: expectedSale || null,
    finalSalePrice: finalSale || null,
    expectedProfit,
    finalProfit,
    expectedProfitPercent,
    finalProfitPercent,
    timeInMonths: calculateMonthsBetweenDates(property.purchaseDate, property.saleDate),
    saleStatus: property.saleDate ? "Vendido" : "Venda pendente"
  };
}

export function calculateInvestorReturns(property: any) {
  const summary = calculatePropertySummary(property);
  const links = property.investors || [];
  const payments = property.payments || [];
  const totalContributions = links.reduce((sum: number, link: any) => sum + n(link.initialContribution), 0);
  return links.map((link: any) => {
    const manualPercent = link.splitType === "PERCENTUAL_MANUAL" ? n(link.ownershipPercent) / 100 : null;
    const ownershipPercent = manualPercent !== null ? manualPercent : totalContributions > 0 ? n(link.initialContribution) / totalContributions : 0;
    const expectedProfit = summary.expectedProfit ?? 0;
    const finalProfit = summary.finalProfit ?? expectedProfit;
    const investorExpectedProfit = expectedProfit * ownershipPercent;
    const investorFinalProfit = finalProfit * ownershipPercent;
    const investorExpectedReturn = n(link.initialContribution) + investorExpectedProfit;
    const investorFinalReturn = n(link.initialContribution) + investorFinalProfit;
    const amountAlreadyPaid = payments.filter((p: any) => p.investorId === link.investorId).reduce((sum: number, p: any) => sum + n(p.amount), 0);
    const balanceToPay = investorFinalReturn - amountAlreadyPaid;
    return {
      ...link,
      ownershipPercent: ownershipPercent * 100,
      profitPercent: link.profitPercent ? n(link.profitPercent) : ownershipPercent * 100,
      expectedReturn: investorExpectedReturn,
      finalReturn: investorFinalReturn,
      amountAlreadyPaid,
      balanceToPay
    };
  });
}

export function calculateDashboardSummary(properties: any[]) {
  const enriched = properties.map((property) => ({ property, summary: calculatePropertySummary(property) }));
  const totals = enriched.reduce((acc, item) => {
    acc.totalInvested += item.summary.totalPurchase;
    acc.totalExtraExpenses += item.summary.totalExtraExpenses;
    acc.totalCost += item.summary.totalCost;
    acc.totalSold += item.summary.finalSalePrice || 0;
    acc.expectedProfit += item.summary.expectedProfit || 0;
    acc.finalProfit += item.summary.finalProfit || 0;
    return acc;
  }, { totalInvested: 0, totalExtraExpenses: 0, totalCost: 0, totalSold: 0, expectedProfit: 0, finalProfit: 0 });
  const sold = properties.filter((p) => p.status === "VENDIDO").length;
  return {
    totalProperties: properties.length,
    totalInvested: totals.totalInvested,
    totalExtraExpenses: totals.totalExtraExpenses,
    totalCost: totals.totalCost,
    totalSold: totals.totalSold,
    expectedProfit: totals.expectedProfit,
    finalProfit: totals.finalProfit,
    averageProfitPercent: totals.totalCost > 0 ? totals.finalProfit / totals.totalCost : 0,
    soldProperties: sold,
    activeProperties: properties.length - sold,
    topProfitProperties: enriched.sort((a, b) => (b.summary.finalProfit || 0) - (a.summary.finalProfit || 0)).slice(0, 5).map(({ property, summary }) => ({ id: property.id, name: property.name, profit: summary.finalProfit })),
    pendingSaleProperties: properties.filter((p) => p.status !== "VENDIDO").map((p) => ({ id: p.id, name: p.name, status: p.status, expectedSalePrice: n(p.expectedSalePrice) }))
  };
}
