import {
  Block_height,
  MeshContext,
  Query,
  QuerysteerVaultsAtBlocksArgs,
  SteerVaultsAtBlock,
  Steer_Vault,
  execute,
} from '.graphclient'

const getQuery = (blocks: Block_height[]) => {
  return `
      query SteerVaultsAtBlocks($first: Int = 1000, $skip: Int = 0, $where: Steer_Vault_filter) {
        ${blocks
          .map(
            (
              block,
            ) => `block${block.number}: Steer_vaults(where: $where, block: {number: ${block.number}}) {
          ...SteerVaultsFragment
        }`,
          )
          .join('\n')}
      }
  
      fragment SteerVaultsFragment on Steer_Vault {
        id
        pool
        totalLPTokensIssued
        depositors {
          account
          shares
        }
        positions {
          lowerTick
          upperTick
        }
      }
    `
}

export const steerVaultsAtBlocks = async (
  root = {},
  args: QuerysteerVaultsAtBlocksArgs,
  context: MeshContext,
  info,
): Promise<Query['steerVaultsAtBlocks']> => {
  const query = getQuery(args.blocks)
  const response = await execute(query, args, context)
  return (
    (Object.values(response.data).map((vaults) => ({
      vaults,
    })) as SteerVaultsAtBlock[]) ?? []
  )
}
