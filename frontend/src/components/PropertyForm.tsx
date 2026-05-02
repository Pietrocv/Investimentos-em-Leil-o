import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const statuses = [
  ["EM_ANALISE", "Em analise"],
  ["ARREMATADO", "Arrematado"],
  ["EM_REGULARIZACAO", "Em regularizacao"],
  ["EM_REFORMA", "Em reforma"],
  ["A_VENDA", "A venda"],
  ["VENDIDO", "Vendido"],
  ["CANCELADO", "Cancelado"]
];

const types = [
  ["APARTAMENTO", "Apartamento"],
  ["CASA", "Casa"],
  ["LOTE", "Lote"],
  ["OUTRO", "Outro"]
];

export function PropertyForm({ initial, onSubmit }: { initial?: any; onSubmit: (data: any) => Promise<void> }) {
  const [f, setF] = useState<any>({ name: "", type: "APARTAMENTO", status: "EM_ANALISE", purchasePrice: 0, ...initial });

  useEffect(() => {
    if (!f.condominiumTotal) setF((x: any) => ({ ...x, condominiumTotal: Number(x.condominiumMonths || 0) * Number(x.condominiumMonthlyValue || 0) }));
  }, [f.condominiumMonths, f.condominiumMonthlyValue]);

  const ch = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));

  return (
    <form className="grid gap-5" onSubmit={async (e) => { e.preventDefault(); await onSubmit(f); }}>
      <FormSection title="Identificacao do imovel">
        <Field label="Nome do imovel"><Input required value={f.name || ""} onChange={(e) => ch("name", e.target.value)} /></Field>
        <Field label="Unidade / apartamento"><Input value={f.unit || ""} onChange={(e) => ch("unit", e.target.value)} /></Field>
        <Field label="Cidade"><Input value={f.city || ""} onChange={(e) => ch("city", e.target.value)} /></Field>
        <Field label="Bairro"><Input value={f.district || ""} onChange={(e) => ch("district", e.target.value)} /></Field>
        <Field label="Tipo do imovel">
          <select className="h-10 rounded-md border px-3" value={f.type} onChange={(e) => ch("type", e.target.value)}>
            {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className="h-10 rounded-md border px-3" value={f.status} onChange={(e) => ch("status", e.target.value)}>
            {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
      </FormSection>

      <FormSection title="Valores principais">
        <MoneyField label="Valor de compra" name="purchasePrice" form={f} onChange={ch} required />
        <MoneyField label="Avaliacao atual" name="currentAppraisal" form={f} onChange={ch} />
        <MoneyField label="Avaliacao antiga" name="oldAppraisal" form={f} onChange={ch} />
        <MoneyField label="Venda prevista" name="expectedSalePrice" form={f} onChange={ch} />
        <MoneyField label="Venda realizada" name="finalSalePrice" form={f} onChange={ch} />
      </FormSection>

      <FormSection title="Condominio">
        <Field label="Quantidade de meses"><Input type="number" value={f.condominiumMonths || ""} onChange={(e) => ch("condominiumMonths", e.target.value)} /></Field>
        <MoneyField label="Valor mensal" name="condominiumMonthlyValue" form={f} onChange={ch} />
        <MoneyField label="Total do condominio" name="condominiumTotal" form={f} onChange={ch} />
        <Field label="Ultimo mes pago"><Input value={f.condominiumLastPaidMonth || ""} onChange={(e) => ch("condominiumLastPaidMonth", e.target.value)} /></Field>
      </FormSection>

      <FormSection title="Datas">
        <DateField label="Data da compra" name="purchaseDate" form={f} onChange={ch} />
        <DateField label="Data do laudo / avaliacao" name="appraisalDate" form={f} onChange={ch} />
        <DateField label="Data da venda" name="saleDate" form={f} onChange={ch} />
        <DateField label="Data de retorno" name="returnDate" form={f} onChange={ch} />
      </FormSection>

      <FormSection title="Documentos">
        <Field label="Matricula"><Input value={f.registryNumber || ""} onChange={(e) => ch("registryNumber", e.target.value)} /></Field>
        <Field label="IPTU"><Input value={f.iptuNumber || ""} onChange={(e) => ch("iptuNumber", e.target.value)} /></Field>
        <Field label="CPF do comprador"><Input value={f.buyerCpf || ""} onChange={(e) => ch("buyerCpf", e.target.value)} /></Field>
      </FormSection>

      <Field label="Endereco completo"><Input value={f.address || ""} onChange={(e) => ch("address", e.target.value)} /></Field>
      <Field label="Observacoes"><Textarea value={f.notes || ""} onChange={(e) => ch("notes", e.target.value)} /></Field>
      <Button className="w-fit">Salvar imovel</Button>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="mb-4 text-base font-bold text-brand-green">{title}</h3>
      <div className="grid gap-4 md:grid-cols-3">{children}</div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1"><Label>{label}</Label>{children}</label>;
}

function MoneyField({ label, name, form, onChange, required }: { label: string; name: string; form: any; onChange: (key: string, value: any) => void; required?: boolean }) {
  return <Field label={label}><Input required={required} type="number" step="0.01" value={form[name] || ""} onChange={(e) => onChange(name, e.target.value)} /></Field>;
}

function DateField({ label, name, form, onChange }: { label: string; name: string; form: any; onChange: (key: string, value: any) => void }) {
  return <Field label={label}><Input type="date" value={String(form[name] || "").slice(0, 10)} onChange={(e) => onChange(name, e.target.value || null)} /></Field>;
}
