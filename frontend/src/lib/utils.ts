import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const brl = (v?: number | null) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));
export const pct = (v?: number | null) => `${((Number(v || 0)) * (Math.abs(Number(v || 0)) <= 1 ? 100 : 1)).toFixed(2)}%`;
