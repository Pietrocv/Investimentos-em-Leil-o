export const Table = (props: React.TableHTMLAttributes<HTMLTableElement>) => <div className="overflow-x-auto"><table className="w-full text-sm" {...props} /></div>;
export const Th = (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className="border-b bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600" {...props} />;
export const Td = (props: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className="border-b px-3 py-2 align-top" {...props} />;
