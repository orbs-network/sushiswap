import { ChevronRightIcon } from '@heroicons/react-v1/solid'
import { Container, classNames, typographyVariants } from '@sushiswap/ui'
import Link from 'next/link'
import React from 'react'

type Block = {
  index: number
  title: string
  body: React.ReactNode
}

const blocks: Block[] = [
  {
    index: 1,
    title: 'Get on the token list',
    body: (
      <div className="space-y-3">
        <div>{`Enhance your project's visibility by getting on our default token list. `}</div>
        <Link
          href="/tokenlist-request"
          target="_blank"
          className="space-x-1 border-2 px-3 py-[6px] text-sm font-bold text-blue flex items-center border-blue w-fit rounded-md"
        >
          <span>{`Submit a Request Now`}</span>
          <span>
            <ChevronRightIcon height={16} />
          </span>
        </Link>
      </div>
    ),
  },
  {
    index: 2,
    title: 'Establish Your Pool',
    body: (
      <div>{`We offer comprehensive support for setting up basic to advanced pools including v2, v3 and Smart Pools.`}</div>
    ),
  },
  {
    index: 3,
    title: 'Smart Pools Creation (Optional)',
    body: (
      <div>{`Utilise our expertise to establish Smart Pools on v3 to reduce active pool management while boosting returns.`}</div>
    ),
  },
  {
    index: 4,
    title: 'Bond Market Setup (Optional)',
    body: (
      <div>{`Our bond market solutions helps converting your liquidity to long term, sustainable liquidity.`}</div>
    ),
  },
  {
    index: 5,
    title: 'Co-Marketing Opportunities',
    body: (
      <div>{`Amplify your project's profile through our joint marketing initiatives.`}</div>
    ),
  },
]

function Block({ index, title, body }: Block) {
  return (
    <div className="flex-row flex space-x-11 max-w-[600px]">
      <div className="dark:bg-[#151F38] bg-secondary p-[10px] whitespace-nowrap flex items-end min-h-full pr-4">
        Step {index}
      </div>
      <div className="flex flex-col space-y-3">
        <div className="text-2xl font-bold">{title}</div>
        <div>{body}</div>
      </div>
    </div>
  )
}

export function GetStarted() {
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
            <span>{`Let's`}</span>
            <span>{`get started`}</span>
          </h1>
          <div className="space-y-16">
            {blocks.map((block, index) => (
              <Block key={index} {...block} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
