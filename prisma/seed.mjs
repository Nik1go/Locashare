import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
        console.log("⚠️ La base de données contient déjà des données !");
        return;
    }

    console.log('🌱 Démarrage du seeding...');

    const user1 = await prisma.user.create({
        data: {
            name: 'Alice Dubois',
            email: 'alice@example.com',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: 'Marc Lefevre',
            email: 'marc@example.com',
        },
    });

    console.log(`✅ Utilisateurs créés : ${user1.name}, ${user2.name}`);

    const toolsData = [
        {
            title: 'Perceuse sans fil Dewalt',
            description: 'Perceuse visseuse 18V avec 2 batteries.',
            pricePerDay: 15.0,
            category: 'Bricolage',
            location: 'Paris 11e',
            imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop',
            ownerId: user1.id,
        },
        {
            title: 'Tondeuse à gazon électrique',
            description: 'Tondeuse puissante.',
            pricePerDay: 25.0,
            category: 'Jardinage',
            location: 'Lyon',
            imageUrl: 'https://images.unsplash.com/photo-1592424006249-f00e120d5889?q=80&w=800&auto=format&fit=crop',
            ownerId: user2.id,
        }
    ];

    for (const t of toolsData) {
        const tool = await prisma.tool.create({
            data: t,
        });
        console.log(`✅ Outil créé : ${tool.title}`);
    }

    console.log('🎉 Seeding terminé avec succès.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
