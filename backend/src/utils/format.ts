export function toDate(value: unknown) {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function toDecimalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  return Number(value);
}
