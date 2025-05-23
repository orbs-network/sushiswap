import { isPoolChainId } from '@sushiswap/graph-client/data-api'
import {
  LinkInternal,
  type NavigationElement,
  NavigationElementType,
  NavigationListItem,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
  OnramperButton,
} from '@sushiswap/ui'
import {
  EXPLORE_NAVIGATION_LINKS,
  // MORE_NAVIGATION_LINKS,
} from 'src/app/_common/header-elements'
import { ChainId, ChainKey, type EvmChainId } from 'sushi/chain'
import { isAggregatorOnlyChainId } from 'sushi/config'

interface HeaderElements {
  chainId?: ChainId
  includeOnramper?: boolean
}

export const headerElements = ({
  chainId,
  includeOnramper = true,
}: HeaderElements): NavigationElement[] => [
  {
    title: 'Explore',
    items: EXPLORE_NAVIGATION_LINKS(chainId),
    show: 'mobile',
    type: NavigationElementType.Dropdown,
  },
  {
    show: 'desktop',
    type: NavigationElementType.Custom,
    item: (
      <NavigationMenuItem className={NavigationElementType.Custom}>
        <NavigationMenuTrigger>
          <LinkInternal href={`/${ChainKey[chainId ?? ChainId.ETHEREUM]}/swap`}>
            Trade
          </LinkInternal>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-[400px] gap-3 p-4">
            <NavigationListItem
              title={'Swap'}
              href={`/${ChainKey[chainId ?? ChainId.ETHEREUM]}/swap`}
            >
              The easiest way to trade.
            </NavigationListItem>
            {includeOnramper ? (
              <OnramperButton>
                <NavigationListItem title={'Buy Crypto'}>
                  Onramp with fiat.
                </NavigationListItem>
              </OnramperButton>
            ) : null}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    ),
  },
  ...(!chainId || isPoolChainId(chainId)
    ? ([
        {
          title: 'Explore',
          href: `/${chainId ? ChainKey[chainId] : 'ethereum'}/explore/pools`,
          show: 'desktop',
          type: NavigationElementType.Single,
        },
      ] as const)
    : []),
  {
    show: 'desktop',
    type: NavigationElementType.Custom,
    item: (
      <NavigationMenuItem className={NavigationElementType.Custom}>
        <NavigationMenuTrigger>
          <LinkInternal
            href={`/${ChainKey[chainId && isPoolChainId(chainId) ? chainId : ChainId.ETHEREUM]}/pool`}
          >
            Positions
          </LinkInternal>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-[400px] gap-3 p-4">
            <NavigationListItem
              title={'Manage'}
              href={`/${ChainKey[chainId && isPoolChainId(chainId) ? chainId : ChainId.ETHEREUM]}/pool`}
            >
              Manage liquidity pool positions.
            </NavigationListItem>
            <NavigationListItem title={'Claim'} href={`/claim`}>
              Claim your fees and rewards.
            </NavigationListItem>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    ),
  },
  {
    title: 'Stake',
    href: '/stake',
    show: 'desktop',
    type: NavigationElementType.Single,
  },
  // {
  //   title: 'More',
  //   items: MORE_NAVIGATION_LINKS,
  //   show: 'desktop',
  //   type: NavigationElementType.Dropdown,
  // },
]
