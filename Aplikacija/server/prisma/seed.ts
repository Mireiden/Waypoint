import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";
import config from "../src/config/config.js";

const adapter = new PrismaPg({
  connectionString: config.db.url,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data in dependency order
  await prisma.routePoint.deleteMany();
  await prisma.review.deleteMany();
  await prisma.report.deleteMany();
  await prisma.destination.deleteMany();

  // ---CATEGORIES---
  await prisma.category.createMany({
    data: [
      {
        description: "Lesser-known spots off the beaten path",
        icon: "gem",
        name: "Hidden Gems",
      },
      {
        description: "Panoramic views and beautiful landscapes",
        icon: "mountain",
        name: "Scenic",
      },
      {
        description: "Food, drinks and local specialties",
        icon: "utensils",
        name: "Gastronomic",
      },
      {
        description: "Quick and efficient routes",
        icon: "zap",
        name: "Fast Route",
      },
      {
        description: "Fishing spots and riverside routes",
        icon: "fish",
        name: "Fishing",
      },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany();
  const hiddenGems = categories.find((c) => c.name === "Hidden Gems");
  const scenic = categories.find((c) => c.name === "Scenic");
  const gastronomic = categories.find((c) => c.name === "Gastronomic");
  const fishing = categories.find((c) => c.name === "Fishing");

  console.log(`Created ${String(categories.length)} categories`);

  // ---USERS---
  // TODO:replace passwords
  const admin = await prisma.user.upsert({
    create: {
      email: "admin@waypoint.com",
      name: "Admin",
      passwordHash: "hashed_password_here",
      role: "admin",
    },
    update: {},
    where: { email: "admin@waypoint.com" },
  });

  const miroslav = await prisma.user.upsert({
    create: {
      email: "miroslav@waypoint.com",
      name: "Miroslav Vucetic",
      passwordHash: "hashed_password_here",
      role: "user",
    },
    update: {},
    where: { email: "miroslav@waypoint.com" },
  });

  const strahinja = await prisma.user.upsert({
    create: {
      email: "strahinja@waypoint.com",
      name: "Strahinja Aleksic",
      passwordHash: "hashed_password_here",
      role: "user",
    },
    update: {},
    where: { email: "strahinja@waypoint.com" },
  });

  const petar = await prisma.user.upsert({
    create: {
      email: "petar@waypoint.com",
      name: "Petar Petrovic",
      passwordHash: "hashed_password_here",
      role: "user",
    },
    update: {},
    where: { email: "petar@waypoint.com" },
  });

  console.log("Created users");

  // ---POINT DESTINATIONS---
  // geometry is inserted via raw SQL since prisma doesn't support postgis natively
  // we create the row first, then update geometry in a separate query.

  const nisFortress = await prisma.destination.create({
    data: {
      categoryId: scenic.id,
      city: "Nis",
      country: "Serbia",
      description:
        "A well-preserved 18th-century Ottoman fortress in the heart of Nis, with a riverside promenade along the ramparts and an open-air summer stage inside the walls.",
      images: [],
      title: "Nis Fortress",
      type: "point",
      userId: miroslav.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.8954, 43.3197), 4326)
    WHERE id = ${nisFortress.id}
  `;

  const kafanaMarjan = await prisma.destination.create({
    data: {
      categoryId: gastronomic.id,
      city: "Drazevac",
      country: "Serbia",
      description:
        "The oldest kafana in the Nisava district, open for over 50 years. Famous for incredibly fast service, cheap traditional Serbian food, and free salads and pogaca bread with every order. Always packed — reserve ahead.",
      images: [],
      title: "Kafana Marjan",
      type: "point",
      userId: petar.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.7889, 43.4497), 4326)
    WHERE id = ${kafanaMarjan.id}
  `;

  // Fishing stops along the Nisava between Duvaniste and Brzi Brod
  const duvanisteBank = await prisma.destination.create({
    data: {
      categoryId: fishing.id,
      city: "Nis",
      country: "Serbia",
      description:
        "A calm, accessible stretch of the Nisava riverbank in Duvaniste, popular with local anglers. Good for carp and chub, especially in early morning.",
      images: [],
      title: "Nisava Fishing Bank - Duvaniste",
      type: "point",
      userId: strahinja.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.9178, 43.3089), 4326)
    WHERE id = ${duvanisteBank.id}
  `;

  const underBridgeSpot = await prisma.destination.create({
    data: {
      categoryId: fishing.id,
      city: "Nis",
      country: "Serbia",
      description:
        "A shaded fishing spot beneath an old road bridge on the Nisava, between Duvaniste and Brzi Brod. Quieter than the main banks and less frequented by passers-by.",
      images: [],
      title: "Under the Old Bridge - Nisava",
      type: "point",
      userId: strahinja.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.9312, 43.3124), 4326)
    WHERE id = ${underBridgeSpot.id}
  `;

  const brziBrodBank = await prisma.destination.create({
    data: {
      categoryId: fishing.id,
      city: "Nis",
      country: "Serbia",
      description:
        "A well-known fishing spot at the Brzi Brod stretch of the Nisava, about 6km east of the city center. Known for catfish and carp. Easy access from the road.",
      images: [],
      title: "Nisava Fishing Bank - Brzi Brod",
      type: "point",
      userId: petar.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.9534, 43.3201), 4326)
    WHERE id = ${brziBrodBank.id}
  `;

  // Two extra destinations
  const skullTower = await prisma.destination.create({
    data: {
      categoryId: hiddenGems.id,
      city: "Nis",
      country: "Serbia",
      description:
        "A macabre but historically significant tower built by the Ottomans in 1809 using the skulls of Serbian rebels after the Battle of Cegar. One of the most unique monuments in the Balkans, now enclosed in a chapel.",
      images: [],
      title: "Skull Tower (Cele Kula)",
      type: "point",
      userId: strahinja.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.9123, 43.3178), 4326)
    WHERE id = ${skullTower.id}
  `;

  // Bubanj is a forested hill west of Nis, known for a large WWII memorial and walking trails
  const bubanjWalk = await prisma.destination.create({
    data: {
      categoryId: scenic.id,
      city: "Nis",
      country: "Serbia",
      description:
        "A peaceful forest walk through Bubanj hill, home to one of the largest WWII memorials in Serbia. Well-marked trails wind through oak and pine forest with views over the city. Popular with locals for morning walks.",
      images: [],
      title: "Bubanj Forest Walk",
      type: "point",
      userId: petar.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.8723, 43.3098), 4326)
    WHERE id = ${bubanjWalk.id}
  `;

  console.log("Created 7 point destinations");

  // ---ROUTE DESTINATIONS---
  const nisavaFishingRoute = await prisma.destination.create({
    data: {
      categoryId: fishing.id,
      city: "Nis",
      country: "Serbia",
      description:
        "A riverside fishing route following the Nisava from the Duvaniste bank eastward to Brzi Brod. Three proven spots along the way, all within easy walking or cycling distance of each other.",
      images: [],
      title: "Nisava Fishing Route - Duvaniste to Brzi Brod",
      type: "route",
      userId: miroslav.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(
      ST_MakeLine(ARRAY[
        ST_MakePoint(21.9178, 43.3089),
        ST_MakePoint(21.9312, 43.3124),
        ST_MakePoint(21.9534, 43.3201)
      ]),
      4326
    )
    WHERE id = ${nisavaFishingRoute.id}
  `;

  console.log("Created 1 route destination");

  // ---ROUTE POINTS---
  await prisma.routePoint.createMany({
    data: [
      { pointId: duvanisteBank.id, position: 1, routeId: nisavaFishingRoute.id },
      { pointId: underBridgeSpot.id, position: 2, routeId: nisavaFishingRoute.id },
      { pointId: brziBrodBank.id, position: 3, routeId: nisavaFishingRoute.id },
    ],
  });

  console.log("Linked route points");

  // ---REVIEWS---
  await prisma.review.createMany({
    data: [
      {
        comment:
          "Beautiful place for an evening walk. The lights on the ramparts at night are stunning.",
        destinationId: nisFortress.id,
        images: [],
        rating: 5,
        userId: petar.id,
      },
      {
        comment:
          "Stopped here on the way back from Aleksinac. Food came in under 10 minutes, the free salads alone are worth the visit. Unreal value.",
        destinationId: kafanaMarjan.id,
        images: [],
        rating: 5,
        userId: miroslav.id,
      },
      {
        comment:
          "Been coming here for years. Always packed, always good. The roast pork in clay pot is a must.",
        destinationId: kafanaMarjan.id,
        images: [],
        rating: 5,
        userId: strahinja.id,
      },
      {
        comment:
          "Good spot, easy to get to. Caught two decent carp early in the morning. Bring your own shade.",
        destinationId: duvanisteBank.id,
        images: [],
        rating: 4,
        userId: petar.id,
      },
      {
        comment:
          "Solid spot at Brzi Brod. More secluded than the city banks and worth the short drive.",
        destinationId: brziBrodBank.id,
        images: [],
        rating: 4,
        userId: strahinja.id,
      },
      {
        comment:
          "Did the whole route on a Saturday morning with a friend. Tried all three spots — the bridge one is the best kept secret.",
        destinationId: nisavaFishingRoute.id,
        images: [],
        rating: 5,
        userId: miroslav.id,
      },
      {
        comment:
          "Genuinely one of the most unusual monuments in Europe. Dark history but incredibly well presented.",
        destinationId: skullTower.id,
        images: [],
        rating: 5,
        userId: miroslav.id,
      },
      {
        comment:
          "Great morning walk through the forest. The WWII memorial is massive and worth seeing. Quiet and well maintained.",
        destinationId: bubanjWalk.id,
        images: [],
        rating: 4,
        userId: petar.id,
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
