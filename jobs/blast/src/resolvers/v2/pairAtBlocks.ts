import {
  Block_height,
  MeshContext,
  Query,
  QuerypairAtBlocksArgs,
  RequireFields,
  execute,
} from '.graphclient'

const getQuery = (blocks: Block_height[]) => {
  return `
    query PairAtBlocks($id: ID!) {
      ${blocks
        .map(
          (
            block,
          ) => `block${block.number}: pair(id: $id, block: {number: ${block.number}}) {
        ...PairWithLiquidityPositionsFragment
      }`,
        )
        .join('\n')}
    }

    fragment PairWithLiquidityPositionsFragment on Pair {
      reserve0
      reserve1
      liquidity
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
      liquidityPositions {
        user {
          id
        }
        balance
      }
    }
  `
}

export const pairAtBlocks = async (
  root = {},
  args: RequireFields<QuerypairAtBlocksArgs, 'id' | 'blocks'>,
  context: MeshContext,
  info,
): Promise<Query['pairAtBlocks']> => {
  const query = getQuery(args.blocks)
  const response = await execute(query, args, context)
  return Object.values(response.data) ?? []
}
