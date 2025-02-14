import { Express, NextFunction, Request, Response, Router } from "express";
import {
  createWhatsAppBot,
  deleteWhatsAppBot,
  getWhatsAppBot,
  getWhatsAppBots,
} from "./whatsapp";
import express from "express";
const prefix = "/api2";

function whatsAppRoute() {
  const route = Router();
  route.use(express.json());
  route.get("/whatsapp/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return void res.status(400).json({ error: "Missing parameters" });
      }
      const whatsApp = getWhatsAppBot(id);
      if (!whatsApp) {
        return void res.status(404).json({ error: "WhatsApp not found" });
      }
      return void res.status(200).json({
        data: whatsApp,
      });
    } catch (error) {
      console.log("GET /api2/whatsapp/:id Error 2nd API", error);
      return void res.status(500).json({ error: "An error occured" });
    }
  });

  route.get("/whatsapp", async (req, res) => {
    try {
      const whatsapps = getWhatsAppBots();
      return void res.status(200).json({
        data: whatsapps,
      });
    } catch (error) {
      console.log("GET /api2/whatsapp Error 2nd API", error);
      return void res.status(500).json({ error: "An error occured" });
    }
  });

  route.post("/whatsapp", async (req, res) => {
    try {
      const body = req.body;
      console.log(body);
      if (!body.id || !body.name) {
        return void res.status(400).json({ error: "Missing parameters" });
      }
      await createWhatsAppBot({
        whatsAppId: body.id,
        whatsappName: body.name,
      });

      const whatsApp = getWhatsAppBot(body.id);
      return void res.status(200).json({
        data: whatsApp,
      });
    } catch (error) {
      console.log("POST /api2/whatsapp Error 2nd API", error);
      return void res.status(500).json({ error: "An error occured" });
    }
  });

  route.delete("/whatsapp/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return void res.status(400).json({ error: "Missing parameters" });
      }
      await deleteWhatsAppBot(id);
      return void res.status(200).json({
        data: {
          id,
        },
      });
    } catch (error) {
      console.log("DELETE /api2/whatsapp/:id Error 2nd API", error);
      return void res.status(500).json({ error: "An error occured" });
    }
  });

  route.post("/whatsapp/reconnect", async (req, res) => {
    try {
      const body = req.body;
      if (!body.id || !body.name) {
        return void res.status(400).json({ error: "Missing parameters" });
      }
      await deleteWhatsAppBot(body.id);
      await createWhatsAppBot({
        whatsAppId: body.id,
        whatsappName: body.name,
      });

      const whatsApp = getWhatsAppBot(body.id);
      if (!whatsApp) {
        return void res.status(400).json({ error: "Whatsapp not found" });
      }

      return void res.status(200).json({
        data: whatsApp,
      });
    } catch (error) {
      console.log("POST /api2/whatsapp/reconnect Error 2nd API", error);
      return void res.status(500).json({ error: "An error occured" });
    }
  });

  return route;
}

function isPrivateMiddleware(req: Request, res: Response, next: NextFunction) {
  const xPrivateApi = req.headers["x-private-api"];

  if (!xPrivateApi) {
    return void res.status(401).json({ error: "Unauthorized" });
  }

  if (xPrivateApi !== process.env.PRIVATE_API_KEY) {
    return void res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function serveApi(server: Express) {
  server.use(prefix, isPrivateMiddleware, whatsAppRoute());
}
