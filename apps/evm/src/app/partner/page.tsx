import React from 'react'
import { FrequentlyAskedQuestions } from './sections/frequently-asked-questions'
import { GetStarted } from './sections/get-started'
import { LetsConnect } from './sections/lets-connect'
import { ListOnSushi } from './sections/list-on-sushi'
import { PartnerWithSushi } from './sections/partner-with-sushi'
import { WhySushiBonds } from './sections/why-sushi-bonds'

export default function Page() {
  return (
    <div className="flex flex-col w-full">
      <PartnerWithSushi />
      <ListOnSushi />
      <WhySushiBonds />
      <GetStarted />
      <FrequentlyAskedQuestions />
      <LetsConnect />
    </div>
  )
}
