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

  if (!env.isDev) {
    app.set("trust proxy", 1);
  }

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser / same-origin requests (no Origin header)
        if (!origin) return callback(null, true);

        if (env.corsOrigin.includes(origin)) {
          return callback(null, true);
        }

        // Dev convenience: allow any localhost / 127.0.0.1 port (Expo web, etc.)
        if (
          env.isDev &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

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

  // Serve local uploads
  app.use(
    "/uploads",
    express.static(path.resolve(env.uploadDir), {
      maxAge: "7d",
      fallthrough: true,
    })
  );

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(
      `✓ API listening on http://localhost:${env.port} (storage: ${env.storageProvider})`
    );
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
