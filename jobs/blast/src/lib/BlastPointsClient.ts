import { privateKeyToAccount } from 'viem/accounts'
import { z } from 'zod'
import { BASE_URL, TEST_BASE_URL } from './constants'
import {
  BalanceResponseSchema,
  BatchResponseSchema,
  BatchWithTransfersSchema,
  BatchesResponseSchema,
  ChallengeResponseSchema,
  SolveResponseSchema,
} from './schema'
import { BatchRequest } from './types'

export class BlastPointsClient {
  private contractAddress: string
  private baseURL: string
  private bearerToken: string

  private constructor(
    contractAddress: string,
    baseURL: string,
    bearerToken: string,
  ) {
    this.contractAddress = contractAddress
    this.baseURL = baseURL
    this.bearerToken = bearerToken
  }

  static async initialize(
    contractAddress: string,
    operatorPrivateKey: `0x${string}`,
    isTest = false,
  ) {
    const operator = await privateKeyToAccount(operatorPrivateKey)
    const baseURL = isTest ? TEST_BASE_URL : BASE_URL

    const challengeResponse = await (
      await fetch(`${baseURL}/v1/dapp-auth/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: contractAddress,
          operatorAddress: operator.address,
        }),
      })
    ).json()

    const parsedChallengeResponse =
      ChallengeResponseSchema.parse(challengeResponse)

    if (!parsedChallengeResponse.success) {
      throw new Error('Challenge request failed')
    }

    const signature = await operator.signMessage({
      message: challengeResponse.message,
    })

    const solveResponse = await (
      await fetch(`${baseURL}/v1/dapp-auth/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
          challengeData: parsedChallengeResponse.challengeData,
        }),
      })
    ).json()

    const parsedSolveResponse = SolveResponseSchema.parse(solveResponse)

    if (!parsedChallengeResponse.success) {
      throw new Error('Solve challenge failed')
    }

    return new BlastPointsClient(
      contractAddress,
      baseURL,
      parsedSolveResponse.bearerToken,
    )
  }

  async sendBatch(batchRequest: BatchRequest, batchId: string) {
    const response = await (
      await fetch(
        `${this.baseURL}/v1/contracts/${this.contractAddress}/batches/${batchId}`,
        {
          method: 'PUT',
          body: JSON.stringify(batchRequest),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.bearerToken}`,
          },
        },
      )
    ).json()

    return BatchResponseSchema.parse(response)
  }

  async getBalances() {
    const response = await (
      await fetch(
        `${this.baseURL}/v1/contracts/${this.contractAddress}/point-balances`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
          },
        },
      )
    ).json()

    return BalanceResponseSchema.parse(response)
  }

  async getBatches() {
    const batches: z.infer<typeof BatchWithTransfersSchema>[] = []

    let page = this.getBatchesPage()
    batches.push(...(await page).batches)

    while ((await page).cursor !== null) {
      page = this.getBatchesPage((await page).cursor)
      batches.push(...(await page).batches)
    }
    return batches
  }

  private async getBatchesPage(cursor: string | null = null) {
    const response = await (
      await fetch(
        `${this.baseURL}/v1/contracts/${this.contractAddress}/batches${
          cursor ? `?cursor=${cursor}` : ''
        }`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
          },
        },
      )
    ).json()

    return BatchesResponseSchema.parse(response)
  }
}
