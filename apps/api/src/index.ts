import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { env } from "./config/env";
import { connectDatabase } from "./config/db";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/error";

async function bootstrap() {
  await connectDatabase();

  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser / same-origin requests (no Origin header)
        if (!origin) return callback(null, true);

        if (env.corsOrigin.includes(origin)) {
          return callback(null, true);
        }

        if (/^https?:\/\/([a-z0-9-]+\.)?motora\.dirshay\.com$/.test(origin)) {
          return callback(null, true);
        }

        // Dev convenience: allow any localhost / 127.0.0.1 port (Expo web, etc.)
        if (
          env.isDev &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          return callback(null, true);
        }

        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    "/uploads",
    (_req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.removeHeader("Content-Security-Policy");
      next();
    },
    express.static(path.resolve(env.uploadDir), {
      maxAge: "7d",
      fallthrough: true,
    })
  );

  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests. Please try again later.",
        statusCode: 429,
      },
    })
  );

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.port, () => {
    const cloudinaryReady = Boolean(
      env.cloudinary.cloudName &&
        env.cloudinary.apiKey &&
        env.cloudinary.apiSecret
    );
    console.log(
      `✓ API listening on http://localhost:${env.port} (storage: ${env.storageProvider}, cloudinary: ${cloudinaryReady ? "ok" : "MISSING KEYS"})`
    );
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
