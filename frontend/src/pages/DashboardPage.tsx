import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SummaryCard } from "../components/SummaryCard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Td, Th, Table } from "../components/ui/table";
import { api } from "../lib/api";
import { brl, pct } from "../lib/utils";

export function DashboardPage() {
  const [s, setS] = useState<any>();
  const [selectedYear, setSelectedYear] = useState("TODOS");

  useEffect(() => {
    api.get("/dashboard/summary").then((r) => setS(r.data));
  }, []);

  if (!s) return <p>Carregando dashboard...</p>;

  const selectedYearData = selectedYear === "TODOS" ? null : s.years.find((year: any) => year.year === selectedYear);
  const selectedUserProfit = selectedYear === "TODOS" ? s.userProfitTotal : s.userProfitByYear.find((item: any) => item.year === selectedYear)?.profit || 0;
  const summary = selectedYearData || s;

  async function exportSpreadsheet() {
    const response = await api.get("/export/spreadsheet.csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "investindo-com-leilao.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Dashboard</h1>
          <p className="text-slate-600">Resumo consolidado dos imoveis de leilao.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-10 rounded-md border border-white/10 bg-white/5 px-3" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
            <option value="TODOS">Todos os anos</option>
            {s.years.map((year: any) => <option key={year.year} value={year.year}>{year.year}</option>)}
          </select>
          <Button type="button" onClick={exportSpreadsheet}>
            Exportar planilha
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total de imoveis investidos" value={summary.totalProperties} />
        <SummaryCard title="Custos totais" value={brl(summary.totalCost)} />
        <SummaryCard title="Vendas totais" value={brl(summary.totalSold)} />
        <SummaryCard title="Lucro" value={brl(summary.finalProfit)} />
        <SummaryCard title="Lucro Pietro" value={brl(selectedUserProfit)} />
        <SummaryCard title="Lucro medio" value={pct(summary.averageProfitPercent)} />
        <SummaryCard title="Vendidos" value={summary.soldProperties} />
        <SummaryCard title="Em andamento" value={summary.activeProperties} />
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold text-brand-navy">Imoveis por ano</h2>
        <Table>
          <thead>
            <tr>
              <Th>Ano</Th>
              <Th>Imoveis</Th>
              <Th>Investido</Th>
              <Th>Custos</Th>
              <Th>Custo geral</Th>
              <Th>Vendido</Th>
              <Th>Lucro realizado</Th>
              <Th>Lucro medio</Th>
              <Th>Vendidos</Th>
              <Th>Em andamento</Th>
            </tr>
          </thead>
          <tbody>
            {s.years.map((year: any) => (
              <tr key={year.year}>
                <Td className="font-semibold text-brand-navy">
                  <button className="text-brand-green hover:underline" onClick={() => setSelectedYear(year.year)}>{year.year}</button>
                </Td>
                <Td>{year.totalProperties}</Td>
                <Td>{brl(year.totalInvested)}</Td>
                <Td>{brl(year.totalExtraExpenses)}</Td>
                <Td>{brl(year.totalCost)}</Td>
                <Td>{brl(year.totalSold)}</Td>
                <Td>{brl(year.finalProfit)}</Td>
                <Td>{pct(year.averageProfitPercent)}</Td>
                <Td>{year.soldProperties}</Td>
                <Td>{year.activeProperties}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold text-brand-navy">Lucros por ano</h2>
        <p className="mb-3 text-sm text-slate-600">Somente a parte vinculada ao usuario logado.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {s.userProfitByYear.map((item: any) => (
            <div key={item.year} className="rounded-lg border border-brand-green/20 bg-brand-green/10 p-4 transition hover:-translate-y-1 hover:border-brand-green/45">
              <span className="text-sm font-semibold text-brand-green">{item.year}</span>
              <strong className="mt-2 block text-2xl text-brand-text">{brl(item.profit)}</strong>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold text-brand-navy">Top 5 por lucro</h2>
          <Table>
            <thead>
              <tr>
                <Th>Imovel</Th>
                <Th>Lucro</Th>
              </tr>
            </thead>
            <tbody>
              {s.topProfitProperties.map((p: any) => (
                <tr key={p.id}>
                  <Td>
                    <Link className="text-brand-green" to={`/properties/${p.id}`}>
                      {p.name}
                    </Link>
                  </Td>
                  <Td>{brl(p.profit)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <h2 className="mb-3 font-bold text-brand-navy">Venda pendente</h2>
          <Table>
            <thead>
              <tr>
                <Th>Imovel</Th>
                <Th>Status</Th>
            </tr>
          </thead>
            <tbody>
              {s.pendingSaleProperties.map((p: any) => (
                <tr key={p.id}>
                  <Td>
                    <Link className="text-brand-green" to={`/properties/${p.id}`}>
                      {p.name}
                    </Link>
                  </Td>
                  <Td>{p.status}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </section>
  );
}
