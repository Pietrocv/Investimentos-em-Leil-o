import { Card, CardTitle } from "./ui/card";
export function SummaryCard({ title, value }: { title: string; value: React.ReactNode }) { return <Card><CardTitle>{title}</CardTitle><div className="mt-2 text-2xl font-bold text-brand-navy">{value}</div></Card>; }
