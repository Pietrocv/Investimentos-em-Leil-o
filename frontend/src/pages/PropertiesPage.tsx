import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Table, Td, Th } from "../components/ui/table";
import { api } from "../lib/api";
import { brl } from "../lib/utils";

function propertyYear(property: any) {
  const rawDate = property.purchaseDate || property.createdAt;
  const date = rawDate ? new Date(rawDate) : null;
  return date && !Number.isNaN(date.getTime()) ? String(date.getFullYear()) : "Sem ano";
}

function statusLabel(status: string) {
  return status === "VENDIDO" ? "Vendido" : "Vendendo";
}

export function PropertiesPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get("/properties").then((r) => setItems(r.data));
  }, []);

  const groups = useMemo(() => {
    const grouped = items.reduce<Record<string, any[]>>((acc, property) => {
      const year = propertyYear(property);
      acc[year] = acc[year] || [];
      acc[year].push(property);
      return acc;
    }, {});

    return Object.entries(grouped).sort(([a], [b]) => {
      if (a === "Sem ano") return 1;
      if (b === "Sem ano") return -1;
      return Number(b) - Number(a);
    });
  }, [items]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Imoveis</h1>
          <p className="text-slate-600">Lista agrupada por ano de compra.</p>
        </div>
        <Link to="/properties/new">
          <Button>Novo imovel</Button>
        </Link>
      </div>

      {groups.map(([year, properties]) => (
        <Card key={year}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-navy">{year}</h2>
            <span className="text-sm text-slate-600">{properties.length} imoveis</span>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th>Status</Th>
                <Th>Ocupacao</Th>
                <Th>Compra</Th>
                <Th>Avaliacao</Th>
                <Th>Venda</Th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link className="font-semibold text-brand-green" to={`/properties/${p.id}`}>
                      {p.name}
                    </Link>
                  </Td>
                  <Td><Badge>{statusLabel(p.status)}</Badge></Td>
                  <Td>{p.isOccupied ? "Ocupado" : "Desocupado"}</Td>
                  <Td>{brl(p.purchasePrice)}</Td>
                  <Td>{brl(p.currentAppraisal)}</Td>
                  <Td>{brl(p.finalSalePrice)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ))}
    </section>
  );
}
