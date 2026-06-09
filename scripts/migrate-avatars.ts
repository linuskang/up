import { prisma } from "@/server/prisma";

async function migrateAvatars() {
    const usersWithoutImage = await prisma.user.findMany({
        where: {
            OR: [
                { image: null },
                { image: "" },
            ],
        },
    });

    if (usersWithoutImage.length === 0) {
        console.log("No users without avatars found. Nothing to migrate.");
        return;
    }

    console.log(`Found ${usersWithoutImage.length} user(s) without an avatar. Migrating...`);

    const updates = usersWithoutImage.map((user) => {
        const seed = encodeURIComponent(user.name);
        const image = `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;

        return prisma.user.update({
            where: { id: user.id },
            data: { image },
        });
    });

    await prisma.$transaction(updates);

    console.log(`Successfully updated ${usersWithoutImage.length} user(s).`);
}

migrateAvatars()
    .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
