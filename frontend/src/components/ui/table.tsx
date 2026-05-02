export const Table = (props: React.TableHTMLAttributes<HTMLTableElement>) => <div className="overflow-x-auto rounded-md border border-brand-green/10"><table className="w-full text-sm text-brand-text" {...props} /></div>;
export const Th = (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className="border-b border-brand-green/20 bg-slate-50 px-3 py-2 text-left font-semibold text-brand-green" {...props} />;
export const Td = (props: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className="border-b border-brand-green/10 px-3 py-2 align-top text-brand-text/85" {...props} />;
