import { Button, Container, typographyVariants } from '@sushiswap/ui'
import React from 'react'
import { FarmerImage } from '../farmer-image'

export function PartnerWithSushi() {
  return (
    <div className="pt-32 pb-36 px-9">
      <Container maxWidth="5xl" className="text-center">
        <div className="space-y-28">
          <div className="flex flex-col space-y-16">
            <div className="flex flex-col space-y-8">
              <h1 className={typographyVariants({ variant: 'h1' })}>
                Partner with Sushi
              </h1>
              <p className="lg:text-2xl md:text-lg dark:text-gray-300">
                {`Unlock new possibilities by partnering with us! Sushi isn't just a decentralised exchange (DEX); we're your long-term DeFi partners. Our platform boosts your project's growth and visibility, offering a sustainable liquidity approach.`}
              </p>
            </div>
            <div>
              <Button className="!w-64 !h-12">{`Let's talk!`}</Button>
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
