import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

import { PrismaClient } from "../generated/prisma/client.js";
import config from "../src/config/config.js";

const adapter = new PrismaPg({
  connectionString: config.db.url,
});

const prisma = new PrismaClient({ adapter });

// shared dev password for every seeded account
const DEV_PASSWORD = "password123";

interface LineStringGeometry {
  coordinates: [number, number][];
  type: "LineString";
}

interface PointGeometry {
  coordinates: [number, number];
  type: "Point";
}

interface SeedDestination {
  categoryId: number;
  city: string;
  country: string;
  description: string;
  geometry: LineStringGeometry | PointGeometry;
  title: string;
  type: "point" | "route";
  userId: number;
}

// Inserts a destination with its geometry in a single statement.
// geometry is an Unsupported PostGIS column, so it must be built in raw SQL
// (ST_GeomFromGeoJSON handles both Point and LineString uniformly). The old
// create-then-update approach broke once geometry was made NOT NULL.
async function createDestination(d: SeedDestination): Promise<number> {
  const rows = await prisma.$queryRaw<{ id: number }[]>`
    INSERT INTO destinations (title, description, type, geometry, city, country, user_id, category_id)
    VALUES (
      ${d.title},
      ${d.description},
      ${d.type}::"DestinationType",
      ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(d.geometry)}), 4326),
      ${d.city},
      ${d.country},
      ${d.userId},
      ${d.categoryId}
    )
    RETURNING id
  `;
  const row = rows[0];
  if (!row) throw new Error(`Failed to insert destination: ${d.title}`);
  return row.id;
}

const point = (lng: number, lat: number): PointGeometry => ({
  type: "Point",
  coordinates: [lng, lat],
});

