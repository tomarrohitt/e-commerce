export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  sessionId: string;
}

export enum Role {
  ADMIN = "admin",
  USER = "user",
}
