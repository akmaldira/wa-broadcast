import { createServer } from "http";
import next from "next";
import express, { Request, Response } from "express";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

export async function startServer() {
  try {
    const server = express();

    await app.prepare();
    server.all("*", (req: Request, res: Response) => {
      return handle(req, res);
    });

    const httpServer = createServer(server);
    httpServer.listen(port, () => {
      console.log(
        `> Server listening at http://localhost:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
    });
    return server;
  } catch (error) {
    console.error("Error starting server:", error);
    throw error;
  }
}
