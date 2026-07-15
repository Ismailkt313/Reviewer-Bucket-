import { connectDatabase, disconnectDatabase } from "../src/config/database";
import { ReviewerModel } from "../src/modules/reviewers/reviewer.model";

const seedData = [
  { name: "Vipin", code: "BR 64", slug: "br-64", stacks: [] },
  { name: "Anwar", code: "BR 12", slug: "br-12", stacks: [] },
  { name: "Sreejith", code: "BR 07", slug: "br-07", stacks: [] },
  { name: "Rashid", code: "BR 45", slug: "br-45", stacks: [] },
  { name: "Nizam", code: "BR 31", slug: "br-31", stacks: [] },
  { name: "Faiz", code: "BR 19", slug: "br-19", stacks: [] },
  { name: "Ajmal", code: "BR 53", slug: "br-53", stacks: [] },
  { name: "Shameer", code: "BR 88", slug: "br-88", stacks: [] },
  { name: "Noufal", code: "BR 22", slug: "br-22", stacks: [] },
  { name: "Subin", code: "BR 76", slug: "br-76", stacks: [] },
  { name: "Arun", code: "BR 03", slug: "br-03", stacks: [] },
  { name: "Deepak", code: "BR 41", slug: "br-41", stacks: [] },
  { name: "Jithin", code: "BR 58", slug: "br-58", stacks: [] },
  { name: "Hafiz", code: "BR 35", slug: "br-35", stacks: [] },
  { name: "Shibin", code: "BR 90", slug: "br-90", stacks: [] },
  { name: "Riyas", code: "BR 14", slug: "br-14", stacks: [] },
  { name: "Vineeth", code: "BR 67", slug: "br-67", stacks: [] },
  { name: "Suhail", code: "BR 29", slug: "br-29", stacks: [] },
  { name: "Ashiq", code: "BR 82", slug: "br-82", stacks: [] },
  { name: "Nabeel", code: "BR 06", slug: "br-06", stacks: [] }
];

async function seed() {
  let createdCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  try {
    await connectDatabase();

    for (const seedItem of seedData) {
      const existing = await ReviewerModel.findOne({ code: seedItem.code });
      if (!existing) {
        const slugConflict = await ReviewerModel.findOne({ slug: seedItem.slug });
        if (slugConflict) {
          throw new Error(
            `Slug conflict: Reviewer with slug "${seedItem.slug}" already exists with code "${slugConflict.code}"`
          );
        }
        await ReviewerModel.create({
          name: seedItem.name,
          code: seedItem.code,
          slug: seedItem.slug,
          stacks: seedItem.stacks
        });
        createdCount++;
      } else {
        const hasNameChanged = existing.name !== seedItem.name;
        const hasSlugChanged = existing.slug !== seedItem.slug;
        const hasStacksChanged =
          JSON.stringify(existing.stacks) !== JSON.stringify(seedItem.stacks);

        if (hasNameChanged || hasSlugChanged || hasStacksChanged) {
          if (hasSlugChanged) {
            const slugConflict = await ReviewerModel.findOne({ slug: seedItem.slug });
            if (slugConflict && slugConflict.code !== seedItem.code) {
              throw new Error(
                `Slug conflict: Reviewer with slug "${seedItem.slug}" already exists with code "${slugConflict.code}"`
              );
            }
          }
          existing.name = seedItem.name;
          existing.slug = seedItem.slug;
          existing.stacks = seedItem.stacks;
          await existing.save();
          updatedCount++;
        } else {
          unchangedCount++;
        }
      }
    }

    console.log("Seeding summary:");
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Unchanged: ${unchangedCount}`);
    console.log("Failed: 0");
  } catch (error) {
    console.error("Seeding failed:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error occurred during seeding");
    }
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
