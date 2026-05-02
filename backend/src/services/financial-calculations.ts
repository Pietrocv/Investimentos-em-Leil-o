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
  const finalSale = n(property.finalSalePrice);
  const isSold = property.status === "VENDIDO";
  const finalProfit = isSold && finalSale ? finalSale - totalCost : null;
  const finalProfitPercent = finalProfit !== null && totalCost > 0 ? finalProfit / totalCost : null;
  return {
    totalPurchase,
    totalExtraExpenses,
    totalCost,
    finalSalePrice: isSold && finalSale ? finalSale : null,
    finalProfit,
    finalProfitPercent,
    timeInMonths: calculateMonthsBetweenDates(property.purchaseDate, property.saleDate),
    saleStatus: isSold ? "Vendido" : "Vendendo"
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
    const finalProfit = summary.finalProfit ?? 0;
    const investorFinalProfit = finalProfit * ownershipPercent;
    const investorFinalReturn = totalInvestorCost + investorFinalProfit;
    const amountAlreadyPaid = payments.filter((p: any) => p.investorId === link.investorId).reduce((sum: number, p: any) => sum + n(p.amount), 0);
    const balanceToPay = investorFinalReturn - amountAlreadyPaid;
    return {
      ...link,
      ownershipPercent: ownershipPercent * 100,
      profitPercent: ownershipPercent * 100,
      sharedExpenses,
      directExpenses,
      allocatedExpenses,
      totalInvestorCost,
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
    if (item.property.status === "VENDIDO" && item.summary.finalSalePrice) {
      acc.soldCost += item.summary.totalCost;
      acc.totalSold += item.summary.finalSalePrice;
      acc.finalProfit += item.summary.finalProfit || 0;
    }
    return acc;
  }, { totalInvested: 0, totalExtraExpenses: 0, totalCost: 0, soldCost: 0, totalSold: 0, finalProfit: 0 });
  const sold = properties.filter((p) => p.status === "VENDIDO").length;
  const soldWithoutSaleValue = properties.filter((p) => p.status === "VENDIDO" && !n(p.finalSalePrice));
  return { enriched, totals, sold, soldWithoutSaleValue };
}

export function calculateDashboardSummary(properties: any[], user?: any) {
  const { enriched, totals, sold, soldWithoutSaleValue } = calculateTotals(properties);
  const yearGroups = properties.reduce<Record<string, any[]>>((acc, property) => {
    const year = String(getPropertyYear(property));
    acc[year] = acc[year] || [];
    acc[year].push(property);
    return acc;
  }, {});

  const calculateUserProfit = (items: any[]) => items.reduce((sum, property) => {
    if (property.status !== "VENDIDO" || !property.finalSalePrice) return sum;
    const investorReturn = calculateInvestorReturns(property).find((link: any) => matchesInvestorUser(link, user));
    if (!investorReturn) return sum;
    return sum + (investorReturn.finalReturn - investorReturn.totalInvestorCost);
  }, 0);

  const years = Object.entries(yearGroups).map(([year, items]) => {
    const yearTotals = calculateTotals(items);
    return {
      year,
      totalProperties: items.length,
      totalInvested: yearTotals.totals.totalInvested,
      totalExtraExpenses: yearTotals.totals.totalExtraExpenses,
      totalCost: yearTotals.totals.totalCost,
      soldCost: yearTotals.totals.soldCost,
      totalSold: yearTotals.totals.totalSold,
      finalProfit: yearTotals.totals.finalProfit,
      averageProfitPercent: yearTotals.totals.soldCost > 0 ? yearTotals.totals.finalProfit / yearTotals.totals.soldCost : 0,
      userProfit: calculateUserProfit(items),
      soldProperties: yearTotals.sold,
      activeProperties: items.length - yearTotals.sold,
      soldWithoutSaleValue: yearTotals.soldWithoutSaleValue.length
    };
  }).sort((a, b) => {
    if (a.year === "Sem ano") return 1;
    if (b.year === "Sem ano") return -1;
    return Number(b.year) - Number(a.year);
  });
  const userProfitByYear = years.map(({ year, userProfit }) => ({ year, profit: userProfit }));
  const userProfitTotal = calculateUserProfit(properties);
  return {
    totalProperties: properties.length,
    totalInvested: totals.totalInvested,
    totalExtraExpenses: totals.totalExtraExpenses,
    totalCost: totals.totalCost,
    soldCost: totals.soldCost,
    totalSold: totals.totalSold,
    finalProfit: totals.finalProfit,
    averageProfitPercent: totals.soldCost > 0 ? totals.finalProfit / totals.soldCost : 0,
    soldProperties: sold,
    activeProperties: properties.length - sold,
    soldWithoutSaleValue: soldWithoutSaleValue.length,
    soldWithoutSaleValueProperties: soldWithoutSaleValue.map((p) => ({ id: p.id, name: p.name, status: p.status })),
    years,
    userProfitByYear,
    userProfitTotal,
    topProfitProperties: enriched.sort((a, b) => (b.summary.finalProfit || 0) - (a.summary.finalProfit || 0)).slice(0, 5).map(({ property, summary }) => ({ id: property.id, name: property.name, profit: summary.finalProfit })),
    pendingSaleProperties: properties.filter((p) => p.status !== "VENDIDO").map((p) => ({ id: p.id, name: p.name, status: p.status }))
  };
}
