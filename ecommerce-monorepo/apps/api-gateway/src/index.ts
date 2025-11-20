import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { redisService } from "@ecommerce/common";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cookieParser());

app.get("/validate", async (req, res) => {
  let sessionId = req.cookies?.["better-auth.session_token"];

  if (!sessionId && req.headers.authorization) {
    sessionId = req.headers.authorization.replace("Bearer ", "");
  }

  if (!sessionId) {
    return res.status(401).send();
  }

  try {
    // 2. Validate against Redis
    const session = await redisService.getSession(sessionId);

    console.log({ session });

    if (!session) {
      return res.status(401).send();
    }

    await redisService.setSession(sessionId, session, 3600);

    // 4. Return User Context as Headers
    // Nginx will grab these and pass them to the final microservice
    res.set("x-user-id", session.userId);
    res.set("x-user-email", session.email);
    res.set("x-user-role", session.role);

    return res.status(200).send();
  } catch (error) {
    console.error("Auth Check Failed:", error);
    return res.status(500).send();
  }
});

app.listen(PORT, () => {
  console.log(`🛡️ Auth Service running on port ${PORT}`);
});
