import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  generateSlug,
  LoggerFactory,
  ProductEventType,
  RedisService,
} from "@ecommerce/common";
import { env } from "../src/config/env";

const redis = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const logger = LoggerFactory.create("CatalogService");

const CATEGORY_SCHEMAS: Record<string, any[]> = {
  books: [
    { key: "author", label: "Author", type: "text", searchable: true },
    { key: "isbn", label: "ISBN", type: "text", searchable: true },
    { key: "publisher", label: "Publisher", type: "text" },
    { key: "pages", label: "Pages", type: "number", unit: "pages" },
    { key: "language", label: "Language", type: "text" },
    {
      key: "format",
      label: "Format",
      type: "select",
      options: ["Hardcover", "Paperback", "Kindle"],
    },
  ],
  electronics: [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    { key: "warranty", label: "Warranty", type: "text" },
    {
      key: "connectivity",
      label: "Connectivity",
      type: "multiselect",
      options: ["WiFi", "Bluetooth", "USB-C"],
    },
    {
      key: "batteryLife",
      label: "Battery Life",
      type: "number",
      unit: "hours",
    },
    { key: "waterproof", label: "Waterproof", type: "boolean" },
  ],
  clothing: [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    {
      key: "size",
      label: "Size",
      type: "select",
      options: ["S", "M", "L", "XL"],
    },
    { key: "material", label: "Material", type: "text" },
    { key: "care", label: "Care Instructions", type: "text" },
    { key: "color", label: "Color", type: "color" },
  ],
  "home-kitchen": [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    { key: "material", label: "Material", type: "text" },
    { key: "capacity", label: "Capacity", type: "text" },
    { key: "dishwasherSafe", label: "Dishwasher Safe", type: "boolean" },
    { key: "warranty", label: "Warranty", type: "text" },
  ],
  "sports-outdoors": [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    { key: "weight", label: "Weight", type: "number", unit: "kg" },
    { key: "material", label: "Material", type: "text" },
    { key: "weatherResistant", label: "Weather Resistant", type: "boolean" },
    {
      key: "activityType",
      label: "Activity Type",
      type: "select",
      options: ["Running", "Cycling", "Hiking", "Swimming"],
    },
  ],
  "toys-games": [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    { key: "ageRange", label: "Age Range", type: "text" },
    { key: "players", label: "Number of Players", type: "text" },
    { key: "batteryRequired", label: "Battery Required", type: "boolean" },
    { key: "educational", label: "Educational", type: "boolean" },
  ],
  "health-beauty": [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    { key: "volume", label: "Volume", type: "text" },
    { key: "skinType", label: "Skin Type", type: "text" },
    { key: "organic", label: "Organic", type: "boolean" },
    { key: "scent", label: "Scent", type: "text" },
  ],
  automotive: [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    { key: "compatibility", label: "Compatibility", type: "text" },
    { key: "warranty", label: "Warranty", type: "text" },
    { key: "material", label: "Material", type: "text" },
    { key: "weatherproof", label: "Weatherproof", type: "boolean" },
  ],
  "office-supplies": [
    { key: "brand", label: "Brand", type: "text", searchable: true },
    { key: "color", label: "Color", type: "color" },
    { key: "quantity", label: "Quantity", type: "number", unit: "pieces" },
    { key: "recyclable", label: "Recyclable", type: "boolean" },
    { key: "size", label: "Size", type: "text" },
  ],
};

const IMAGE_POOLS: Record<string, string[]> = {
  electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    "https://images.unsplash.com/photo-1593784997442-76f433c1515c?w=800",
    "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800",
  ],
  books: [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
  ],
  "home-kitchen": [
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800",
  ],
  "sports-outdoors": [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
  ],
  "toys-games": [
    "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800",
    "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800",
  ],
  "health-beauty": [
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800",
  ],
  automotive: [
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
  ],
  "office-supplies": [
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800",
  ],
  default: [
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
  ],
};

