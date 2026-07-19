import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import reviewerRoutes from "./modules/reviewers/reviewer.routes";
import ratingRoutes from "./modules/ratings/rating.routes";
import experienceRoutes from "./modules/experiences/experience.routes";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import communityRoutes from "./modules/community/community.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-anonymous-client-id"]
  })
);
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Reviewer Bucket API is running"
  });
});

app.use("/api/reviewers", reviewerRoutes);
app.use("/api/reviewers", ratingRoutes);
app.use("/api/reviewers", experienceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/community", communityRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
