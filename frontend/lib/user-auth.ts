import { User } from "@/types";
import { cookies } from "next/headers";

export async function getUserFromSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("better-auth.session_data");

  if (!session) return null;

  try {
    const jsonString = Buffer.from(session.value, "base64").toString("utf-8");
    const data = JSON.parse(jsonString);
    return data.session.user;
  } catch (error) {
    console.error("Failed to parse session data", error);
    return null;
  }
}
export async function getTokenFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("better-auth.session_token");

  if (!session) return null;

  return session.value;
}
