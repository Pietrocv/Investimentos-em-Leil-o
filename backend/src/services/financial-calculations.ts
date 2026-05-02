type Money = number | string | { toNumber: () => number } | null | undefined;

function n(value: Money) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "object" && "toNumber" in value) return value.toNumber();
  return Number(value) || 0;
}

function getPropertyYear(property: any) {
  const date = property.purchaseDate || property.createdAt;
  const parsed = date ? new Date(date) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.getFullYear() : "Sem ano";
}

function getOwnershipPercent(link: any, totalContributions: number) {
  if (link.splitType === "PERCENTUAL_MANUAL") return n(link.ownershipPercent) / 100;
  return totalContributions > 0 ? n(link.initialContribution) / totalContributions : 0;
}

function matchesInvestorUser(link: any, user?: any) {
  if (!user || !link?.investor) return false;
  const userEmail = String(user.email || "").trim().toLowerCase();
  const userName = String(user.name || "").trim().toLowerCase();
  const investorEmail = String(link.investor.email || "").trim().toLowerCase();
  const investorName = String(link.investor.name || "").trim().toLowerCase();
  return Boolean((userEmail && investorEmail && userEmail === investorEmail) || (userName && investorName && userName === investorName));
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
  const expenses = property.expenses || [];
  const totalContributions = links.reduce((sum: number, link: any) => sum + n(link.initialContribution), 0);
  return links.map((link: any) => {
    const ownershipPercent = getOwnershipPercent(link, totalContributions);
    const sharedExpenses = expenses.filter((expense: any) => !expense.paidByInvestorId).reduce((sum: number, expense: any) => sum + n(expense.amount) * ownershipPercent, 0);
    const directExpenses = expenses.filter((expense: any) => expense.paidByInvestorId === link.investorId).reduce((sum: number, expense: any) => sum + n(expense.amount), 0);
    const allocatedExpenses = sharedExpenses + directExpenses;
    const totalInvestorCost = n(link.initialContribution) + allocatedExpenses;
    const expectedProfit = summary.expectedProfit ?? 0;
    const finalProfit = summary.finalProfit ?? expectedProfit;
    const investorExpectedProfit = expectedProfit * ownershipPercent;
    const investorFinalProfit = finalProfit * ownershipPercent;
    const investorExpectedReturn = totalInvestorCost + investorExpectedProfit;
    const investorFinalReturn = totalInvestorCost + investorFinalProfit;
    const amountAlreadyPaid = payments.filter((p: any) => p.investorId === link.investorId).reduce((sum: number, p: any) => sum + n(p.amount), 0);
    const balanceToPay = investorFinalReturn - amountAlreadyPaid;
    return {
      ...link,
      ownershipPercent: ownershipPercent * 100,
      profitPercent: link.profitPercent ? n(link.profitPercent) : ownershipPercent * 100,
      sharedExpenses,
      directExpenses,
      allocatedExpenses,
      totalInvestorCost,
      expectedReturn: investorExpectedReturn,
      finalReturn: investorFinalReturn,
      amountAlreadyPaid,
      balanceToPay
    };
  });
}

function calculateTotals(properties: any[]) {
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
  return { enriched, totals, sold };
}

export function calculateDashboardSummary(properties: any[], user?: any) {
  const { enriched, totals, sold } = calculateTotals(properties);
  const yearGroups = properties.reduce<Record<string, any[]>>((acc, property) => {
    const year = String(getPropertyYear(property));
    acc[year] = acc[year] || [];
    acc[year].push(property);
    return acc;
  }, {});
  const years = Object.entries(yearGroups).map(([year, items]) => {
    const yearTotals = calculateTotals(items);
    return {
      year,
      totalProperties: items.length,
      totalInvested: yearTotals.totals.totalInvested,
      totalExtraExpenses: yearTotals.totals.totalExtraExpenses,
      totalCost: yearTotals.totals.totalCost,
      totalSold: yearTotals.totals.totalSold,
      expectedProfit: yearTotals.totals.expectedProfit,
      finalProfit: yearTotals.totals.totalSold - yearTotals.totals.totalCost,
      averageProfitPercent: yearTotals.totals.totalCost > 0 ? (yearTotals.totals.totalSold - yearTotals.totals.totalCost) / yearTotals.totals.totalCost : 0,
      soldProperties: yearTotals.sold,
      activeProperties: items.length - yearTotals.sold
    };
  }).sort((a, b) => {
    if (a.year === "Sem ano") return 1;
    if (b.year === "Sem ano") return -1;
    return Number(b.year) - Number(a.year);
  });
  const userProfitByYear = years.map(({ year }) => {
    const items = yearGroups[year] || [];
    const profit = items.reduce((sum, property) => {
      if (!property.finalSalePrice) return sum;
      const investorReturn = calculateInvestorReturns(property).find((link: any) => matchesInvestorUser(link, user));
      if (!investorReturn) return sum;
      return sum + (investorReturn.finalReturn - investorReturn.totalInvestorCost);
    }, 0);
    return { year, profit };
  });
  const userProfitTotal = userProfitByYear.reduce((sum, item) => sum + item.profit, 0);
  const realizedProfit = totals.totalSold - totals.totalCost;
  return {
    totalProperties: properties.length,
    totalInvested: totals.totalInvested,
    totalExtraExpenses: totals.totalExtraExpenses,
    totalCost: totals.totalCost,
    totalSold: totals.totalSold,
    expectedProfit: totals.expectedProfit,
    finalProfit: realizedProfit,
    averageProfitPercent: totals.totalCost > 0 ? realizedProfit / totals.totalCost : 0,
    soldProperties: sold,
    activeProperties: properties.length - sold,
    years,
    userProfitByYear,
    userProfitTotal,
    topProfitProperties: enriched.sort((a, b) => (b.summary.finalProfit || 0) - (a.summary.finalProfit || 0)).slice(0, 5).map(({ property, summary }) => ({ id: property.id, name: property.name, profit: summary.finalProfit })),
    pendingSaleProperties: properties.filter((p) => p.status !== "VENDIDO").map((p) => ({ id: p.id, name: p.name, status: p.status, expectedSalePrice: n(p.expectedSalePrice) }))
  };
}
