import { PrismaClient } from '../generated'
import { withAccelerate } from '@prisma/extension-accelerate'
import { defaultPrismaClientOptions } from './common.js'

export { type DecimalToString } from './common.js'
export * from '../generated'

export async function createClient(options = defaultPrismaClientOptions) {
  await import('dotenv/config')
  if (!process.env['DATABASE2_URL']) throw new Error('DATABASE2_URL is required')

  return new PrismaClient(options).$extends(withAccelerate())
}
