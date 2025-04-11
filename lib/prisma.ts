import { PrismaClient } from '@prisma/client'
import path from 'path'

// This prevents multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined
}

// Configure default database URL if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), 'prisma/dev.db')}`
  console.log(`Database URL set to: ${process.env.DATABASE_URL}`)
}

// Create Prisma Client instance
export const prisma = global.prisma || 
  new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  })

// Save the instance for hot reloading in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Test database connection
export async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}
