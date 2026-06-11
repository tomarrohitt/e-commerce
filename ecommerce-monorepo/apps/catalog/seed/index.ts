import { PrismaClient } from "generated";
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

const prisma = new PrismaClient();
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
  "automotive": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241323/ecommerce/automotive/photo-1471444928139-48c5bf5173f8.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241327/ecommerce/automotive/photo-1506015391300-4802dc74de2e.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241330/ecommerce/automotive/photo-1511919884226-fd3cad34687c.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241333/ecommerce/automotive/photo-1541899481282-d53bffe3c35d.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241335/ecommerce/automotive/photo-1552519507-da3b142c6e3d.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241339/ecommerce/automotive/photo-1554744512-d6c603f27c54.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241341/ecommerce/automotive/photo-1580273916550-e323be2ae537.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241344/ecommerce/automotive/photo-1581092160607-ee22621dd758.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241347/ecommerce/automotive/photo-1583121274602-3e2820c69888.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241350/ecommerce/automotive/photo-1614162692292-7ac56d7f7f1e.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241353/ecommerce/automotive/photo-1619642751034-765dfdf7c58e.webp",
  ],
  "books": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241355/ecommerce/books/1780212604861-74255.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241359/ecommerce/books/photo-1481627834876-b7833e8f5570.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241362/ecommerce/books/photo-1491841573634-28140fc7ced7.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241364/ecommerce/books/photo-1495446815901-a7297e633e8d.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241367/ecommerce/books/photo-1512820790803-83ca734da794.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241371/ecommerce/books/photo-1524995997946-a1c2e315a42f.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241374/ecommerce/books/photo-1533669955142-6a73332af4db.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241377/ecommerce/books/photo-1544716278-ca5e3f4abd8c.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241380/ecommerce/books/photo-1562654501-a0ccc0fc3fb1.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241382/ecommerce/books/photo-1589829085413-56de8ae18c73.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241385/ecommerce/books/photo-1598618443855-232ee0f819f6.webp",
  ],
  "clothing": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241389/ecommerce/clothing/photo-1434389677669-e08b4cac3105.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241392/ecommerce/clothing/photo-1515886657613-9f3515b0c78f.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241394/ecommerce/clothing/photo-1521572163474-6864f9cf17ab.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241397/ecommerce/clothing/photo-1523275335684-37898b6baf30.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241399/ecommerce/clothing/photo-1542291026-7eec264c27ff.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241402/ecommerce/clothing/photo-1548036328-c9fa89d128fa.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241405/ecommerce/clothing/photo-1549298916-b41d501d3772.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241408/ecommerce/clothing/photo-1556905055-8f358a7a47b2.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241410/ecommerce/clothing/photo-1558618666-fcd25c85cd64.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241414/ecommerce/clothing/photo-1578932750294-f5075e85f44a.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241417/ecommerce/clothing/photo-1583744946564-b52ac1c389c8.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241419/ecommerce/clothing/photo-1585386959984-a4155224a1ad.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241422/ecommerce/clothing/photo-1591047139829-d91aecb6caea.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241424/ecommerce/clothing/photo-1608256246200-53e635b5b65f.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241426/ecommerce/clothing/photo-1611042553365-9b101441c135.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241429/ecommerce/clothing/photo-1612423284934-2850a4ea6b0f.webp",
  ],
  "electronics": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241436/ecommerce/electronics/abillion-Nf5fSqHm-iY-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241441/ecommerce/electronics/alex-knight-j4uuKnN43_M-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241448/ecommerce/electronics/alexander-andrews-Wzs4-QEmCUQ-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241455/ecommerce/electronics/bagus-hernawan-A6JxK37IlPo-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241461/ecommerce/electronics/c-d-x-PDX_a_82obo-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241465/ecommerce/electronics/daniel-romero-6V5vTuoeCZg-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241468/ecommerce/electronics/daniel-romero-q-RQba-XCgU-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241472/ecommerce/electronics/dennis-brendel-YLNMXzXk8zs-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241477/ecommerce/electronics/diane-picchiottino-ZL7IdwroJTU-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241482/ecommerce/electronics/ervo-rocks-Zam8TvEgN5o-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241489/ecommerce/electronics/jason-briscoe-GliaHAJ3_5A-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241493/ecommerce/electronics/jens-kreuter-ngMtsE5r9eI-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241500/ecommerce/electronics/josbra-design-1eWGq_l_DuU-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241504/ecommerce/electronics/kari-shea-1SAnrIxw5OY-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241510/ecommerce/electronics/maxim-hopman-Hin-rzhOdWs-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241515/ecommerce/electronics/oscar-nord-Sd87V72cJEU-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241521/ecommerce/electronics/shiwa-id-Uae7ouMw91A-unsplash.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241525/ecommerce/electronics/theregisti-qt9_OfTaaeY-unsplash.webp",
  ],
  "health-beauty": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241528/ecommerce/health-beauty/photo-1503236823255-94609f598e71.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241531/ecommerce/health-beauty/photo-1512290923902-8a9f81dc236c.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241533/ecommerce/health-beauty/photo-1556228720-195a672e8a03.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241535/ecommerce/health-beauty/photo-1559056199-641a0ac8b55e.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241538/ecommerce/health-beauty/photo-1571781926291-c477ebfd024b.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241541/ecommerce/health-beauty/photo-1571875257727-256c39da42af.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241543/ecommerce/health-beauty/photo-1583241475880-083f84372725.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241548/ecommerce/health-beauty/photo-1585386959984-a4155224a1ad.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241553/ecommerce/health-beauty/photo-1598440947619-2c35fc9aa908.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241556/ecommerce/health-beauty/photo-1609587312208-cea54be969e7.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241559/ecommerce/health-beauty/photo-1616394584738-fc6e612e71b9.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241562/ecommerce/health-beauty/photo-1619451334792-150fd785ee74.webp",
  ],
  "home-kitchen": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241564/ecommerce/home-kitchen/photo-1484101403633-562f891dc89a.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241569/ecommerce/home-kitchen/photo-1523413363574-c30aa1c2a516.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241571/ecommerce/home-kitchen/photo-1526170375885-4d8ecf77b99f.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241574/ecommerce/home-kitchen/photo-1556909114-f6e7ad7d3136.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241578/ecommerce/home-kitchen/photo-1556911220-bff31c812dba.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241582/ecommerce/home-kitchen/photo-1558618666-fcd25c85cd64.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241586/ecommerce/home-kitchen/photo-1563861826100-9cb868fdbe1c.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241592/ecommerce/home-kitchen/photo-1574180566232-aaad1b5b8450.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241602/ecommerce/home-kitchen/photo-1583845112203-29329902332e.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241606/ecommerce/home-kitchen/photo-1585664811087-47f65abbad64.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241609/ecommerce/home-kitchen/photo-1586023492125-27b2c045efd7.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241612/ecommerce/home-kitchen/photo-1592078615290-033ee584e267.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241615/ecommerce/home-kitchen/photo-1600585152220-90363fe7e115.webp",
  ],
  "office-supplies": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241618/ecommerce/office-supplies/photo-1506784365847-bbad939e9335.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241622/ecommerce/office-supplies/photo-1527192491265-7e15c55b1ed2.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241625/ecommerce/office-supplies/photo-1531346878377-a5be20888e57.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241628/ecommerce/office-supplies/photo-1554774853-719586f82d77.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241630/ecommerce/office-supplies/photo-1558618666-fcd25c85cd64.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241633/ecommerce/office-supplies/photo-1563986768494-4dee2763ff3f.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241636/ecommerce/office-supplies/photo-1572044162444-ad60f128bdea.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241640/ecommerce/office-supplies/photo-1583847268964-b28dc8f51f92.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241643/ecommerce/office-supplies/photo-1593642632559-0c6d3fc62b89.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241645/ecommerce/office-supplies/photo-1606107557195-0e29a4b5b4aa.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241648/ecommerce/office-supplies/photo-1611532736597-de2d4265fba3.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241651/ecommerce/office-supplies/photo-1618044619888-009e412ff12a.webp",
  ],
  "sports-outdoors": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241654/ecommerce/sports-outdoors/photo-1461896836934-ffe607ba8211.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241657/ecommerce/sports-outdoors/photo-1484704849700-f032a568e944.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241660/ecommerce/sports-outdoors/photo-1517838277536-f5f99be501cd.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241663/ecommerce/sports-outdoors/photo-1526506118085-60ce8714f8c5.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241665/ecommerce/sports-outdoors/photo-1542291026-7eec264c27ff.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241668/ecommerce/sports-outdoors/photo-1552674605-db6ffd4facb5.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241671/ecommerce/sports-outdoors/photo-1560272564-c83b66b1ad12.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241674/ecommerce/sports-outdoors/photo-1571019613454-1cb2f99b2d8b.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241677/ecommerce/sports-outdoors/photo-1579952363873-27f3bade9f55.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241680/ecommerce/sports-outdoors/photo-1593079831268-3381b0db4a77.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241684/ecommerce/sports-outdoors/photo-1607962837359-5e7e89f86776.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241688/ecommerce/sports-outdoors/photo-1619410283995-43d9134e7656.webp",
  ],
  "toys-games": [
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241691/ecommerce/toys-games/photo-1494976388531-d1058494cdd8.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241695/ecommerce/toys-games/photo-1515488764276-beab7607c1e6.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241697/ecommerce/toys-games/photo-1550745165-9bc0b252726f.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241701/ecommerce/toys-games/photo-1558060370-d644479cb6f7.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241703/ecommerce/toys-games/photo-1563396983906-b3795482a59a.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241706/ecommerce/toys-games/photo-1566576721346-d4a3b4eaeb55.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241708/ecommerce/toys-games/photo-1572635196237-14b3f281503f.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241711/ecommerce/toys-games/photo-1580477667995-2b94f01c9516.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241714/ecommerce/toys-games/photo-1608889335941-32ac5f2041b9.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241716/ecommerce/toys-games/photo-1611996575749-79a3a250f948.webp",
    "https://res.cloudinary.com/dp0c5nive/image/upload/v1780241720/ecommerce/toys-games/photo-1614741118887-7a4ee193a5fa.webp",
  ],
};
const categoryCounters: Record<string, number> = {};

