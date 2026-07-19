import { Request, Response, NextFunction } from "express";
import { CommunityReadStateModel } from "./community-read-state.model.js";
import { CommunityMessageModel } from "./community-message.model.js";
import { getIO } from "../../socket/socket.js";
import { AppError } from "../../errors/app-error.js";

const getClientId = (req: Request): string => {
  const clientId = req.headers["x-anonymous-client-id"] || req.query.anonymousClientId || req.body.anonymousClientId;
  return typeof clientId === "string" ? clientId : "";
};

export const getCommunityUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientId = getClientId(req);
    if (!clientId) {
      throw new AppError(400, "Missing anonymous client ID");
    }

    const readState = await CommunityReadStateModel.findOne({ clientId });
    const lastReadAt = readState ? readState.lastReadAt : new Date(0);

    const unreadCount = await CommunityMessageModel.countDocuments({
      anonymousClientId: { $ne: clientId },
      createdAt: { $gt: lastReadAt }
    });

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

export const markCommunityAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientId = getClientId(req);
    if (!clientId) {
      throw new AppError(400, "Missing anonymous client ID");
    }

    await CommunityReadStateModel.findOneAndUpdate(
      { clientId },
      { lastReadAt: new Date() },
      { upsert: true, new: true }
    );

    // Sync count 0 across all active sockets of this user
    const io = getIO();
    if (io) {
      for (const [_, socket] of io.sockets.sockets.entries()) {
        const socketClientId = socket.handshake.auth?.anonymousClientId;
        if (socketClientId === clientId) {
          socket.emit("community:unread:sync", { unreadCount: 0 });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Community messages marked as read"
    });
  } catch (error) {
    next(error);
  }
};
