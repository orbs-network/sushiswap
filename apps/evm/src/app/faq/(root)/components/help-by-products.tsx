import { CloudinaryImage, classNames } from '@sushiswap/ui'
import Link from 'next/link'
import {
  ProductListEntry,
  getFaqProductList,
} from '../../lib/strapi/productList'

function Block({ name, url, image }: ProductListEntry) {
  return (
    <Link
      href={url}
      className={classNames(
        'flex flex-col justify-center md:text-lg md:py-6 px-3 py-4 rounded-lg text-sm border items-center space-y-6',
        'bg-black bg-opacity-[0.02] border-black border-opacity-30',
        'dark:bg-white dark:bg-opacity-5 dark:border-slate-500 dark:border-opacity-20',
      )}
    >
      <CloudinaryImage
        alt={image.alternativeText}
        src={image.provider_metadata.public_id}
        width={image.width}
        height={image.height}
        sizes="100vw"
        className="h-14 w-min"
      />
      <div className="space-y-3 flex flex-col justify-center text-center">
        <div className="text-lg font-bold">{name}</div>
        <div className="text-sm dark:text-white text-opacity-70">{`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`}</div>
      </div>
    </Link>
  )
}

export async function HelpByProducts() {
  const products = await getFaqProductList()

  return (
    <div className="md:space-y-12">
      <div className="text-2xl font-medium">Help By Products</div>
      <div className="lg:grid-cols-4 md:grid-cols-3 grid gap-x-5 md:gap-y-8 gap-y-4">
        {products.map((product, i) => (
          <Block key={i} {...product} />
        ))}
      </div>
    </div>
  )
}
