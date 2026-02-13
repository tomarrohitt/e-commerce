import axios from "axios";
import { PrismaClient } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const GATEWAY_URL = "http://localhost:4000";

const connectionString =
  "postgresql://postgres:password@localhost:5432/identity";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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

      const signUpResponse = await axios.post(
        `${GATEWAY_URL}/api/auth/sign-up/email`,
        {
          name: user.name,
          email: user.email,
          password: user.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:4000",
          },
        },
      );

      const cookies = signUpResponse.headers["set-cookie"];
      if (!cookies) throw new Error("No cookies returned from Sign Up");

      const cookieHeader = cookies.find((c) =>
        c.includes("better-auth.session_token"),
      );

      if (!cookieHeader) {
        throw new Error("Session token missing in response");
      }
      console.log(`   📍 Adding 5 addresses for ${user.name}...`);

      for (let i = 0; i < 5; i++) {
        const randomZip = Math.floor(10000 + Math.random() * 90000).toString();
        const streetNum = Math.floor(Math.random() * 900) + 100;

        await axios.post(
          `${GATEWAY_URL}/api/addresses`,
          {
            name: addressTypes[i],
            street: `${streetNum} ${user.name.split(" ")[0]} Street`,
            city: "New York",
            state: "NY",
            zipCode: randomZip,
            country: "USA",
            phoneNumber: `+1555${Math.floor(1000 + Math.random() * 9000)}`,
            isDefault: i === 0,
          },
          {
            headers: {
              Cookie: cookieHeader,
              Origin: "http://localhost:4000",
            },
          },
        );
      }

      if (user.role === "admin") {
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "admin" },
        });
        console.log(`👑 Promoted ${user.name} to ADMIN`);
      }
    } catch (error: any) {
      if (error.response) {
        console.error(
          `   ❌ Failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      } else {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log("\n✅ Seeding Complete!");
}

main().finally(async () => {
  await prisma.$disconnect();
});
