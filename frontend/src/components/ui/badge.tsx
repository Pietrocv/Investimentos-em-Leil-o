import { HTMLAttributes } from "react"; import { cn } from "../../lib/utils";
export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => <span className={cn("inline-flex rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green shadow-[0_0_18px_rgba(211,170,83,0.12)]", className)} {...props} />;
