export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
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

export enum Role {
  ADMIN = "admin",
  USER = "user",
}
