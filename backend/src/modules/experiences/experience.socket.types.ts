export interface ClientToServerEvents {
  "reviewer:join": (payload: { reviewerId: string }) => void;
  "reviewer:leave": (payload: { reviewerId: string }) => void;
}

export interface ServerToClientEvents {
  "experience:new": (payload: {
    id: string;
    reviewerId: string;
    content: string;
    createdAt: string;
  }) => void;
}
