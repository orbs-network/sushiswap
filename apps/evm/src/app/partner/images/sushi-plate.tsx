'use client'

import { cloudinaryImageLoader } from '@sushiswap/ui/cloudinary'
import Image from 'next/image'

export const SushiPlate = ({ className }: { className?: string }) => {
  return (
    <Image
      loader={cloudinaryImageLoader}
      alt="sushi_plate"
      src="/sushi_plate.png"
      width={0}
      height={0}
      sizes="100vw"
      className={className}
      quality={75}
    />
  )
}
