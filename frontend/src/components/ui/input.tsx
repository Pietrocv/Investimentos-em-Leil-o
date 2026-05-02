import { InputHTMLAttributes } from "react"; import { cn } from "../../lib/utils";
export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => <input className={cn("h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-emerald-100", className)} {...props} />;
