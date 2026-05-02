import { HTMLAttributes } from "react"; import { cn } from "../../lib/utils";
export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={cn("inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-brand-green", className)} {...props} />;
