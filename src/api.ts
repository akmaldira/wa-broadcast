import express, {
  Express,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
import {
  createWhatsAppBot,
  deleteWhatsAppBot,
  getWhatsAppBot,
  getWhatsAppBots,
  sendMessage,
} from "./whatsapp";
import multer from "multer";
import path from "path";
import { AnyMediaMessageContent } from "@whiskeysockets/baileys";
import { prisma } from "./lib/prisma";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.resolve(path.join("uploads")));
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const prefix = "/api2";

function fileToMedia(
  file: Express.Multer.File,
  caption: string
): AnyMediaMessageContent {
  const mediaType = file.mimetype.split("/")[0];
  const filePath = path.resolve(file.path);

  switch (mediaType) {
    case "image":
      return {
        image: { url: filePath },
        caption: caption || undefined,
        mimetype: file.mimetype,
      };
    case "video":
      return {
        video: { url: filePath },
        caption: caption || undefined,
        mimetype: file.mimetype,
      };
    case "audio":
      return {
        audio: { url: filePath },
        mimetype: file.mimetype,
        caption: caption || undefined,
      };
    default:
      return {
        document: { url: filePath },
        mimetype: file.mimetype,
        fileName: file.originalname,
        caption: caption || undefined,
      };
  }
}

function whatsAppRoute() {
  const route = Router();
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

  route.get("/whatsapp", async (_req, res) => {
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

function publicRoute() {
  const route = Router();
  route.post(
    "/whatsapp/send-message",
    upload.single("media"),
    async (req, res) => {
      try {
        const { whatsAppBotId, toPhones, message, delay } = req.body;
        const file = req.file;
        if (!whatsAppBotId || !toPhones || !message || !delay) {
          return void res.status(400).json({ error: "Missing parameters" });
        }

        const contacts = await prisma.contact.findMany({
          where: {
            id: {
              in: toPhones.split(",").map((id: string) => id),
            },
          },
        });

        const toPhoneArray = contacts.map((contact) => ({
          value: contact.id,
          jid: `${contact.phoneNumber
            .replaceAll(" ", "")
            .replace("+", "")}@s.whatsapp.net`,
          label: contact.phoneNumber.replaceAll(" ", "").replace("+", ""),
        })) as { value: string; jid: string; label: string }[];

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("X-Accel-Buffering", "no");

        const whatsAppBot = getWhatsAppBot(whatsAppBotId);
        if (!whatsAppBot) {
          return void res.status(400).json({ error: "Whatsapp not found" });
        }

        const broadcast = await prisma.broadcast.create({
          data: {
            whatsAppId: whatsAppBotId,
            toContactIds: toPhoneArray.map((contact) => contact.value),
            message,
            delay: parseInt(delay),
            rawMedia: file
              ? JSON.stringify([
                  {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    encoding: file.encoding,
                    size: file.size,
                    path: file.path,
                  },
                ])
              : null,
            status: "pending",
          },
        });

        const success = [] as string[];
        const errors = [] as string[];
        let index = 1;
        for (const number of toPhoneArray) {
          const percentage = `${Math.floor(
            (index / toPhoneArray.length) * 100
          )}%`;
          const dataChunk = {
            percentage: percentage,
            message: `Mengirim pesan ke ${number.label}...`,
          };
          try {
            res.write(JSON.stringify(dataChunk) + "\n");
            const _ = await sendMessage(
              whatsAppBotId,
              number.jid,
              message,
              file ? fileToMedia(file, message) : undefined
            );
            dataChunk.message = `Pesan terkirim ke ${number.label}`;
            success.push(`Pesan terkirim ke ${number.label}`);
            res.write(JSON.stringify(dataChunk) + "\n");
            console.log(dataChunk.message);
          } catch (error) {
            errors.push(
              `Pesan gagal terkirim ke ${number.label} (${
                error instanceof Error ? error.message : "Unknown error"
              })`
            );
            dataChunk.message = `Pesan gagal terkirim ke ${number.label} (${
              error instanceof Error ? error.message : "Unknown error"
            })`;
            res.write(JSON.stringify(dataChunk) + "\n");
            console.log(dataChunk.message);
          } finally {
            index++;
          }
          if (index - 1 < toPhoneArray.length) {
            res.write(
              JSON.stringify({
                ...dataChunk,
                message: `Delay ${delay} detik...`,
              }) + "\n"
            );
            console.log(`Delay ${delay} detik...`);
            for (let i = 0; i < delay; i++) {
              dataChunk.message = `Delay ${delay - i} detik...`;
              res.write(JSON.stringify(dataChunk) + "\n");
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        let status = "pending";
        if (errors.length > 0) {
          status = success.length > 0 ? "some_error" : "error";
        } else {
          status = "success";
        }
        await prisma.broadcast.update({
          where: {
            id: broadcast.id,
          },
          data: {
            status: status,
            success: success,
            errors: errors,
          },
        });
        return void res.end();
      } catch (error) {
        console.log("POST /api2/whatsapp/send-message Error:", error);
        return void res.status(500).json({
          error: "An error occurred",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

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
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(prefix, publicRoute());
  server.use(prefix, isPrivateMiddleware, whatsAppRoute());
}
