import {
  MeshContext,
  Query,
  Queryv3PoolAtBlocksArgs,
  RequireFields,
  execute,
} from '.graphclient'

const getPoolAtBlocks = (
  args: RequireFields<Queryv3PoolAtBlocksArgs, 'id' | 'blocks'>,
  context: MeshContext,
) => {
  const query = `
      query V3PoolAtBlocks($id: ID!) {
        ${args.blocks
          .map(
            (block) => `
            pool${block.number}: V3_pool(id: $id, block: {number: ${block.number}}) {
                ...V3PoolFragment
            }
            `,
          )
          .join('\n')}
      }
      fragment V3PoolFragment on V3_Pool {
        id
        liquidity
        sqrtPrice
        tick
        totalValueLockedToken0
        totalValueLockedToken1
        token0 {
          id
          decimals
        }
        token1 {
          id
          decimals
        }
        token0Price
        token1Price
      }
    `

  return execute(query, args, context)
}

const getPositionsAtBlocks = (
  args: RequireFields<Queryv3PoolAtBlocksArgs, 'id' | 'blocks'>,
  context: MeshContext,
) => {
  const query = `
  query V3PoolAtBlocks($id: ID!) {
    ${args.blocks
      .map(
        (block) => `
        positions${block.number}: V3_positions(where: {pool: $id} block:{number: ${block.number}}) {
            ...V3PositionFragment
        }
        `,
      )
      .join('\n')}
  }
  fragment V3PositionFragment on V3_Position {
    id
    owner
    liquidity
    tickLower {
      tickIdx
    }
    tickUpper {
      tickIdx
    }
  }
  `

  return execute(query, args, context)
}

export const v3PoolAtBlocks = async (
  root = {},
  args: RequireFields<Queryv3PoolAtBlocksArgs, 'id' | 'blocks'>,
  context: MeshContext,
  info,
): Promise<Query['v3PoolAtBlocks']> => {
  const pools = Object.values(
    await getPoolAtBlocks(args, context)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error('Failed to query v3PoolAtBlocks', error)
      }),
  )

  const positions = Object.values(
    await getPositionsAtBlocks(args, context)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error('Failed to query v3PositionsAtBlocks', error)
      }),
  )

  return Object(pools).map((pool, i) => ({
    ...pool,
    positions: positions[i],
  }))
}
