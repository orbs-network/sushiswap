import { ExternalLinkIcon } from '@heroicons/react-v1/solid'
import {
  Button,
  Container,
  LinkExternal,
  classNames,
  typographyVariants,
} from '@sushiswap/ui'
import Link from 'next/link'
import React from 'react'
import { SushiPlate } from '../images/sushi-plate'

type Block = {
  icon: React.FC<{ className?: string }>
  title: string
  description: string
}

const blocks: Block[] = [
  {
    icon: SushiPlate,
    title: 'Control Inflation',
    description: `Regulate the supply of tokens by leveraging bonds to finish liquidity incentives, decreasing inflationary pressures and preserving token value over time`,
  },
  {
    icon: SushiPlate,
    title: 'Diversified Treasury',
    description: `Strategically diversify your treasury, transition from single assets (your token) to owning a portfolio of yield-bearing assets`,
  },
  {
    icon: SushiPlate,
    title: 'Aligned Incentives',
    description: `It does not make sense for users to be forced to provide their own liquidity just to hodl your token. Additionally, liquidity is not at the whim of mercenary miners`,
  },
  {
    icon: SushiPlate,
    title: 'Near Zero Risk',
    description: `If users do not purchase the bonds, unemitted tokens are returned, thus little risk is assumed when setting up a program to test market demand`,
  },
]

function Block({ icon: Icon, title, description }: Block) {
  return (
    <div className="p-9 dark:bg-[linear-gradient(180deg,rgba(24,27,35,0)0%,rgb(24,27,35)100%),linear-gradient(90deg,rgba(59,130,246,0.20)0%,rgba(236,72,153,0.20)100%),linear-gradient(0deg,rgb(15,23,42)0%,rgb(15,23,42)100%)] rounded-[20px]">
      <div className="w-full flex justify-center p-12">
        <Icon className="w-full h-auto" />
      </div>
      <div className="space-y-5">
        <h3 className={typographyVariants({ variant: 'h3' })}>{title}</h3>
        <div>{description}</div>
      </div>
    </div>
  )
}

export function WhySushiBonds() {
  return (
    <div className="px-9 py-14 md:p-[120px]">
      <Container maxWidth="6xl">
        <div className="flex lg:flex-row flex-col md:justify-between gap-10">
          <h1
            className={classNames(
              typographyVariants({ variant: 'h1' }),
              'flex flex-col whitespace-nowrap',
            )}
          >
            <span>{`Why`}</span>
            <span>{`Sushi Bonds`}</span>
          </h1>
          <div className="space-y-20">
            <div className="space-y-9">
              <div className="text-[#7F7F7F] text-lg font-semibold">
                The problem
              </div>
              <ul className="list-disc list-inside">
                <li>{`Relies on unsustainable token distributions to LPs, leading to hyperinflation`}</li>
                <li>{`Attracts mercenary miners that aggressively farm and dump tokens, leading to price drops`}</li>
                <li>{`Eventually protocols run out of tokens to rent liquidity with, ending with no liquidity and no more emissions`}</li>
              </ul>
            </div>
            <div className="space-y-9">
              <div className="text-[#7F7F7F] text-lg font-semibold">
                The solution
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {blocks.map((block) => (
                  <Block key={block.title} {...block} />
                ))}
              </div>
            </div>
            <div className="space-x-2 font-bold">
              <Link href="/bonds" target="_blank">
                <Button className="py-4 px-6">Browse Markets</Button>
              </Link>
              <LinkExternal
                href="https://www.sushi.com/blog/journey-of-defi-bonds"
                target="_blank"
              >
                <Button className="py-4 px-6 text-primary" variant="secondary">
                  <span>Learn More</span>
                  <span>
                    <ExternalLinkIcon width={16} height={16} />
                  </span>
                </Button>
              </LinkExternal>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
