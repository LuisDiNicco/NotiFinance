import { Notification } from "@/types/notification";

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    title: "Alerta de Precio: GGAL",
    body: "GGAL ha superado el umbral de $8.000. Precio actual: $8.150.",
    type: "ALERT_TRIGGERED",
    isRead: false,
    metadata: {
      ticker: "GGAL",
      price: 8150,
      alertId: "a1",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: "n2",
    userId: "u1",
    title: "Resumen de Mercado",
    body: "El mercado ha cerrado. Tu portafolio subió un 2.5% hoy.",
    type: "MARKET_UPDATE",
    isRead: true,
    metadata: {
      portfolioId: "p1",
      performance: 2.5,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "n3",
    userId: "u1",
    title: "Dólar MEP en alza",
    body: "El Dólar MEP ha subido un 1.5% en la última hora.",
    type: "MARKET_UPDATE",
    isRead: false,
    metadata: {
      dollarType: "MEP",
      changePct: 1.5,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "n4",
    userId: "u1",
    title: "Alerta de Riesgo País",
    body: "El Riesgo País ha bajado de 1000 puntos.",
    type: "ALERT_TRIGGERED",
    isRead: true,
    metadata: {
      riskValue: 980,
      alertId: "a4",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];
