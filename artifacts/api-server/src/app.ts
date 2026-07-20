import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Behind the Replit/Vercel edge proxy, trust X-Forwarded-* so req.ip is the
// real client address. Without this, IP-based rate limiting keys off the proxy
// IP and becomes a single global bucket for every user.
app.set("trust proxy", 1);

const isProduction = process.env["NODE_ENV"] === "production";
const frontendUrl = process.env["FRONTEND_URL"];

if (isProduction && !frontendUrl) {
  // Fail loudly at boot rather than silently blocking every browser request
  // with a CORS rejection in production.
  throw new Error(
    "FRONTEND_URL must be set in production so CORS can allow the frontend origin.",
  );
}

// localhost origins are only trusted outside production.
const allowedOrigins = [
  frontendUrl,
  ...(isProduction ? [] : ["http://localhost:5173", "http://localhost:3000"]),
].filter(Boolean) as string[];

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header) and whitelisted origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.statusCode || err.status || 500;
  logger.error({ err, statusCode: status }, "Unhandled error");
  res.status(status).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

export default app;
