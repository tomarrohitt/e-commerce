import { cookies } from "next/headers";

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_data");

  if (!sessionCookie) return null;

  try {
    const jsonString = Buffer.from(sessionCookie.value, "base64").toString(
      "utf-8",
    );
    const data = JSON.parse(jsonString);
    return data.session.user;
  } catch (error) {
    console.error("Failed to parse session data", error);
    return null;
  }
}
