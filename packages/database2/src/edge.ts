import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '../generated/edge'
import { defaultPrismaClientOptions } from './common'

export { type DecimalToString } from './common'
export * from '@prisma/client'

export async function createClient(options = defaultPrismaClientOptions) {
  await import('dotenv/config')
  if (!process.env['DATABASE2_URL']) throw new Error('DATABASE2_URL is required')

  return new PrismaClient(options).$extends(withAccelerate())
}
