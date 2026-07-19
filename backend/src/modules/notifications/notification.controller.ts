import { Request, Response, NextFunction } from "express";
import { notificationService } from "./notification.service.js";
import { AppError } from "../../errors/app-error.js";

const getClientId = (req: Request): string => {
  const clientId = req.headers["x-anonymous-client-id"] || req.query.anonymousClientId || req.body.anonymousClientId;
  return typeof clientId === "string" ? clientId : "";
};

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientId = getClientId(req);
    if (!clientId) {
      throw new AppError(400, "Missing anonymous client ID");
    }

    const data = await notificationService.getRecentNotifications(clientId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientId = getClientId(req);
    if (!clientId) {
      throw new AppError(400, "Missing anonymous client ID");
    }

    await notificationService.markAllAsRead(clientId);
    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    next(error);
  }
};

export const markSingleNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = getClientId(req);
    if (!clientId) {
      throw new AppError(400, "Missing anonymous client ID");
    }

    await notificationService.markSingleAsRead(id, clientId);
    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    next(error);
  }
};

export const viewContentNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientId = getClientId(req);
    const { reviewerId, experienceIds } = req.body;

    if (!clientId) {
      throw new AppError(400, "Missing anonymous client ID");
    }

    await notificationService.markNotificationsReadByResourceId(
      clientId,
      reviewerId,
      experienceIds
    );

    res.status(200).json({
      success: true,
      message: "Content viewed notifications synchronized"
    });
  } catch (error) {
    next(error);
  }
};
