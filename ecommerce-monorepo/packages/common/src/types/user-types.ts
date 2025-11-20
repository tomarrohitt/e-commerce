export interface MinimalUserContext {
  userId: string;
  email: string;
  role: string;
}

export interface SessionCache {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

export interface UserCreatedEvent {
  eventType: "user.created";
  userId: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserUpdatedEvent {
  eventType: "user.updated";
  userId: string;
  email: string;
  name: string;
  updatedAt: string;
}

export interface UserDeletedEvent {
  eventType: "user.deleted";
  userId: string;
  deletedAt: string;
}
