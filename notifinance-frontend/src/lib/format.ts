import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number, currency: "ARS" | "USD" = "ARS") {
  return currency === "USD" ? usdFormatter.format(value) : arsFormatter.format(value);
}

export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${percentFormatter.format(value)}%`;
}

export function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : parseISO(value);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTimeAgo(value: string | Date) {
  const date = value instanceof Date ? value : parseISO(value);
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: es });
}

const numberFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}