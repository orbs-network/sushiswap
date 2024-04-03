import {
  Button,
  Container,
  LinkExternal,
  SushiIcon,
  typographyVariants,
} from '@sushiswap/ui'
import React from 'react'
import { FarmerImage } from '../images/farmer-image'

export function PartnerWithSushi() {
  return (
    <div className="pt-32 pb-36 px-9">
      <Container maxWidth="5xl" className="text-center">
        <div className="space-y-28">
          <div className="flex flex-col space-y-16">
            <div className="flex flex-col space-y-8">
              <div className="flex flex-col space-y-6 items-center">
                <div className="aspect-1 font-medium text-3xl inline-flex justify-center items-center rounded-lg p-[14px] bg-secondary dark:bg-[rgba(33,41,57,1)] w-fit">
                  <SushiIcon className="w-12 h-12" />
                </div>

                <h1 className={typographyVariants({ variant: 'h1' })}>
                  Partner with Sushi
                </h1>
              </div>
              <p className="lg:text-2xl md:text-lg dark:text-gray-300">
                {`Unlock new possibilities by partnering with us! Sushi isn't just a decentralised exchange (DEX); we're your long-term DeFi partners. Our platform boosts your project's growth and visibility, offering a sustainable liquidity approach.`}
              </p>
            </div>
            <div>
              <LinkExternal
                href="https://rbieu62gj0f.typeform.com/to/c4dIghED"
                target="_blank"
              >
                <Button className="!w-64 !h-12">{`Let's Talk!`}</Button>
              </LinkExternal>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <FarmerImage className="w-[75%] h-auto rounded-xl" />
          </div>
        </div>
      </Container>
    </div>
  )
}
