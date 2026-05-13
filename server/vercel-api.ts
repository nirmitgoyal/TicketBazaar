import { config } from "dotenv";
import express, { type Request, type Response, type NextFunction } from "express";
import type { IncomingMessage, ServerResponse } from "http";
import { apiBypassMiddleware } from "./middleware/api-bypass.middleware";
import { uriValidationMiddleware } from "./middleware/uri-validation.middleware";
import { registerRoutes } from "./routes";
import {
  extractUserContext,
  getMiddleware,
  initHoneybadger,
  notifyError,
} from "./honeybadger";

type VercelRequest = IncomingMessage & {
  query?: Record<string, string | string[]>;
};

config();

let appPromise: Promise<express.Express> | undefined;

async function createApp() {
  await initHoneybadger();
  const { requestHandler, errorHandler } = await getMiddleware();

  const app = express();

  app.use(requestHandler);
  app.use(uriValidationMiddleware);
  app.use(apiBypassMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  await registerRoutes(app);

  app.use(errorHandler);
  app.use(async (err: Error & { status?: number; statusCode?: number }, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    await notifyError(err, extractUserContext(req));

    res.status(status).json({
      success: false,
      message,
      status,
    });
  });

  return app;
}

function normalizeApiUrl(req: VercelRequest) {
  const splat = req.query?.path ?? req.query?.["..."];

  if (splat) {
    const path = Array.isArray(splat) ? splat.join("/") : splat;
    const url = new URL(req.url || "/", "https://vercel.local");

    url.pathname = `/api/${path}`;
    url.searchParams.delete("path");
    url.searchParams.delete("...");
    req.url = `${url.pathname}${url.search}`;
    return;
  }

  if (!req.url || req.url.startsWith("/api")) {
    return;
  }

  req.url = req.url === "/" ? "/api" : `/api${req.url}`;
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  normalizeApiUrl(req);
  appPromise ??= createApp();
  const app = await appPromise;

  return app(req, res);
}
