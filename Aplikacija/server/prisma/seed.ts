import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
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
        name: "Hidden Gems",
        description: "Lesser-known spots off the beaten path",
        icon: "gem",
      },
      {
        name: "Scenic",
        description: "Panoramic views and beautiful landscapes",
        icon: "mountain",
      },
      {
        name: "Gastronomic",
        description: "Food, drinks and local specialties",
        icon: "utensils",
      },
      {
        name: "Fast Route",
        description: "Quick and efficient routes",
        icon: "zap",
      },
      {
        name: "Fishing",
        description: "Fishing spots and riverside routes",
        icon: "fish",
      },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany();
  const hiddenGems = categories.find((c) => c.name === "Hidden Gems")!;
  const scenic = categories.find((c) => c.name === "Scenic")!;
  const gastronomic = categories.find((c) => c.name === "Gastronomic")!;
  const fishing = categories.find((c) => c.name === "Fishing")!;

  console.log(`Created ${categories.length} categories`);

  // ---USERS---
  // TODO:replace passwords
  const admin = await prisma.user.upsert({
    where: { email: "admin@waypoint.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@waypoint.com",
      passwordHash: "hashed_password_here",
      role: "admin",
    },
  });

  const miroslav = await prisma.user.upsert({
    where: { email: "miroslav@waypoint.com" },
    update: {},
    create: {
      name: "Miroslav Vucetic",
      email: "miroslav@waypoint.com",
      passwordHash: "hashed_password_here",
      role: "user",
    },
  });

  const strahinja = await prisma.user.upsert({
    where: { email: "strahinja@waypoint.com" },
    update: {},
    create: {
      name: "Strahinja Aleksic",
      email: "strahinja@waypoint.com",
      passwordHash: "hashed_password_here",
      role: "user",
    },
  });

  const petar = await prisma.user.upsert({
    where: { email: "petar@waypoint.com" },
    update: {},
    create: {
      name: "Petar Petrovic",
      email: "petar@waypoint.com",
      passwordHash: "hashed_password_here",
      role: "user",
    },
  });

  console.log("Created users");

  // ---POINT DESTINATIONS---
  // geometry is inserted via raw SQL since prisma doesn't support postgis natively
  // we create the row first, then update geometry in a separate query.

  const nisFortress = await prisma.destination.create({
    data: {
      title: "Nis Fortress",
      description:
        "A well-preserved 18th-century Ottoman fortress in the heart of Nis, with a riverside promenade along the ramparts and an open-air summer stage inside the walls.",
      images: [],
      userId: miroslav.id,
      categoryId: scenic.id,
      type: "point",
      city: "Nis",
      country: "Serbia",
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.8954, 43.3197), 4326)
    WHERE id = ${nisFortress.id}
  `;

  const kafanaMarjan = await prisma.destination.create({
    data: {
      title: "Kafana Marjan",
      description:
        "The oldest kafana in the Nisava district, open for over 50 years. Famous for incredibly fast service, cheap traditional Serbian food, and free salads and pogaca bread with every order. Always packed — reserve ahead.",
      images: [],
      userId: petar.id,
      categoryId: gastronomic.id,
      type: "point",
      city: "Drazevac",
      country: "Serbia",
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
      title: "Nisava Fishing Bank - Duvaniste",
      description:
        "A calm, accessible stretch of the Nisava riverbank in Duvaniste, popular with local anglers. Good for carp and chub, especially in early morning.",
      images: [],
      userId: strahinja.id,
      categoryId: fishing.id,
      type: "point",
      city: "Nis",
      country: "Serbia",
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.9178, 43.3089), 4326)
    WHERE id = ${duvanisteBank.id}
  `;

  const underBridgeSpot = await prisma.destination.create({
    data: {
      title: "Under the Old Bridge - Nisava",
      description:
        "A shaded fishing spot beneath an old road bridge on the Nisava, between Duvaniste and Brzi Brod. Quieter than the main banks and less frequented by passers-by.",
      images: [],
      userId: strahinja.id,
      categoryId: fishing.id,
      type: "point",
      city: "Nis",
      country: "Serbia",
    },
  });

  await prisma.$executeRaw`
    UPDATE destinations
    SET geometry = ST_SetSRID(ST_MakePoint(21.9312, 43.3124), 4326)
    WHERE id = ${underBridgeSpot.id}
  `;

  const brziBrodBank = await prisma.destination.create({
    data: {
      title: "Nisava Fishing Bank - Brzi Brod",
      description:
        "A well-known fishing spot at the Brzi Brod stretch of the Nisava, about 6km east of the city center. Known for catfish and carp. Easy access from the road.",
      images: [],
      userId: petar.id,
      categoryId: fishing.id,
      type: "point",
      city: "Nis",
      country: "Serbia",
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
      title: "Skull Tower (Cele Kula)",
      description:
        "A macabre but historically significant tower built by the Ottomans in 1809 using the skulls of Serbian rebels after the Battle of Cegar. One of the most unique monuments in the Balkans, now enclosed in a chapel.",
      images: [],
      userId: strahinja.id,
      categoryId: hiddenGems.id,
      type: "point",
      city: "Nis",
      country: "Serbia",
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
      title: "Bubanj Forest Walk",
      description:
        "A peaceful forest walk through Bubanj hill, home to one of the largest WWII memorials in Serbia. Well-marked trails wind through oak and pine forest with views over the city. Popular with locals for morning walks.",
      images: [],
      userId: petar.id,
      categoryId: scenic.id,
      type: "point",
      city: "Nis",
      country: "Serbia",
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
      title: "Nisava Fishing Route - Duvaniste to Brzi Brod",
      description:
        "A riverside fishing route following the Nisava from the Duvaniste bank eastward to Brzi Brod. Three proven spots along the way, all within easy walking or cycling distance of each other.",
      images: [],
      userId: miroslav.id,
      categoryId: fishing.id,
      type: "route",
      city: "Nis",
      country: "Serbia",
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
      { routeId: nisavaFishingRoute.id, pointId: duvanisteBank.id, position: 1 },
      { routeId: nisavaFishingRoute.id, pointId: underBridgeSpot.id, position: 2 },
      { routeId: nisavaFishingRoute.id, pointId: brziBrodBank.id, position: 3 },
    ],
  });

  console.log("Linked route points");

  // ---REVIEWS---
  await prisma.review.createMany({
    data: [
      {
        userId: petar.id,
        destinationId: nisFortress.id,
        rating: 5,
        comment:
          "Beautiful place for an evening walk. The lights on the ramparts at night are stunning.",
        images: [],
      },
      {
        userId: miroslav.id,
        destinationId: kafanaMarjan.id,
        rating: 5,
        comment:
          "Stopped here on the way back from Aleksinac. Food came in under 10 minutes, the free salads alone are worth the visit. Unreal value.",
        images: [],
      },
      {
        userId: strahinja.id,
        destinationId: kafanaMarjan.id,
        rating: 5,
        comment:
          "Been coming here for years. Always packed, always good. The roast pork in clay pot is a must.",
        images: [],
      },
      {
        userId: petar.id,
        destinationId: duvanisteBank.id,
        rating: 4,
        comment:
          "Good spot, easy to get to. Caught two decent carp early in the morning. Bring your own shade.",
        images: [],
      },
      {
        userId: strahinja.id,
        destinationId: brziBrodBank.id,
        rating: 4,
        comment:
          "Solid spot at Brzi Brod. More secluded than the city banks and worth the short drive.",
        images: [],
      },
      {
        userId: miroslav.id,
        destinationId: nisavaFishingRoute.id,
        rating: 5,
        comment:
          "Did the whole route on a Saturday morning with a friend. Tried all three spots — the bridge one is the best kept secret.",
        images: [],
      },
      {
        userId: miroslav.id,
        destinationId: skullTower.id,
        rating: 5,
        comment:
          "Genuinely one of the most unusual monuments in Europe. Dark history but incredibly well presented.",
        images: [],
      },
      {
        userId: petar.id,
        destinationId: bubanjWalk.id,
        rating: 4,
        comment:
          "Great morning walk through the forest. The WWII memorial is massive and worth seeing. Quiet and well maintained.",
        images: [],
      },
    ],
  });

  console.log("Created reviews");
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
