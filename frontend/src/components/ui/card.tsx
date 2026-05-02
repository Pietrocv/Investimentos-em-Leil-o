import { HTMLAttributes } from "react"; import { cn } from "../../lib/utils";
export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn("group relative overflow-hidden rounded-lg border border-brand-green/20 bg-white p-5 shadow-gold backdrop-blur transition hover:-translate-y-1 hover:border-brand-green/45", className)} {...props} />;
export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("text-sm font-semibold text-brand-green", className)} {...props} />;
