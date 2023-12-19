import { AuctionType } from '@sushiswap/bonds-sdk'
import { Bond } from '@sushiswap/client'
import {
  Badge,
  Currency,
  NetworkIcon,
  SkeletonText,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  classNames,
} from '@sushiswap/ui'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import formatDistance from 'date-fns/formatDistance'
import { formatPercent, formatUSD } from 'sushi'
import { Token } from 'sushi/currency'

const AUCTION_TYPE_BADGE: Record<AuctionType, JSX.Element> = {
  [AuctionType.Dynamic]: (
    <div className="whitespace-nowrap text-cyan-700 bg-cyan-100 text-[10px] font-medium px-2 rounded-full">
      Static
    </div>
  ),
  [AuctionType.Static]: (
    <div className="whitespace-nowrap bg-purple-100 text-purple-800 font-medium text-[10px] px-2 rounded-full">
      Static
    </div>
  ),
}

export const PAYOUT_ASSET_COLUMN: ColumnDef<Bond, unknown> = {
  id: 'payout-asset',
  header: 'Payout Asset',
  cell: (props) => {
    const token = new Token(props.row.original.payoutToken)

    return (
      <div className="flex items-center gap-5">
        <div className="flex">
          <Badge
            className="border-2 border-slate-900 rounded-full z-[11]"
            position="bottom-right"
            badgeContent={
              <NetworkIcon
                chainId={props.row.original.chainId}
                width={14}
                height={14}
              />
            }
          >
            <Currency.IconList iconWidth={26} iconHeight={26}>
              <Currency.Icon disableLink currency={token} />
            </Currency.IconList>
          </Badge>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
            {token.symbol}
            <div
              className={classNames(
                'text-[10px] bg-gray-200 dark:bg-slate-700 rounded-lg px-1 ml-1',
              )}
            />
          </span>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {AUCTION_TYPE_BADGE[props.row.original.marketType]}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Market Type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    )
  },
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const PRICE_COLUMN: ColumnDef<Bond, unknown> = {
  id: 'price',
  header: 'Price',
  cell: ({ row: { original } }) => (
    <div className="flex flex-col space-y-1">
      <div className="text-sm font-medium">
        {formatUSD(original.payoutToken.discountedPriceUSD)}
      </div>
      <div className="text-xs text-gray-500">
        {formatUSD(original.payoutToken.priceUSD)} Market
      </div>
    </div>
  ),
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const DISCOUNT_COLUMN: ColumnDef<Bond, unknown> = {
  id: 'discount',
  header: 'Discount',
  cell: (props) => {
    const discount = props.row.original.discount

    if (discount <= 0)
      return <span className="text-red">{formatPercent(discount)}</span>

    return <span className="text-green">{formatPercent(discount)}</span>
  },
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const BOND_ASSET_COLUMN: ColumnDef<Bond, unknown> = {
  id: 'bond-asset',
  header: 'Bond Asset',
  cell: (props) => {
    const token = new Token(props.row.original.quoteToken)

    return (
      <div className="flex items-center gap-3">
        <Currency.IconList iconWidth={26} iconHeight={26}>
          <Currency.Icon disableLink currency={token} />
        </Currency.IconList>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
            {token.symbol}
            <div
              className={classNames(
                'text-[10px] bg-gray-200 dark:bg-slate-700 rounded-lg px-1 ml-1',
              )}
            />
          </span>
        </div>
      </div>
    )
  },
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const CLIFF_COLUMN: ColumnDef<Bond, unknown> = {
  id: 'cliff',
  header: 'Cliff',
  cell: (props) => {
    if (!props.row.original.vesting) return <>-</>

    switch (props.row.original.vestingType) {
      case 'Fixed-Term':
        return formatDistance(props.row.original.vesting * 1000, 0)
    }
  },
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}

export const ISSUER_COLUMN: ColumnDef<Bond, unknown> = {
  id: 'issuer',
  header: 'Issuer',
  cell: (props) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useQuery({
      queryKey: ['bond-issuers'],
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000))
        return 'Issuer'
      },
    })

    if (isLoading) {
      return <SkeletonText fontSize="lg" />
    }

    return data
  },
  meta: {
    skeleton: <SkeletonText fontSize="lg" />,
  },
}
