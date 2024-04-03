'use client'

import { cloudinaryImageLoader } from '@sushiswap/ui/cloudinary'
import Image from 'next/image'

export const CollabHubImage = ({ className }: { className?: string }) => {
  return (
    <Image
      loader={cloudinaryImageLoader}
      alt="farmer"
      src="/sushicolab.png"
      className={className}
      quality={75}
      fill={true}
      style={{ objectFit: 'cover' }}
    />
  )
}
