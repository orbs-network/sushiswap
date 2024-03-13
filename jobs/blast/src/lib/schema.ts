import { z } from 'zod'

export const ChallengeResponseSchema = z.object({
  success: z.boolean(),
  challengeData: z.string(),
  message: z.string(),
})

export const SolveResponseSchema = z.object({
  success: z.boolean(),
  bearerToken: z.string(),
})

export const BatchResponseSchema = z.object({
  success: z.boolean(),
  batchId: z.string(),
})

export const PointBalancesSchema = z.object({
  available: z.string(),
  pendingSent: z.string(),
  earnedCumulative: z.string(),
  receivedCumulative: z.string(),
  finalizedSentCumulative: z.string(),
})

export const BalanceResponseSchema = z.object({
  success: z.boolean(),
  balancesByPointType: z.object({
    LIQUIDITY: PointBalancesSchema,
    DEVELOPER: PointBalancesSchema,
  }),
})

export const BatchWithTransfersSchema = z.object({
  contractAddress: z.string(),
  id: z.string(),
  pointType: z.string(),
  createdAt: z.string(),
  finalizeAt: z.string(),
  updatedAt: z.nullable(z.string()),
  status: z.string(),
  points: z.string(),
  transferCount: z.number(),
})

export const BatchesResponseSchema = z.object({
  success: z.boolean(),
  batches: z.array(BatchWithTransfersSchema),
  cursor: z.nullable(z.string()),
})
