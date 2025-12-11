import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { generateSlug, LoggerFactory, RedisService } from "@ecommerce/common";
import { env } from "../src/config/env";

const redis = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});

const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const logger = LoggerFactory.create("CatalogService");

const categories = [
  { name: "Electronics" },
  { name: "Books" },
  { name: "Clothing" },
  { name: "Home & Kitchen" },
  { name: "Sports" },
];

const productsByCategory = {
  electronics: [
    {
      name: "Wireless Headphones",
      price: 129.99,
      description: "Noise cancelling and over-ear.",
    },
    {
      name: "4K Smart TV",
      price: 799.99,
      description: "65-inch OLED panel with HDR10 support.",
    },
    {
      name: "Bluetooth Speaker",
      price: 49.99,
      description: "Compact, loud, and waterproof.",
    },
    {
      name: "Gaming Mouse",
      price: 59.99,
      description: "High DPI with RGB lights, obviously.",
    },
    {
      name: "Laptop",
      price: 1099.99,
      description: "Lightweight and perfect for coding marathons.",
    },
  ],
  books: [
    {
      name: "Clean Code",
      price: 29.99,
      description: "Because your code is probably not.",
    },
    {
      name: "Design Patterns",
      price: 39.99,
      description: "The grandpa of software books.",
    },
    {
      name: "Pragmatic Programmer",
      price: 34.99,
      description: "Solid wisdom for sane devs.",
    },
    {
      name: "You Don’t Know JS",
      price: 24.99,
      description: "Because you really don’t.",
    },
    {
      name: "Refactoring",
      price: 41.99,
      description: "Your code deserves better.",
    },
  ],
  clothing: [
    {
      name: "Graphic T-Shirt",
      price: 19.99,
      description: "Minimalist and slightly ironic.",
    },
    {
      name: "Denim Jacket",
      price: 59.99,
      description: "Timeless rebellion starter pack.",
    },
    {
      name: "Sneakers",
      price: 79.99,
      description: "Comfortable enough for existential dread walks.",
    },
    {
      name: "Hoodie",
      price: 49.99,
      description: "Developer’s natural habitat uniform.",
    },
    {
      name: "Chinos",
      price: 39.99,
      description: "For when you pretend to be an adult.",
    },
  ],
  "home-kitchen": [
    {
      name: "Blender",
      price: 69.99,
      description: "Turns fruits and regrets into smoothies.",
    },
    {
      name: "Coffee Maker",
      price: 89.99,
      description: "Keeps you alive during deadlines.",
    },
    { name: "Air Fryer", price: 119.99, description: "Crispy without guilt." },
    {
      name: "Cookware Set",
      price: 149.99,
      description: "So you can burn things evenly.",
    },
    {
      name: "Desk Lamp",
      price: 29.99,
      description: "Makes your workspace look intentional.",
    },
  ],
  sports: [
    {
      name: "Yoga Mat",
      price: 24.99,
      description: "Pretend to stretch, actually scroll Instagram.",
    },
    {
      name: "Running Shoes",
      price: 99.99,
      description: "Good for running away from responsibilities.",
    },
    {
      name: "Dumbbell Set",
      price: 79.99,
      description: "Lift your mood. Literally.",
    },
    {
      name: "Football",
      price: 34.99,
      description: "For when you’re done watching others do it.",
    },
    {
      name: "Cycling Helmet",
      price: 59.99,
      description: "Safety first, style nowhere.",
    },
  ],
};

async function clearRedisStock() {
  console.log("🧹 Cleaning Redis 'stock:*' keys...");
  const client = redis.getClient();
  let cursor = "0";
  let deletedCount = 0;

  do {
    const result = await client.scan(cursor, "MATCH", "stock:*", "COUNT", 100);
    cursor = result[0];
    const keys = result[1];

    if (keys.length > 0) {
      await client.del(...keys);
      deletedCount += keys.length;
    }
  } while (cursor !== "0");

  console.log(`✅ Redis cleaned. Removed ${deletedCount} keys.`);
}

async function syncAllStock() {
  const products = await prisma.product.findMany();

  console.log(`Syncing ${products.length} products to Redis...`);

  for (const p of products) {
    await redis.set(`stock:${p.id}`, p.stockQuantity);
  }

  console.log("✅ Done.");
  process.exit(0);
}

async function main() {
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();
  await clearRedisStock();

  for (const category of categories) {
    const slug = generateSlug(category.name);
    const createdCategory = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { ...category, slug },
    });

    const products =
      productsByCategory[slug as keyof typeof productsByCategory] || [];
    for (const product of products) {
      await prisma.product.create({
        data: {
          categoryId: createdCategory.id,
          name: product.name,
          price: product.price,
          description: product.description,
          stockQuantity: Math.floor(Math.random() * 100) + 1,
          sku: `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        },
      });
    }
  }

  console.log("Seeding done.");
  await syncAllStock();
}

main()
  .catch((e) => logger.error(e))
  .finally(async () => await prisma.$disconnect());
