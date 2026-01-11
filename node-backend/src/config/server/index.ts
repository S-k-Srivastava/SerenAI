import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "../env/index.js";
import { requestLogger } from "../../middleware/logging/requestLogger.js";
import { errorHandler } from "../../middleware/error/errorHandler.js";
import authRoutes from "../../routes/auth.routes.js";
import userDocumentRoutes from "../../routes/user.documents.routes.js";
import userChatBotRoutes from "../../routes/user.chatbots.routes.js";
import userChatRoutes from "../../routes/user.chats.routes.js";
import publicChatRoutes from "../../routes/public.chats.routes.js";
import userDashboardRoutes from "../../routes/user.dashboard.routes.js";
import userLLMConfigRoutes from "../../routes/user.llmconfigs.routes.js";
import adminUserRoutes from "../../routes/admin.users.routes.js";
import adminRoleRoutes from "../../routes/admin.roles.routes.js";
import adminPlanRoutes from "../../routes/admin.plans.routes.js";
import adminStatsRoutes from "../../routes/admin.stats.routes.js";
import adminSubscriptionRoutes from "../../routes/admin.subscriptions.routes.js";
import publicPlanRoutes from "../../routes/public.plans.routes.js";
import publicModelConfigsRoutes from "../../routes/public.modelconfigs.routes.js";
import contactUsRoutes from "../../routes/contactus.routes.js";
import adminContactUsRoutes from "../../routes/admin.contactus.routes.js";
import userHelpRoutes from "../../routes/user.help.routes.js";
import adminHelpRoutes from "../../routes/admin.help.routes.js";
import "../../models/Permission.js";
import { setupSwagger } from "../swagger/index.js";

export const createServer = (): express.Application => {
  const app = express();

  // Setup Swagger
  setupSwagger(app);

  app.use(helmet());
  app.use(compression());

  const allowedOrigins = [
    ...env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  if (env.NODE_ENV !== "development") {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);
  }

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.use(requestLogger);

  app.get("/health", (_, res) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    });
  });

  app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
  app.use(`/api/${env.API_VERSION}/plans/public`, publicPlanRoutes);
  app.use(`/api/${env.API_VERSION}/model-configs/public`, publicModelConfigsRoutes);
  app.use(`/api/${env.API_VERSION}/contact-us`, contactUsRoutes);
  app.use(`/api/${env.API_VERSION}/documents`, userDocumentRoutes);
  app.use(`/api/${env.API_VERSION}/chatbots`, userChatBotRoutes);
  app.use(`/api/${env.API_VERSION}/chat`, userChatRoutes);
  app.use(`/api/${env.API_VERSION}/public/chat`, publicChatRoutes);
  app.use(`/api/${env.API_VERSION}/dashboard`, userDashboardRoutes);
  app.use(`/api/${env.API_VERSION}/llmconfigs`, userLLMConfigRoutes);
  app.use(`/api/${env.API_VERSION}/admin/roles`, adminRoleRoutes);
  app.use(`/api/${env.API_VERSION}/admin/users`, adminUserRoutes);
  app.use(`/api/${env.API_VERSION}/admin/plans`, adminPlanRoutes);
  app.use(`/api/${env.API_VERSION}/admin/subscriptions`, adminSubscriptionRoutes);
  app.use(`/api/${env.API_VERSION}/admin/stats`, adminStatsRoutes);
  app.use(`/api/${env.API_VERSION}/admin/contact-us`, adminContactUsRoutes);
  app.use(`/api/${env.API_VERSION}/help`, userHelpRoutes);
  app.use(`/api/${env.API_VERSION}/admin/help`, adminHelpRoutes);

  app.use(errorHandler);

  return app;
};
