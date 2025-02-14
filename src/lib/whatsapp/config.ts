export const MAX_RECONNECT_RETRIES = Number(
  process.env.MAX_RECONNECT_RETRIES || 5
);
export const RECONNECT_INTERVAL = Number(process.env.RECONNECT_INTERVAL || 5);
export const BROWSER = [
  process.env.NAME_BOT_BROWSER || "Whatsapp Bot",
  "Chrome",
  "3.0",
] as [string, string, string];
export const SSE_MAX_QR_GENERATION = Number(
  process.env.SSE_MAX_QR_GENERATION || 5
);
