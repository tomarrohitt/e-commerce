import { PrismaClient } from "generated";

const GATEWAY_URL = "http://localhost:4000";

const prisma = new PrismaClient();

const users = [
  {
    name: "Admin",
    email: "admin@rohit.com",
    password: "Tomarrohit@241",
    role: "admin",
    emailVerified: true,
  },
];

async function main() {
  console.log("🌱 Starting User & Address Seeding via Gateway...");

  for (const user of users) {
    try {
      console.log(`\n👤 Creating User: ${user.name}...`);

      const signUpResponse = await fetch(
        `${GATEWAY_URL}/api/auth/sign-up/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:4000",
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            password: user.password,
          }),
        },
      );

      if (!signUpResponse.ok) {
        const data = await signUpResponse.json().catch(() => ({}));
        throw Object.assign(new Error("Sign-up failed"), {
          response: { status: signUpResponse.status, data },
        });
      }

      const cookies = signUpResponse.headers.get("set-cookie");
      if (!cookies) throw new Error("No cookies returned from Sign Up");

      const cookieHeader = cookies
        .split(",")
        .find((c) => c.includes("better-auth.session_token"));

      if (!cookieHeader) throw new Error("Session token missing in response");

      console.log(`   📍 Adding 5 addresses for ${user.name}...`);

      if (user.role === "admin") {
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "admin" },
        });
        console.log(`Promoted ${user.name} to ADMIN`);
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `Failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      } else {
        console.error(`Error: ${error.message}`);
      }
    }
  }

  console.log("\nSeeding Complete!");
}

main().finally(async () => {
  await prisma.$disconnect();
});
