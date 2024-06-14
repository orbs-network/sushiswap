import { classNames } from '@sushiswap/ui'
import Link from 'next/link'
import {
  CategoryListEntry,
  getFaqCategoryList,
} from '../../lib/strapi/categoryList'

function Block({ name, url }: CategoryListEntry) {
  return (
    <Link
      href={url}
      className={classNames(
        'md:text-lg md:py-3 md:px-5 px-4 py-2 rounded-lg text-sm whitespace-nowrap border',
        'bg-black bg-opacity-5 border-black border-opacity-30',
        'dark:bg-white dark:bg-opacity-5 dark:border-slate-500 dark:border-opacity-20',
      )}
    >
      {name}
    </Link>
  )
}

export async function HelpByCategories() {
  const categories = await getFaqCategoryList()

  return (
    <div className="md:space-y-12">
      <div className="text-2xl font-medium">Help By Categories</div>
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        {categories.map((topic) => (
          <Block key={topic.slug} {...topic} />
        ))}
      </div>
    </div>
  )
}
