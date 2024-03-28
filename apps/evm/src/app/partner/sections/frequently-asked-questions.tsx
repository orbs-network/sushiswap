import { Container, classNames, typographyVariants } from '@sushiswap/ui'
import React from 'react'

export function FrequentlyAskedQuestions() {
  return (
    <div className="px-9 py-14 md:p-[120px] md:pb-[220px]">
      <Container maxWidth="6xl">
        <div className="space-y-16">
          <h1
            className={classNames(
              typographyVariants({ variant: 'h1' }),
              'flex flex-col whitespace-nowrap',
            )}
          >
            <span>Frequently</span>
            <span>Asked Questions</span>
          </h1>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="p-12 space-y-5 dark:bg-[rgba(21,31,56,1)]  bg-secondary">
              <div className="text-2xl font-bold">Is Sushi Permissionless?</div>
              <div className="text-lg dark:text-[#BFBFBF]">{`Yes, but we request a brief form submission for token whitelisting, to ensure the quality and safety of projects on our platform. The whitelisting also makes it easier for users to find tokens.`}</div>
            </div>
            <div className="p-12 space-y-5 dark:bg-[rgba(21,31,56,1)] bg-secondary">
              <div className="text-2xl font-bold">
                Do You Market with Any Project?
              </div>
              <div className="text-lg dark:text-[#BFBFBF]">{`We maintain specific criteria, including liquidity and track record requirements, to ensure a fruitful collaboration. If deemed necessary, we will make contact and perform a comprehensive evaluation to ensure project legitimacy and strategic alignment.`}</div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