// --- Helper: Generate Dynamic Attributes ---
function getRichProductData(categorySlug: string) {
  const images = IMAGE_POOLS[categorySlug] || IMAGE_POOLS.default;
  const randomImage = images[Math.floor(Math.random() * images.length)];

  let attributes: any = {};

  if (categorySlug === "electronics") {
    attributes = {
      brand: "TechGiant",
      warranty: "2 Year Manufacturer",
      connectivity: ["Bluetooth", "WiFi"],
      batteryLife: 24,
      waterproof: Math.random() > 0.5,
    };
  } else if (categorySlug === "books") {
    attributes = {
      author: "Robert C. Martin",
      publisher: "Prentice Hall",
      pages: Math.floor(Math.random() * 500) + 200,
      language: "English",
      format: Math.random() > 0.5 ? "Hardcover" : "Paperback",
      isbn: `978-0-${Math.floor(Math.random() * 10000000)}`,
    };
  } else if (categorySlug === "clothing") {
    const colors = ["Red", "Blue", "Black", "White"];
    const sizes = ["S", "M", "L", "XL"];
    attributes = {
      brand: "UrbanStyle",
      material: "100% Cotton",
      care: "Machine Wash Cold",
      color: colors[Math.floor(Math.random() * colors.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
    };
  } else if (categorySlug === "home-kitchen") {
    attributes = {
      brand: "HomeMaster",
      material: "Stainless Steel",
      capacity: "2L",
      dishwasherSafe: Math.random() > 0.5,
      warranty: "1 Year",
    };
  } else if (categorySlug === "sports-outdoors") {
    const activities = ["Running", "Cycling", "Hiking", "Swimming"];
    attributes = {
      brand: "ActiveGear",
      weight: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
      material: "Polyester",
      weatherResistant: Math.random() > 0.5,
      activityType: activities[Math.floor(Math.random() * activities.length)],
    };
  } else if (categorySlug === "toys-games") {
    attributes = {
      brand: "FunTimes",
      ageRange: "5-12 years",
      players: "2-4",
      batteryRequired: Math.random() > 0.5,
      educational: Math.random() > 0.5,
    };
  } else if (categorySlug === "health-beauty") {
    attributes = {
      brand: "GlowCare",
      volume: "50ml",
      skinType: "All Types",
      organic: Math.random() > 0.5,
      scent: "Lavender",
    };
  } else if (categorySlug === "automotive") {
    attributes = {
      brand: "AutoPro",
      compatibility: "Universal",
      warranty: "1 Year",
      material: "Aluminum",
      weatherproof: Math.random() > 0.5,
    };
  } else if (categorySlug === "office-supplies") {
    const colors = ["Red", "Blue", "Black", "White"];
    attributes = {
      brand: "OfficeMax",
      color: colors[Math.floor(Math.random() * colors.length)],
      quantity: Math.floor(Math.random() * 50) + 10,
      recyclable: Math.random() > 0.5,
      size: "A4",
    };
  }

  return {
    images: [randomImage, ...images],
    thumbnail: randomImage,
    attributes,
  };
}

// --- Data Definitions ---
const categories = [
  { name: "Electronics" },
  { name: "Books" },
  { name: "Clothing" },
  { name: "Home & Kitchen" },
  { name: "Sports & Outdoors" },
  { name: "Toys & Games" },
  { name: "Health & Beauty" },
  { name: "Automotive" },
  { name: "Office Supplies" },
];

const productsData = {
  electronics: [
    {
      name: "Wireless Headphones",
      price: 129.99,
      description: "Noise cancelling.",
    },
    { name: "4K Smart TV", price: 799.99, description: "OLED panel." },
    {
      name: "Gaming Laptop",
      price: 1299.99,
      description: "High performance gaming.",
    },
    {
      name: "Bluetooth Speaker",
      price: 79.99,
      description: "Portable sound system.",
    },
    { name: "Smartwatch", price: 249.99, description: "Fitness tracking." },
    { name: "Wireless Mouse", price: 39.99, description: "Ergonomic design." },
    { name: "Mechanical Keyboard", price: 149.99, description: "RGB backlit." },
    { name: "USB-C Hub", price: 59.99, description: "Multi-port adapter." },
    { name: "Webcam", price: 89.99, description: "1080p HD video." },
    { name: "External SSD", price: 119.99, description: "1TB storage." },
    { name: "Power Bank", price: 44.99, description: "20000mAh capacity." },
    { name: "Ring Light", price: 34.99, description: "For video calls." },
    {
      name: "Graphics Tablet",
      price: 199.99,
      description: "Digital drawing pad.",
    },
    { name: "Wireless Earbuds", price: 99.99, description: "True wireless." },
    {
      name: "Portable Monitor",
      price: 229.99,
      description: "15.6 inch display.",
    },
    { name: "Drone", price: 499.99, description: "4K camera drone." },
    { name: "Action Camera", price: 279.99, description: "Waterproof 4K." },
    { name: "E-Reader", price: 139.99, description: "Digital book reader." },
    { name: "VR Headset", price: 399.99, description: "Virtual reality." },
    { name: "Security Camera", price: 69.99, description: "WiFi enabled." },
  ],
  books: [
    {
      name: "Clean Code",
      price: 29.99,
      description: "A Handbook of Agile Software Craftsmanship.",
    },
    {
      name: "The Pragmatic Programmer",
      price: 39.99,
      description: "Your journey to mastery.",
    },
    {
      name: "Design Patterns",
      price: 44.99,
      description: "Elements of reusable software.",
    },
    {
      name: "Refactoring",
      price: 34.99,
      description: "Improving code design.",
    },
    {
      name: "Clean Architecture",
      price: 32.99,
      description: "Software structure and design.",
    },
    {
      name: "Domain-Driven Design",
      price: 49.99,
      description: "Tackling complexity.",
    },
    {
      name: "The DevOps Handbook",
      price: 37.99,
      description: "Technology transformation.",
    },
    {
      name: "Site Reliability Engineering",
      price: 42.99,
      description: "How Google runs systems.",
    },
    {
      name: "Kubernetes in Action",
      price: 44.99,
      description: "Container orchestration.",
    },
    {
      name: "Python Crash Course",
      price: 29.99,
      description: "Learn programming basics.",
    },
    {
      name: "JavaScript: The Good Parts",
      price: 27.99,
      description: "Master the language.",
    },
    {
      name: "You Don't Know JS",
      price: 24.99,
      description: "Deep dive into JavaScript.",
    },
    {
      name: "Eloquent JavaScript",
      price: 26.99,
      description: "Modern introduction.",
    },
    { name: "Code Complete", price: 46.99, description: "Practical handbook." },
    {
      name: "The Mythical Man-Month",
      price: 31.99,
      description: "Software engineering essays.",
    },
    {
      name: "Head First Design Patterns",
      price: 39.99,
      description: "Brain-friendly guide.",
    },
    {
      name: "Working Effectively with Legacy Code",
      price: 41.99,
      description: "Transform old code.",
    },
    {
      name: "The Clean Coder",
      price: 28.99,
      description: "Professional conduct.",
    },
    {
      name: "Test Driven Development",
      price: 36.99,
      description: "By example.",
    },
    {
      name: "Continuous Delivery",
      price: 43.99,
      description: "Reliable software releases.",
    },
  ],
  clothing: [
    { name: "Graphic T-Shirt", price: 19.99, description: "Cotton t-shirt." },
    { name: "Hoodie", price: 49.99, description: "Warm developer hoodie." },
    { name: "Denim Jeans", price: 59.99, description: "Classic fit denim." },
    { name: "Leather Jacket", price: 199.99, description: "Genuine leather." },
    {
      name: "Running Shoes",
      price: 89.99,
      description: "Cushioned running shoes.",
    },
    { name: "Polo Shirt", price: 34.99, description: "Business casual." },
    { name: "Cargo Pants", price: 44.99, description: "Multi-pocket pants." },
    {
      name: "Winter Coat",
      price: 149.99,
      description: "Insulated winter wear.",
    },
    { name: "Baseball Cap", price: 24.99, description: "Adjustable cap." },
    { name: "Sneakers", price: 79.99, description: "Casual footwear." },
    {
      name: "Sweatpants",
      price: 39.99,
      description: "Comfortable lounge wear.",
    },
    { name: "Tank Top", price: 14.99, description: "Summer wear." },
    { name: "Dress Shirt", price: 54.99, description: "Formal shirt." },
    { name: "Shorts", price: 29.99, description: "Athletic shorts." },
    { name: "Sweater", price: 64.99, description: "Wool blend sweater." },
    { name: "Socks Pack", price: 12.99, description: "5-pair pack." },
    { name: "Belt", price: 27.99, description: "Leather belt." },
    { name: "Scarf", price: 22.99, description: "Winter scarf." },
    { name: "Gloves", price: 18.99, description: "Thermal gloves." },
    { name: "Backpack", price: 69.99, description: "Laptop backpack." },
  ],
  "home-kitchen": [
    { name: "Coffee Maker", price: 99.99, description: "Programmable brew." },
    { name: "Blender", price: 89.99, description: "High speed blending." },
    { name: "Toaster", price: 39.99, description: "4-slice toaster." },
    { name: "Microwave Oven", price: 149.99, description: "1000W microwave." },
    { name: "Rice Cooker", price: 59.99, description: "Automatic cooking." },
    { name: "Cookware Set", price: 179.99, description: "Non-stick 10-piece." },
    { name: "Knife Set", price: 129.99, description: "Professional knives." },
    { name: "Cutting Board", price: 24.99, description: "Bamboo board." },
    { name: "Mixing Bowls", price: 34.99, description: "Stainless steel set." },
    { name: "Dish Rack", price: 29.99, description: "Rust-resistant rack." },
    {
      name: "Food Storage Containers",
      price: 44.99,
      description: "BPA-free set.",
    },
    { name: "Trash Can", price: 49.99, description: "Touchless sensor." },
    {
      name: "Dish Soap Dispenser",
      price: 19.99,
      description: "Automatic dispenser.",
    },
    { name: "Oven Mitts", price: 16.99, description: "Heat resistant." },
    { name: "Kitchen Scale", price: 27.99, description: "Digital weighing." },
    { name: "Can Opener", price: 22.99, description: "Electric opener." },
    { name: "Spice Rack", price: 39.99, description: "Wall-mounted rack." },
    {
      name: "Wine Glasses Set",
      price: 54.99,
      description: "Crystal glass set.",
    },
    { name: "Table Lamp", price: 64.99, description: "LED reading lamp." },
    {
      name: "Throw Pillows",
      price: 29.99,
      description: "Decorative cushions.",
    },
  ],
  "sports-outdoors": [
    { name: "Yoga Mat", price: 29.99, description: "Non-slip exercise mat." },
    { name: "Dumbbell Set", price: 119.99, description: "Adjustable weights." },
    { name: "Resistance Bands", price: 24.99, description: "Fitness bands." },
    { name: "Jump Rope", price: 14.99, description: "Speed rope." },
    { name: "Camping Tent", price: 149.99, description: "4-person tent." },
    { name: "Sleeping Bag", price: 79.99, description: "Cold weather bag." },
    { name: "Hiking Backpack", price: 99.99, description: "50L capacity." },
    { name: "Water Bottle", price: 19.99, description: "Insulated bottle." },
    { name: "Bike Helmet", price: 54.99, description: "Safety certified." },
    { name: "Cycling Gloves", price: 24.99, description: "Padded gloves." },
    {
      name: "Tennis Racket",
      price: 89.99,
      description: "Professional racket.",
    },
    { name: "Basketball", price: 34.99, description: "Official size." },
    { name: "Soccer Ball", price: 29.99, description: "Match quality." },
    { name: "Baseball Glove", price: 64.99, description: "Leather glove." },
    { name: "Golf Clubs Set", price: 499.99, description: "Complete set." },
    { name: "Fishing Rod", price: 79.99, description: "Carbon fiber rod." },
    { name: "Cooler Box", price: 89.99, description: "48-quart cooler." },
    { name: "Folding Chair", price: 39.99, description: "Portable seating." },
    { name: "Binoculars", price: 119.99, description: "HD optics." },
    { name: "Headlamp", price: 34.99, description: "Rechargeable light." },
  ],
  "toys-games": [
    {
      name: "Building Blocks Set",
      price: 49.99,
      description: "500-piece set.",
    },
    { name: "Board Game", price: 34.99, description: "Family game night." },
    { name: "Puzzle", price: 24.99, description: "1000-piece puzzle." },
    {
      name: "Remote Control Car",
      price: 79.99,
      description: "High-speed RC car.",
    },
    { name: "Action Figure", price: 19.99, description: "Collectible figure." },
    { name: "Dollhouse", price: 149.99, description: "Wooden dollhouse." },
    { name: "Play Kitchen", price: 119.99, description: "Pretend play set." },
    {
      name: "Art Supplies Kit",
      price: 39.99,
      description: "Complete art set.",
    },
    {
      name: "Science Kit",
      price: 54.99,
      description: "Educational experiments.",
    },
    {
      name: "Musical Instrument Toy",
      price: 44.99,
      description: "Kids keyboard.",
    },
    { name: "Stuffed Animal", price: 29.99, description: "Plush toy." },
    { name: "Card Game", price: 14.99, description: "Strategy game." },
    { name: "Nerf Blaster", price: 34.99, description: "Foam dart toy." },
    { name: "Scooter", price: 89.99, description: "Kids scooter." },
    { name: "Skateboard", price: 79.99, description: "Beginner board." },
    { name: "Magic Kit", price: 29.99, description: "Magic tricks set." },
    { name: "Chess Set", price: 44.99, description: "Wooden chess board." },
    { name: "Yo-Yo", price: 12.99, description: "Professional yo-yo." },
  ],
  "health-beauty": [
    { name: "Face Moisturizer", price: 34.99, description: "Hydrating cream." },
    { name: "Sunscreen SPF 50", price: 24.99, description: "Broad spectrum." },
    { name: "Shampoo", price: 18.99, description: "Nourishing formula." },
    { name: "Conditioner", price: 18.99, description: "Smoothing treatment." },
    { name: "Body Lotion", price: 22.99, description: "Moisturizing lotion." },
    { name: "Face Wash", price: 16.99, description: "Gentle cleanser." },
    { name: "Toothpaste", price: 8.99, description: "Whitening formula." },
    { name: "Deodorant", price: 12.99, description: "24-hour protection." },
    { name: "Hair Brush", price: 19.99, description: "Detangling brush." },
    { name: "Nail Polish Set", price: 29.99, description: "10-color set." },
    { name: "Makeup Remover", price: 14.99, description: "Gentle wipes." },
    { name: "Lip Balm", price: 7.99, description: "Moisturizing balm." },
    { name: "Hand Sanitizer", price: 9.99, description: "Antibacterial gel." },
    { name: "Bath Bombs", price: 24.99, description: "Relaxing soak." },
    {
      name: "Essential Oil Set",
      price: 44.99,
      description: "Aromatherapy oils.",
    },
    { name: "Facial Mask", price: 19.99, description: "Sheet mask pack." },
    { name: "Hair Serum", price: 26.99, description: "Shine treatment." },
    { name: "Body Scrub", price: 21.99, description: "Exfoliating scrub." },
  ],
  automotive: [
    { name: "Car Phone Mount", price: 24.99, description: "Dashboard mount." },
    { name: "Dash Cam", price: 89.99, description: "1080p recording." },
    { name: "Car Vacuum", price: 49.99, description: "Portable cleaner." },
    { name: "Seat Covers", price: 54.99, description: "Universal fit." },
    { name: "Floor Mats", price: 39.99, description: "All-weather mats." },
    { name: "Jumper Cables", price: 29.99, description: "Heavy-duty cables." },
    {
      name: "Tire Pressure Gauge",
      price: 14.99,
      description: "Digital gauge.",
    },
    { name: "Emergency Kit", price: 44.99, description: "Roadside kit." },
    { name: "Car Wax", price: 19.99, description: "Protective coating." },
    { name: "Windshield Wipers", price: 24.99, description: "Premium blades." },
    { name: "Air Freshener", price: 9.99, description: "Long-lasting scent." },
    { name: "USB Car Charger", price: 16.99, description: "Fast charging." },
    {
      name: "Steering Wheel Cover",
      price: 18.99,
      description: "Leather grip.",
    },
    {
      name: "Trunk Organizer",
      price: 34.99,
      description: "Collapsible storage.",
    },
    { name: "Sun Shade", price: 22.99, description: "Windshield cover." },
    { name: "License Plate Frame", price: 12.99, description: "Chrome frame." },
  ],
  "office-supplies": [
    { name: "Notebook Pack", price: 14.99, description: "5-pack notebooks." },
    { name: "Pen Set", price: 19.99, description: "Ballpoint pens." },
    { name: "Highlighter Set", price: 9.99, description: "Assorted colors." },
    { name: "Sticky Notes", price: 12.99, description: "Multi-size pack." },
    { name: "Desk Organizer", price: 29.99, description: "Multi-compartment." },
    { name: "File Folders", price: 16.99, description: "Letter size folders." },
    { name: "Stapler", price: 18.99, description: "Heavy-duty stapler." },
    { name: "Paper Clips", price: 7.99, description: "500-count box." },
    { name: "Tape Dispenser", price: 14.99, description: "Weighted base." },
    { name: "Calculator", price: 24.99, description: "Scientific calculator." },
    { name: "Scissors", price: 11.99, description: "Stainless steel." },
    { name: "Binder Set", price: 22.99, description: "3-ring binders." },
    { name: "Whiteboard", price: 39.99, description: "Magnetic board." },
    { name: "Markers Set", price: 16.99, description: "Dry erase markers." },
    { name: "Desk Lamp", price: 44.99, description: "LED task lamp." },
    {
      name: "Paper Shredder",
      price: 79.99,
      description: "Cross-cut shredder.",
    },
    { name: "Label Maker", price: 34.99, description: "Portable labeler." },
    { name: "Calendar", price: 19.99, description: "Wall calendar." },
  ],
};

// --- Redis Logic ---
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

// --- MAIN ---
async function main() {
  console.log("🌱 Starting Seed...");

  // await prisma.category.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.outboxEvent.deleteMany();
  // await clearRedisStock();

  console.log("Creating dummy users...");
  const users = [
    { id: "ASudAldnjtnoJUyGVUShEmc0inBDHXpa", name: "Lasate", image: null },
  ];

  await prisma.user.createMany({ data: users, skipDuplicates: true });
  const validUserIds = users.map((u) => u.id);

  for (const category of categories) {
    const slug = generateSlug(category.name);
    console.log(`Processing Category: ${category.name}`);
    const attributeSchema = CATEGORY_SCHEMAS[slug] || [];

    const createdCategory = await prisma.category.upsert({
      where: { slug },
      update: { attributeSchema },
      create: {
        ...category,
        slug,
        attributeSchema,
      },
    });

    const products = productsData[slug as keyof typeof productsData] || [];

    for (const p of products) {
      const richData = getRichProductData(slug);

      await prisma.$transaction(async (tx) => {
        const createdProduct = await tx.product.create({
          data: {
            categoryId: createdCategory.id,
            name: p.name,
            price: p.price,
            description: p.description,
            stockQuantity: Math.floor(Math.random() * 100) + 1,
            sku: `SKU${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            images: richData.images,
            thumbnail: richData.thumbnail,
            attributes: richData.attributes,
          },
          select: {
            id: true,
            name: true,
            price: true,
            stockQuantity: true,
            thumbnail: true,
            isActive: true,
          },
        });

        await tx.outboxEvent.create({
          data: {
            aggregateId: createdProduct.id,
            eventType: ProductEventType.CREATED,
            payload: createdProduct,
          },
        });

        await redis.set(
          `stock:${createdProduct.id}`,
          createdProduct.stockQuantity
        );
      });
    }
  }

  console.log("Seeding done.");
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
