import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const categories = [
  ["COMPRA", "Compra"],
  ["CARTORIO_1", "Documentacao Compra"],
  ["CARTORIO_2", "Documentacao Venda"],
  ["REFORMA", "Reforma"],
  ["MATERIAL", "Material"],
  ["MAO_DE_OBRA", "Mao de obra"],
  ["CONDOMINIO", "Condominio"],
  ["IPTU", "IPTU"],
  ["LAUDO", "Laudo"],
  ["COMISSAO_CORRETOR", "Comissao corretor"],
  ["COMISSAO_IMOBILIARIA", "Comissao imobiliaria"],
  ["LUZ", "Luz"],
  ["AGUA", "Agua"],
  ["ACORDO_SAIDA", "Acordo de saida"],
  ["MATRICULA", "Matricula"],
  ["CERTIDAO", "Certidao"],
  ["CHAVEIRO", "Chaveiro"],
  ["LIMPEZA", "Limpeza"],
  ["INDICACAO", "Indicacao"],
  ["OUTROS", "Outros"]
];

const empty = { description: "", category: "OUTROS", amount: "", paidByInvestorId: "", paymentDate: "", paymentMethod: "", notes: "" };

export function ExpenseForm({ investors = [], initial, submitLabel = "Adicionar custo", onSubmit, onCancel }: { investors?: any[]; initial?: any; submitLabel?: string; onSubmit: (d: any) => Promise<void>; onCancel?: () => void }) {
  const [f, setF] = useState<any>(empty);

  useEffect(() => {
    setF(initial ? {
      description: initial.description || "",
      category: initial.category || "OUTROS",
      amount: initial.amount || "",
      paidByInvestorId: initial.paidByInvestorId || "",
      paymentDate: String(initial.paymentDate || "").slice(0, 10),
      paymentMethod: initial.paymentMethod || "",
      notes: initial.notes || ""
    } : empty);
  }, [initial]);

  const ch = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); await onSubmit({ ...f, paidByInvestorId: f.paidByInvestorId || null }); if (!initial) setF(empty); }}>
      <Field label="Descricao do custo"><Input required value={f.description} onChange={(e) => ch("description", e.target.value)} /></Field>
      <Field label="Categoria">
        <select className="h-10 rounded-md border px-3" value={f.category} onChange={(e) => ch("category", e.target.value)}>
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="Valor"><Input required type="number" step="0.01" value={f.amount} onChange={(e) => ch("amount", e.target.value)} /></Field>
      <Field label="Aplicacao do custo">
        <select className="h-10 rounded-md border px-3" value={f.paidByInvestorId} onChange={(e) => ch("paidByInvestorId", e.target.value)}>
          <option value="">Geral / dividido</option>
          {investors.map((i: any) => <option key={i.investorId} value={i.investorId}>{i.investor?.name}</option>)}
        </select>
      </Field>
      <Field label="Data do pagamento"><Input type="date" value={f.paymentDate} onChange={(e) => ch("paymentDate", e.target.value)} /></Field>
      <Field label="Forma de pagamento"><Input value={f.paymentMethod} onChange={(e) => ch("paymentMethod", e.target.value)} /></Field>
      <label className="grid gap-1 md:col-span-2"><Label>Observacoes</Label><Textarea value={f.notes} onChange={(e) => ch("notes", e.target.value)} /></label>
      <div className="flex gap-2">
        <Button className="w-fit">{submitLabel}</Button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-md border border-brand-green/25 px-4 py-2 text-sm text-brand-text/80 hover:bg-white/5">Cancelar</button>}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1"><Label>{label}</Label>{children}</label>;
}
