import { startServer } from "./server";
import { initWhatsAppBots } from "./whatsapp";

initWhatsAppBots().then(() => startServer());
