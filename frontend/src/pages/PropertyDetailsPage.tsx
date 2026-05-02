import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExpenseForm } from "../components/ExpenseForm";
import { PropertyInvestorForm } from "../components/PropertyInvestorForm";
import { SummaryCard } from "../components/SummaryCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Table, Td, Th } from "../components/ui/table";
import { api } from "../lib/api";
import { brl, pct } from "../lib/utils";

export function PropertyDetailsPage() {
  const { id } = useParams();
  const [p, setP] = useState<any>();
  const [investors, setInvestors] = useState<any[]>([]);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingInvestor, setEditingInvestor] = useState<any>(null);
  const load = () => api.get(`/properties/${id}`).then((r) => setP(r.data));

  useEffect(() => {
    load();
    api.get("/investors").then((r) => setInvestors(r.data));
  }, [id]);

  if (!p) return <p>Carregando imovel...</p>;

  const s = p.summary;
  const cart = (cat: string) => p.expenses.filter((e: any) => e.category === cat);
  const total = (arr: any[]) => arr.reduce((a, e) => a + Number(e.amount), 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">{p.name}</h1>
          <p className="text-slate-600">
            {p.city} {p.district && `- ${p.district}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge>{statusLabel(p.status)}</Badge>
          <Link to={`/properties/${p.id}/edit`}>
            <Button>Editar imovel</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard title="Compra" value={brl(s.totalPurchase)} />
        <SummaryCard title="Avaliacao atual" value={brl(p.currentAppraisal)} />
        <SummaryCard title="Avaliacao antiga" value={brl(p.oldAppraisal)} />
        <SummaryCard title="Venda realizada" value={brl(p.finalSalePrice)} />
        <SummaryCard title="Custos" value={brl(s.totalExtraExpenses)} />
        <SummaryCard title="Custo total" value={brl(s.totalCost)} />
        <SummaryCard title="Lucro realizado" value={brl(s.finalProfit)} />
        <SummaryCard title="% lucro" value={pct(s.finalProfitPercent)} />
        <SummaryCard title="Tempo" value={s.timeInMonths === null ? "Venda pendente" : `${s.timeInMonths} meses`} />
        <SummaryCard title="Ocupacao" value={p.isOccupied ? "Ocupado" : "Desocupado"} />
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold text-brand-navy">Adicionar custo</h2>
        <ExpenseForm investors={p.investors} onSubmit={async (d) => { await api.post(`/properties/${id}/expenses`, d); load(); }} />
      </Card>

      {editingExpense && (
        <Card>
          <h2 className="mb-3 text-lg font-bold text-brand-navy">Editar custo</h2>
          <ExpenseForm
            investors={p.investors}
            initial={editingExpense}
            submitLabel="Salvar custo"
            onCancel={() => setEditingExpense(null)}
            onSubmit={async (d) => {
              await api.patch(`/expenses/${editingExpense.id}`, d);
              setEditingExpense(null);
              load();
            }}
          />
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-bold text-brand-navy">Custos</h2>
        <Table>
          <thead>
            <tr>
              <Th>Descricao</Th>
              <Th>Categoria</Th>
              <Th>Valor</Th>
              <Th>Aplicacao</Th>
              <Th>Acoes</Th>
            </tr>
          </thead>
          <tbody>
            {p.expenses.map((e: any) => (
              <tr key={e.id}>
                <Td>{e.description}</Td>
                <Td>{categoryLabel(e.category)}</Td>
                <Td>{brl(e.amount)}</Td>
                <Td>{e.paidByInvestor?.name ? `100% para ${e.paidByInvestor.name}` : "Dividido entre investidores"}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button className="rounded-md border border-brand-green/25 px-3 py-1 text-xs text-brand-green hover:bg-brand-green/10" onClick={() => setEditingExpense(e)}>Editar</button>
                    <button className="rounded-md border border-red-400/25 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10" onClick={async () => { if (confirm("Excluir este custo?")) { await api.delete(`/expenses/${e.id}`); load(); } }}>Excluir</button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Documentacao title="Documentacao Compra" category="CARTORIO_1" items={cart("CARTORIO_1")} total={total(cart("CARTORIO_1"))} onAdd={async (data) => { await api.post(`/properties/${id}/expenses`, data); load(); }} />
        <Documentacao title="Documentacao Venda" category="CARTORIO_2" items={cart("CARTORIO_2")} total={total(cart("CARTORIO_2"))} onAdd={async (data) => { await api.post(`/properties/${id}/expenses`, data); load(); }} />
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold text-brand-navy">Adicionar investidor ao imovel</h2>
        <PropertyInvestorForm investors={investors} onSubmit={async (d) => { await api.post(`/properties/${id}/investors`, d); load(); }} />
      </Card>

      {editingInvestor && (
        <Card>
          <h2 className="mb-3 text-lg font-bold text-brand-navy">Editar investidor do imovel</h2>
          <PropertyInvestorForm
            investors={investors}
            initial={editingInvestor}
            submitLabel="Salvar investidor"
            onCancel={() => setEditingInvestor(null)}
            onSubmit={async (d) => {
              await api.patch(`/property-investors/${editingInvestor.id}`, d);
              setEditingInvestor(null);
              load();
            }}
          />
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-bold text-brand-navy">Investidores do imovel</h2>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Valor de compra</Th>
              <Th>% participacao</Th>
              <Th>% lucro</Th>
              <Th>Custos extra</Th>
              <Th>Custo total individual</Th>
              <Th>Retorno realizado</Th>
              <Th>Acoes</Th>
            </tr>
          </thead>
          <tbody>
            {p.investorReturns.map((i: any) => (
              <tr key={i.id}>
                <Td>{i.investor.name}</Td>
                <Td>{brl(i.initialContribution)}</Td>
                <Td>{Number(i.ownershipPercent).toFixed(2)}%</Td>
                <Td>{Number(i.profitPercent).toFixed(2)}%</Td>
                <Td>{brl(i.allocatedExpenses)}</Td>
                <Td>{brl(i.totalInvestorCost)}</Td>
                <Td>{brl(i.finalReturn)}</Td>
                <Td>
                  <div className="flex gap-2">
                    <button className="rounded-md border border-brand-green/25 px-3 py-1 text-xs text-brand-green hover:bg-brand-green/10" onClick={() => setEditingInvestor(p.investors.find((link: any) => link.id === i.id) || i)}>Editar</button>
                    <button className="rounded-md border border-red-400/25 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10" onClick={async () => { if (confirm("Remover este investidor do imovel?")) { await api.delete(`/property-investors/${i.id}`); load(); } }}>Excluir</button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="font-bold text-brand-navy">Condominio</h2>
          <p>Meses pagos: {p.condominiumMonths || 0}</p>
          <p>Valor do condominio: {brl(p.condominiumMonthlyValue)}</p>
          <p>Dividas antigas: {brl(p.condominiumOldDebt)}</p>
          <p>Total: {brl(p.condominiumTotal)}</p>
          <p>Ultimo pago: {p.condominiumLastPaidMonth || "-"}</p>
        </Card>
        <Card>
          <h2 className="font-bold text-brand-navy">Datas importantes</h2>
          <p>Compra: {p.purchaseDate?.slice(0, 10) || "-"}</p>
          <p>Avaliacao: {p.appraisalDate?.slice(0, 10) || "-"}</p>
          <p>Venda: {p.saleDate?.slice(0, 10) || "Venda pendente"}</p>
          <p>Retorno: {p.returnDate?.slice(0, 10) || "-"}</p>
        </Card>
        <Card>
          <h2 className="font-bold text-brand-navy">Documentos</h2>
          <p>Matricula: {p.registryNumber || "-"}</p>
          <p>IPTU: {p.iptuNumber || "-"}</p>
          <p>CPF comprador: {p.buyerCpf || "-"}</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-bold text-brand-navy">Observacoes</h2>
        <p className="whitespace-pre-wrap text-slate-700">{p.notes || "-"}</p>
      </Card>
    </section>
  );
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    CARTORIO_1: "Documentacao Compra",
    CARTORIO_2: "Documentacao Venda"
  };
  return labels[category] || category;
}

function statusLabel(status: string) {
  return status === "VENDIDO" ? "Vendido" : "Vendendo";
}

const documentationItems = ["Registro", "ITBI", "Escritura", "Taxa a vista", "Produto", "Matricula + Onus", "Abono", "Certidao"];

function Documentacao({ title, category, items, total, onAdd }: { title: string; category: string; items: any[]; total: number; onAdd: (data: any) => Promise<void> }) {
  const [description, setDescription] = useState(documentationItems[0]);
  const [amount, setAmount] = useState("");
  return (
    <Card>
      <h2 className="mb-3 text-lg font-bold text-brand-navy">{title}</h2>
      <form
        className="mb-4 grid gap-3 md:grid-cols-[1fr_160px_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          await onAdd({ description, category, amount });
          setDescription(documentationItems[0]);
          setAmount("");
        }}
      >
        <select className="h-10 rounded-md border border-white/10 bg-white/5 px-3" value={description} onChange={(event) => setDescription(event.target.value)}>
          {documentationItems.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <input required className="h-10 rounded-md border border-white/10 bg-white/5 px-3" type="number" step="0.01" placeholder="Valor" value={amount} onChange={(event) => setAmount(event.target.value)} />
        <Button>Adicionar</Button>
      </form>
      <Table>
        <thead>
          <tr>
            <Th>Item</Th>
            <Th>Valor</Th>
          </tr>
        </thead>
        <tbody>
          {items.length
            ? items.map((i) => (
                <tr key={i.id}>
                  <Td>{i.description}</Td>
                  <Td>{brl(i.amount)}</Td>
                </tr>
              ))
            : ["Registro", "ITBI", "Escritura", "Taxa a vista", "Produto", "Matricula + Onus", "Abono", "Certidao"].map((x) => (
                <tr key={x}>
                  <Td>{x}</Td>
                  <Td>{brl(0)}</Td>
                </tr>
              ))}
        </tbody>
      </Table>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <span>Total: <b>{brl(total)}</b></span>
        <span>Vai para custos: <b>Sim</b></span>
        <span>Itens: <b>{items.length}</b></span>
      </div>
    </Card>
  );
}
