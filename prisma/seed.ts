// prisma/seed.ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Vérifie si la base n'est pas déjà populée
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log("⚠️ La base de données contient déjà des données !");
    return;
  }

  console.log(' Démarrage du seeding...')

  // 1. Création de 2 utilisateurs factices
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Dubois',
      email: 'alice@example.com',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Marc Lefevre',
      email: 'marc@example.com',
    },
  })

  console.log(`✅ Utilisateurs créés : ${user1.name}, ${user2.name}`)

  // 2. Création de 5 outils avec de vraies images Unsplash pour le placeholder
  const toolsData = [
    {
      title: 'Perceuse sans fil Dewalt',
      description: 'Perceuse visseuse 18V avec 2 batteries. Idéale pour tous types de petits travaux.',
      pricePerDay: 15.0,
      category: 'Bricolage',
      location: 'Paris 11e',
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop',
      ownerId: user1.id,
    },
    {
      title: 'Tondeuse à gazon électrique',
      description: 'Tondeuse puissante et silencieuse pour jardins de taille moyenne (jusqu\'à 500m2).',
      pricePerDay: 25.0,
      category: 'Jardinage',
      location: 'Lyon',
      imageUrl: 'https://images.unsplash.com/photo-1592424006249-f00e120d5889?q=80&w=800&auto=format&fit=crop',
      ownerId: user2.id,
    },
    {
      title: 'Scie circulaire',
      description: 'Scie circulaire filaire 1200W, précise, lame bois incluse.',
      pricePerDay: 20.0,
      category: 'Bricolage',
      location: 'Paris 15e',
      imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800&auto=format&fit=crop',
      ownerId: user1.id,
    },
    {
      title: 'Nettoyeur haute pression (Kärcher)',
      description: 'Nettoyeur 130 bars, parfait pour terrasses, murs et véhicules.',
      pricePerDay: 30.0,
      category: 'Nettoyage',
      location: 'Marseille',
      imageUrl: 'https://images.unsplash.com/photo-1621217036495-97fcbb9dfcb5?q=80&w=800&auto=format&fit=crop',
      ownerId: user2.id,
    },
    {
      title: 'Échelle télescopique 3m',
      description: 'Échelle en aluminium, très légère et super compacte à transporter.',
      pricePerDay: 10.0,
      category: 'Bricolage',
      location: 'Bordeaux',
      imageUrl: 'https://images.unsplash.com/photo-1518557973614-72bef208df0c?q=80&w=800&auto=format&fit=crop',
      ownerId: user1.id,
    }
  ]

  for (const t of toolsData) {
    const tool = await prisma.tool.create({
      data: t,
    })
    console.log(`✅ Outil créé : ${tool.title}`)
  }

  console.log('🎉 Seeding terminé avec succès.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
