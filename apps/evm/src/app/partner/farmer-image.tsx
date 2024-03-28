'use client'

import { cloudinaryImageLoader } from '@sushiswap/ui/cloudinary'
import Image from 'next/image'

export const FarmerImage = ({ className }: { className: string }) => {
  return (
    <Image
      loader={cloudinaryImageLoader}
      alt="farmer"
      src="/pepefarmercut.jpg"
      width={0}
      height={0}
      sizes="100vw"
      className={className}
      quality={75}
    />
  )
}
