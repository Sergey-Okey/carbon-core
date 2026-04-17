import { PrismaClient } from '@prisma/client'

// В Prisma 7 адаптер передаётся при создании клиента
const prisma = new PrismaClient()

export default prisma