function getRichProductData(categorySlug: string) {
  const images = IMAGE_POOLS[categorySlug] || IMAGE_POOLS.default;

  categoryCounters[categorySlug] = categoryCounters[categorySlug] ?? 0;
  const thumbnail = images[categoryCounters[categorySlug] % images.length];
  categoryCounters[categorySlug]++;

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
    images: [thumbnail, ...images.filter((img) => img !== thumbnail)],
    thumbnail,
    attributes,
  };
}

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
    { name: "Wireless Headphones", price: 129.99, description: "Noise cancelling." },
    { name: "4K Smart TV", price: 799.99, description: "OLED panel." },
    { name: "Gaming Laptop", price: 1299.99, description: "High performance gaming." },
    { name: "Bluetooth Speaker", price: 79.99, description: "Portable sound system." },
    { name: "Smartwatch", price: 249.99, description: "Fitness tracking." },
    { name: "Wireless Mouse", price: 39.99, description: "Ergonomic design." },
    { name: "Mechanical Keyboard", price: 149.99, description: "RGB backlit." },
    { name: "USB-C Hub", price: 59.99, description: "Multi-port adapter." },
    { name: "Webcam", price: 89.99, description: "1080p HD video." },
    { name: "External SSD", price: 119.99, description: "1TB storage." },
    { name: "Power Bank", price: 44.99, description: "20000mAh capacity." },
    { name: "Ring Light", price: 34.99, description: "For video calls." },
    { name: "Graphics Tablet", price: 199.99, description: "Digital drawing pad." },
    { name: "Wireless Earbuds", price: 99.99, description: "True wireless." },
    { name: "Portable Monitor", price: 229.99, description: "15.6 inch display." },
    { name: "Drone", price: 499.99, description: "4K camera drone." },
    { name: "Action Camera", price: 279.99, description: "Waterproof 4K." },
    { name: "E-Reader", price: 139.99, description: "Digital book reader." },
    { name: "VR Headset", price: 399.99, description: "Virtual reality." },
    { name: "Security Camera", price: 69.99, description: "WiFi enabled." },
  ],
  books: [
    { name: "Clean Code", price: 29.99, description: "A Handbook of Agile Software Craftsmanship." },
    { name: "The Pragmatic Programmer", price: 39.99, description: "Your journey to mastery." },
    { name: "Design Patterns", price: 44.99, description: "Elements of reusable software." },
    { name: "Refactoring", price: 34.99, description: "Improving code design." },
    { name: "Clean Architecture", price: 32.99, description: "Software structure and design." },
    { name: "Domain-Driven Design", price: 49.99, description: "Tackling complexity." },
    { name: "The DevOps Handbook", price: 37.99, description: "Technology transformation." },
    { name: "Site Reliability Engineering", price: 42.99, description: "How Google runs systems." },
    { name: "Kubernetes in Action", price: 44.99, description: "Container orchestration." },
    { name: "Python Crash Course", price: 29.99, description: "Learn programming basics." },
    { name: "JavaScript: The Good Parts", price: 27.99, description: "Master the language." },
    { name: "You Don't Know JS", price: 24.99, description: "Deep dive into JavaScript." },
    { name: "Eloquent JavaScript", price: 26.99, description: "Modern introduction." },
    { name: "Code Complete", price: 46.99, description: "Practical handbook." },
    { name: "The Mythical Man-Month", price: 31.99, description: "Software engineering essays." },
    { name: "Head First Design Patterns", price: 39.99, description: "Brain-friendly guide." },
    { name: "Working Effectively with Legacy Code", price: 41.99, description: "Transform old code." },
    { name: "The Clean Coder", price: 28.99, description: "Professional conduct." },
    { name: "Test Driven Development", price: 36.99, description: "By example." },
    { name: "Continuous Delivery", price: 43.99, description: "Reliable software releases." },
  ],
  clothing: [
    { name: "Graphic T-Shirt", price: 19.99, description: "Cotton t-shirt." },
    { name: "Hoodie", price: 49.99, description: "Warm developer hoodie." },
    { name: "Denim Jeans", price: 59.99, description: "Classic fit denim." },
    { name: "Leather Jacket", price: 199.99, description: "Genuine leather." },
    { name: "Running Shoes", price: 89.99, description: "Cushioned running shoes." },
    { name: "Polo Shirt", price: 34.99, description: "Business casual." },
    { name: "Cargo Pants", price: 44.99, description: "Multi-pocket pants." },
    { name: "Winter Coat", price: 149.99, description: "Insulated winter wear." },
    { name: "Baseball Cap", price: 24.99, description: "Adjustable cap." },
    { name: "Sneakers", price: 79.99, description: "Casual footwear." },
    { name: "Sweatpants", price: 39.99, description: "Comfortable lounge wear." },
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
    { name: "Food Storage Containers", price: 44.99, description: "BPA-free set." },
    { name: "Trash Can", price: 49.99, description: "Touchless sensor." },
    { name: "Dish Soap Dispenser", price: 19.99, description: "Automatic dispenser." },
    { name: "Oven Mitts", price: 16.99, description: "Heat resistant." },
    { name: "Kitchen Scale", price: 27.99, description: "Digital weighing." },
    { name: "Can Opener", price: 22.99, description: "Electric opener." },
    { name: "Spice Rack", price: 39.99, description: "Wall-mounted rack." },
    { name: "Wine Glasses Set", price: 54.99, description: "Crystal glass set." },
    { name: "Table Lamp", price: 64.99, description: "LED reading lamp." },
    { name: "Throw Pillows", price: 29.99, description: "Decorative cushions." },
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
    { name: "Tennis Racket", price: 89.99, description: "Professional racket." },
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
    { name: "Building Blocks Set", price: 49.99, description: "500-piece set." },
    { name: "Board Game", price: 34.99, description: "Family game night." },
    { name: "Puzzle", price: 24.99, description: "1000-piece puzzle." },
    { name: "Remote Control Car", price: 79.99, description: "High-speed RC car." },
    { name: "Action Figure", price: 19.99, description: "Collectible figure." },
    { name: "Dollhouse", price: 149.99, description: "Wooden dollhouse." },
    { name: "Play Kitchen", price: 119.99, description: "Pretend play set." },
    { name: "Art Supplies Kit", price: 39.99, description: "Complete art set." },
    { name: "Science Kit", price: 54.99, description: "Educational experiments." },
    { name: "Musical Instrument Toy", price: 44.99, description: "Kids keyboard." },
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
    { name: "Essential Oil Set", price: 44.99, description: "Aromatherapy oils." },
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
    { name: "Tire Pressure Gauge", price: 14.99, description: "Digital gauge." },
    { name: "Emergency Kit", price: 44.99, description: "Roadside kit." },
    { name: "Car Wax", price: 19.99, description: "Protective coating." },
    { name: "Windshield Wipers", price: 24.99, description: "Premium blades." },
    { name: "Air Freshener", price: 9.99, description: "Long-lasting scent." },
    { name: "USB Car Charger", price: 16.99, description: "Fast charging." },
    { name: "Steering Wheel Cover", price: 18.99, description: "Leather grip." },
    { name: "Trunk Organizer", price: 34.99, description: "Collapsible storage." },
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
    { name: "Paper Shredder", price: 79.99, description: "Cross-cut shredder." },
    { name: "Label Maker", price: 34.99, description: "Portable labeler." },
    { name: "Calendar", price: 19.99, description: "Wall calendar." },
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

async function main() {
  console.log("🌱 Starting Seed...");

  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.outboxEvent.deleteMany();
  await clearRedisStock();

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
          createdProduct.stockQuantity,
        );
      });
    }
  }

  console.log("✅ Seeding done.");
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
