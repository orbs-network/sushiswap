import { ChevronRightIcon } from '@heroicons/react-v1/solid'
import { Button, typographyVariants } from '@sushiswap/ui'
import React from 'react'
import { CollabHubImage } from '../collab-hub-image'

import { Arbitrum } from './partners/arbitrum'
import { Bnb } from './partners/bnb'
import { Ethereum } from './partners/ethereum'
import { Optimism } from './partners/optimism'
import { Polygon } from './partners/polygon'
import { ZkSync } from './partners/zksync'

type Partner = {
  icon: React.FC<{ className?: string }>
}

const partners: Partner[] = [
  { icon: Polygon },
  { icon: Optimism },
  { icon: Bnb },
  { icon: ZkSync },
  { icon: Ethereum },
  { icon: Arbitrum },
]

function Partners() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
      {partners.map(({ icon: Partner }, index) => (
        <div key={index} className="flex justify-center items-centerk">
          <Partner className="fill-black dark:fill-white" />
        </div>
      ))}
    </div>
  )
}

export function LetsConnect() {
  return (
    <div className="flex flex-row">
      <div className="lg:min-w-2/3 dark:bg-[linear-gradient(108deg,rgba(9,147,236,0.10)0%,rgba(243,56,195,0.10)100%),linear-gradient(0deg,rgb(33,41,57)0%,rgb(33,41,57)100%)]">
        <div className="mx-9 my-14 md:m-[120px] flex flex-col">
          <div className="space-y-[88px]">
            <div className="space-y-14">
              <div className="aspect-1 font-medium text-3xl inline-flex justify-center items-center rounded-lg p-[14px] bg-secondary dark:bg-white dark:bg-opacity-[0.14]">
                🤝
              </div>
              <div className="space-y-12">
                <div className="space-y-3">
                  <h1
                    className={typographyVariants({ variant: 'h1' })}
                  >{`Let's connect`}</h1>
                  <span className="text-lg">{`Whether you're about to launch a new product, seeking to enhance your existing project, or looking to forge new partnerships in the DeFi space, Sushi is here to support your journey. Join us today and unleash the full potential of your project with Sushi.`}</span>
                </div>
                <Button className="!w-52 !h-12">{`Let's talk!`}</Button>
              </div>
            </div>
            <div className="space-y-10">
              <Partners />
              <div className="flex flex-row space-x-1 items-center text-blue text-xl md:justify-start justify-center">
                <span>See our full partner list</span>
                <span>
                  <ChevronRightIcon height={24} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative w-full hidden lg:block">
        <CollabHubImage />
      </div>
    </div>
  )
}
