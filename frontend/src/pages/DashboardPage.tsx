import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SummaryCard } from "../components/SummaryCard";
import { Card } from "../components/ui/card";
import { Td, Th, Table } from "../components/ui/table";
import { api } from "../lib/api";
import { brl, pct } from "../lib/utils";

export function DashboardPage() {
  const [s, setS] = useState<any>();

  useEffect(() => {
    api.get("/dashboard/summary").then((r) => setS(r.data));
  }, []);

  if (!s) return <p>Carregando dashboard...</p>;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-navy">Dashboard</h1>
        <p className="text-slate-600">Resumo consolidado dos imoveis de leilao por ano de compra.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Custos totais" value={brl(s.totalCost)} />
        <SummaryCard title="Vendas totais" value={brl(s.totalSold)} />
        <SummaryCard title="Lucro real" value={brl(s.finalProfit)} />
        <SummaryCard title="Lucro medio" value={pct(s.averageProfitPercent)} />
        <SummaryCard title="Imoveis" value={s.totalProperties} />
        <SummaryCard title="Total investido" value={brl(s.totalInvested)} />
        <SummaryCard title="Custos extras" value={brl(s.totalExtraExpenses)} />
        <SummaryCard title="Lucro previsto" value={brl(s.expectedProfit)} />
        <SummaryCard title="Vendidos" value={s.soldProperties} />
        <SummaryCard title="Em andamento" value={s.activeProperties} />
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
                <Td className="font-semibold text-brand-navy">{year.year}</Td>
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
                <Th>Venda prevista</Th>
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
                  <Td>{brl(p.expectedSalePrice)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </section>
  );
}