async function main() {
  console.log("Seeding database...");

  // clear existing data in dependency order
  await prisma.media.deleteMany();
  await prisma.routePoint.deleteMany();
  await prisma.review.deleteMany();
  await prisma.report.deleteMany();
  await prisma.destination.deleteMany();

  // ---CATEGORIES---
  // upsert by unique name: idempotent, no duplicates
  const categoryData = [
    { description: "Lesser-known spots off the beaten path", icon: "gem", name: "Hidden Gems" },
    { description: "Panoramic views and beautiful landscapes", icon: "mountain", name: "Scenic" },
    { description: "Food, drinks and local specialties", icon: "utensils", name: "Gastronomic" },
    { description: "Quick and efficient routes", icon: "zap", name: "Fast Route" },
    { description: "Fishing spots and riverside routes", icon: "fish", name: "Fishing" },
  ];
  for (const c of categoryData) {
    await prisma.category.upsert({ create: c, update: c, where: { name: c.name } });
  }

  const categories = await prisma.category.findMany();
  const categoryId = (name: string): number => {
    const found = categories.find((c) => c.name === name);
    if (!found) throw new Error(`Category not found: ${name}`);
    return found.id;
  };
  console.log(`Created ${String(categories.length)} categories`);

  // ---USERS---
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const userData = [
    { email: "admin@waypoint.com", name: "Admin", role: "admin" as const },
    { email: "miroslav@waypoint.com", name: "Miroslav Vucetic", role: "user" as const },
    { email: "strahinja@waypoint.com", name: "Strahinja Aleksic", role: "user" as const },
    { email: "petar@waypoint.com", name: "Petar Petrovic", role: "user" as const },
  ];
  for (const u of userData) {
    await prisma.user.upsert({
      create: { ...u, passwordHash },
      update: { passwordHash },
      where: { email: u.email },
    });
  }
  const users = await prisma.user.findMany();
  const userId = (email: string): number => {
    const found = users.find((u) => u.email === email);
    if (!found) throw new Error(`User not found: ${email}`);
    return found.id;
  };
  console.log(`Created ${String(userData.length)} users (password for all: ${DEV_PASSWORD})`);

  // ---POINT DESTINATIONS---
  const nisFortress = await createDestination({
    title: "Nis Fortress",
    description:
      "A well-preserved 18th-century Ottoman fortress in the heart of Nis, with a riverside promenade along the ramparts and an open-air summer stage inside the walls.",
    type: "point",
    geometry: point(21.8954, 43.3197),
    city: "Nis",
    country: "Serbia",
    userId: userId("miroslav@waypoint.com"),
    categoryId: categoryId("Scenic"),
  });

  const kafanaMarjan = await createDestination({
    title: "Kafana Marjan",
    description:
      "The oldest kafana in the Nisava district, open for over 50 years. Famous for incredibly fast service, cheap traditional Serbian food, and free salads and pogaca bread with every order. Always packed — reserve ahead.",
    type: "point",
    geometry: point(21.7889, 43.4497),
    city: "Drazevac",
    country: "Serbia",
    userId: userId("petar@waypoint.com"),
    categoryId: categoryId("Gastronomic"),
  });

  const duvanisteBank = await createDestination({
    title: "Nisava Fishing Bank - Duvaniste",
    description:
      "A calm, accessible stretch of the Nisava riverbank in Duvaniste, popular with local anglers. Good for carp and chub, especially in early morning.",
    type: "point",
    geometry: point(21.9178, 43.3089),
    city: "Nis",
    country: "Serbia",
    userId: userId("strahinja@waypoint.com"),
    categoryId: categoryId("Fishing"),
  });

  const underBridgeSpot = await createDestination({
    title: "Under the Old Bridge - Nisava",
    description:
      "A shaded fishing spot beneath an old road bridge on the Nisava, between Duvaniste and Brzi Brod. Quieter than the main banks and less frequented by passers-by.",
    type: "point",
    geometry: point(21.9312, 43.3124),
    city: "Nis",
    country: "Serbia",
    userId: userId("strahinja@waypoint.com"),
    categoryId: categoryId("Fishing"),
  });

  const brziBrodBank = await createDestination({
    title: "Nisava Fishing Bank - Brzi Brod",
    description:
      "A well-known fishing spot at the Brzi Brod stretch of the Nisava, about 6km east of the city center. Known for catfish and carp. Easy access from the road.",
    type: "point",
    geometry: point(21.9534, 43.3201),
    city: "Nis",
    country: "Serbia",
    userId: userId("petar@waypoint.com"),
    categoryId: categoryId("Fishing"),
  });

  const skullTower = await createDestination({
    title: "Skull Tower (Cele Kula)",
    description:
      "A macabre but historically significant tower built by the Ottomans in 1809 using the skulls of Serbian rebels after the Battle of Cegar. One of the most unique monuments in the Balkans, now enclosed in a chapel.",
    type: "point",
    geometry: point(21.9123, 43.3178),
    city: "Nis",
    country: "Serbia",
    userId: userId("strahinja@waypoint.com"),
    categoryId: categoryId("Hidden Gems"),
  });

  const bubanjWalk = await createDestination({
    title: "Bubanj Forest Walk",
    description:
      "A peaceful forest walk through Bubanj hill, home to one of the largest WWII memorials in Serbia. Well-marked trails wind through oak and pine forest with views over the city. Popular with locals for morning walks.",
    type: "point",
    geometry: point(21.8723, 43.3098),
    city: "Nis",
    country: "Serbia",
    userId: userId("petar@waypoint.com"),
    categoryId: categoryId("Scenic"),
  });

  console.log("Created 7 point destinations");

  // ---ROUTE DESTINATION---
  const nisavaFishingRoute = await createDestination({
    title: "Nisava Fishing Route - Duvaniste to Brzi Brod",
    description:
      "A riverside fishing route following the Nisava from the Duvaniste bank eastward to Brzi Brod. Three proven spots along the way, all within easy walking or cycling distance of each other.",
    type: "route",
    geometry: {
      type: "LineString",
      coordinates: [
        [21.9178, 43.3089],
        [21.9312, 43.3124],
        [21.9534, 43.3201],
      ],
    },
    city: "Nis",
    country: "Serbia",
    userId: userId("miroslav@waypoint.com"),
    categoryId: categoryId("Fishing"),
  });
  console.log("Created 1 route destination");

  // ---ROUTE POINTS---
  await prisma.routePoint.createMany({
    data: [
      { pointId: duvanisteBank, position: 1, routeId: nisavaFishingRoute },
      { pointId: underBridgeSpot, position: 2, routeId: nisavaFishingRoute },
      { pointId: brziBrodBank, position: 3, routeId: nisavaFishingRoute },
    ],
  });
  console.log("Linked route points");

  // ---MEDIA---
  // placeholder images so frontend cards/galleries have content, swap for real
  // cloudinary uploads later
  await prisma.media.createMany({
    data: [
      {
        destinationId: nisFortress,
        url: "https://picsum.photos/seed/nisfortress1/800/600",
        publicId: "seed_nisfortress_1",
        type: "image",
        position: 0,
      },
      {
        destinationId: nisFortress,
        url: "https://picsum.photos/seed/nisfortress2/800/600",
        publicId: "seed_nisfortress_2",
        type: "image",
        position: 1,
      },
      {
        destinationId: kafanaMarjan,
        url: "https://picsum.photos/seed/kafana1/800/600",
        publicId: "seed_kafana_1",
        type: "image",
        position: 0,
      },
      {
        destinationId: skullTower,
        url: "https://picsum.photos/seed/skulltower1/800/600",
        publicId: "seed_skulltower_1",
        type: "image",
        position: 0,
      },
      {
        destinationId: bubanjWalk,
        url: "https://picsum.photos/seed/bubanj1/800/600",
        publicId: "seed_bubanj_1",
        type: "image",
        position: 0,
      },
      {
        destinationId: nisavaFishingRoute,
        url: "https://picsum.photos/seed/route1/800/600",
        publicId: "seed_route_1",
        type: "image",
        position: 0,
      },
    ],
  });
  console.log("Created media");

  // ---REVIEWS---
  await prisma.review.createMany({
    data: [
      {
        comment:
          "Beautiful place for an evening walk. The lights on the ramparts at night are stunning.",
        destinationId: nisFortress,
        rating: 5,
        userId: userId("petar@waypoint.com"),
      },
      {
        comment:
          "Stopped here on the way back from Aleksinac. Food came in under 10 minutes, the free salads alone are worth the visit. Unreal value.",
        destinationId: kafanaMarjan,
        rating: 5,
        userId: userId("miroslav@waypoint.com"),
      },
      {
        comment:
          "Been coming here for years. Always packed, always good. The roast pork in clay pot is a must.",
        destinationId: kafanaMarjan,
        rating: 5,
        userId: userId("strahinja@waypoint.com"),
      },
      {
        comment:
          "Good spot, easy to get to. Caught two decent carp early in the morning. Bring your own shade.",
        destinationId: duvanisteBank,
        rating: 4,
        userId: userId("petar@waypoint.com"),
      },
      {
        comment:
          "Solid spot at Brzi Brod. More secluded than the city banks and worth the short drive.",
        destinationId: brziBrodBank,
        rating: 4,
        userId: userId("strahinja@waypoint.com"),
      },
      {
        comment:
          "Did the whole route on a Saturday morning with a friend. Tried all three spots — the bridge one is the best kept secret.",
        destinationId: nisavaFishingRoute,
        rating: 5,
        userId: userId("miroslav@waypoint.com"),
      },
      {
        comment:
          "Genuinely one of the most unusual monuments in Europe. Dark history but incredibly well presented.",
        destinationId: skullTower,
        rating: 5,
        userId: userId("miroslav@waypoint.com"),
      },
      {
        comment:
          "Great morning walk through the forest. The WWII memorial is massive and worth seeing. Quiet and well maintained.",
        destinationId: bubanjWalk,
        rating: 4,
        userId: userId("petar@waypoint.com"),
      },
    ],
  });
  console.log("Created reviews");

  console.log("Seeding complete.");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
