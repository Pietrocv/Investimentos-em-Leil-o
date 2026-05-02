import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type InvestorPaymentFormProps = {
  links: any[];
  initial?: any;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (data: any) => Promise<void>;
};

export function InvestorPaymentForm({ links, initial, submitLabel = "Registrar pagamento", onCancel, onSubmit }: InvestorPaymentFormProps) {
  const [form, setForm] = useState({ investorId: "", amount: "", paymentDate: "", description: "" });

  useEffect(() => {
    if (!initial) return;
    setForm({
      investorId: initial.investorId || initial.investor?.id || "",
      amount: String(initial.amount ?? ""),
      paymentDate: initial.paymentDate ? initial.paymentDate.slice(0, 10) : "",
      description: initial.description || ""
    });
  }, [initial]);

  const change = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="grid gap-3 md:grid-cols-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(form);
        if (!initial) setForm({ investorId: "", amount: "", paymentDate: "", description: "" });
      }}
    >
      <label className="grid gap-1">
        <Label>Investidor</Label>
        <select required className="h-10 rounded-md border border-white/10 bg-white/5 px-3" value={form.investorId} onChange={(event) => change("investorId", event.target.value)}>
          <option value="">Selecione</option>
          {links.map((link) => (
            <option key={link.investorId} value={link.investorId}>
              {link.investor?.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <Label>Valor pago</Label>
        <Input required type="number" step="0.01" value={form.amount} onChange={(event) => change("amount", event.target.value)} />
      </label>
      <label className="grid gap-1">
        <Label>Data</Label>
        <Input type="date" value={form.paymentDate} onChange={(event) => change("paymentDate", event.target.value)} />
      </label>
      <label className="grid gap-1">
        <Label>Descricao</Label>
        <Input value={form.description} onChange={(event) => change("description", event.target.value)} />
      </label>
      <div className="flex gap-2 md:col-span-4">
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
