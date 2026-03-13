import 'dotenv/config'
import { PrismaClient } from './lib/generated/prisma/client/index.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
    const users = await prisma.user.findMany();
    console.log("Found users:", users.length);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
