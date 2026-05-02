import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type PropertyInvestorFormProps = {
  investors: any[];
  initial?: any;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (data: any) => Promise<void>;
};

export function PropertyInvestorForm({ investors, initial, submitLabel = "Adicionar investidor", onCancel, onSubmit }: PropertyInvestorFormProps) {
  const [form, setForm] = useState({
    investorId: "",
    initialContribution: "",
    splitType: "POR_APORTE",
    ownershipPercent: "",
    notes: ""
  });

  useEffect(() => {
    if (!initial) return;
    setForm({
      investorId: initial.investorId || initial.investor?.id || "",
      initialContribution: String(initial.initialContribution ?? ""),
      splitType: initial.splitType || "POR_APORTE",
      ownershipPercent: String(initial.ownershipPercent ?? ""),
      notes: initial.notes || ""
    });
  }, [initial]);

  const change = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          ...form,
          ownershipPercent: form.ownershipPercent || undefined
        });
        if (!initial) {
          setForm({ investorId: "", initialContribution: "", splitType: "POR_APORTE", ownershipPercent: "", notes: "" });
        }
      }}
    >
      <label className="grid gap-1">
        <Label>Investidor</Label>
        <select required disabled={Boolean(initial)} className="h-10 rounded-md border border-white/10 bg-white/5 px-3" value={form.investorId} onChange={(event) => change("investorId", event.target.value)}>
          <option value="">Selecione</option>
          {investors.map((investor) => (
            <option key={investor.id} value={investor.id}>
              {investor.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1">
        <Label>Valor de compra</Label>
        <Input required type="number" step="0.01" value={form.initialContribution} onChange={(event) => change("initialContribution", event.target.value)} />
      </label>

      <label className="grid gap-1">
        <Label>Tipo de divisao</Label>
        <select className="h-10 rounded-md border border-white/10 bg-white/5 px-3" value={form.splitType} onChange={(event) => change("splitType", event.target.value)}>
          <option value="POR_APORTE">Por aporte</option>
          <option value="PERCENTUAL_MANUAL">Percentual manual</option>
        </select>
      </label>

      <label className="grid gap-1">
        <Label>Participacao (%)</Label>
        <Input type="number" step="0.01" min="0" max="100" value={form.ownershipPercent} onChange={(event) => change("ownershipPercent", event.target.value)} />
      </label>

      <label className="grid gap-1 md:col-span-3">
        <Label>Observacoes</Label>
        <Input value={form.notes} onChange={(event) => change("notes", event.target.value)} />
      </label>

      <div className="flex gap-2 md:col-span-3">
        <Button>{submitLabel}</Button>
        {onCancel && (
          <Button type="button" className="bg-none text-brand-gold" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
