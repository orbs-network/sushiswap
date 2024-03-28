import {
  CogsIcon,
  Container,
  IconComponent,
  QuickCircleIcon,
  ShuffleIcon,
  WaterDropsIcon,
  typographyVariants,
} from '@sushiswap/ui'

type Block = {
  icon: IconComponent
  title: string
  description: string
}

const blocks: Block[] = [
  {
    icon: QuickCircleIcon,
    title: 'End-to-End Support',
    description: `We offer complete assistance, from initial consultation and pool setup to advanced Smart Pools setup and marketing, ensuring your project's success every step of the way.`,
  },
  {
    icon: ShuffleIcon,
    title: 'Multi-Chain & Cross-Chain Leadership',
    description: `Sushi is deployed on 30+ blockchain networks, enabling users to seamlessly swap and provide liquidity from one to another. With SushiXSwap, users can swap assets across 7 major chains (with more to come), expanding the reach of your project.`,
  },
  {
    icon: WaterDropsIcon,
    title: 'Sustainable Liquidity Solution',
    description: `Our unique "Bonds to Protocol-Owned Liquidity (POL)" approach enables token projects to convert their Liquidity Mining Rewards (LMR) into sustainable liquidity. Coupled with Smart Pools to enhance capital efficiency to its fullest potential.`,
  },
  {
    icon: CogsIcon,
    title: 'V2 & V3 AMM Support',
    description: `As an original player in the DeFi space, we support v2 and v3 Automated Market Makers (AMMs), allowing great flexibility for your project. The upcoming v4 AMM is set to enhance user-friendliness with permissionless plugins and tools building on top of liquidity pools.`,
  },
]

function Block({ icon: Icon, title, description }: Block) {
  return (
    <div className="space-y-6 border p-9 border-[rgba(255,255,255,0.20)]">
      <div className="space-y-9">
        <Icon className="w-12 h-12" />
        <div className="text-[28px] font-bold">{title}</div>
      </div>
      <div className="text-base font-normal">{description}</div>
    </div>
  )
}

export function ListOnSushi() {
  return (
    <div className="px-9 py-14 md:p-[120px] dark:bg-[linear-gradient(108deg,rgba(9,147,236,0.10)0%,rgba(243,56,195,0.10)100%),linear-gradient(0deg,rgb(33,41,57)0%,rgb(33,41,57)100%)]">
      <Container maxWidth="6xl">
        <div className="space-y-20">
          <div className="space-y-6">
            <h1 className={typographyVariants({ variant: 'h1' })}>
              List Your Token on Sushi
            </h1>
            <div>Deploy your liquidity at ease with our end to end support</div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-14">
            {blocks.map((block) => (
              <Block key={block.title} {...block} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
