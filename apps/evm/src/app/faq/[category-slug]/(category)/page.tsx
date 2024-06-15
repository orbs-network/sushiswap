import Link from 'next/link'
import { Category, getFaqCategory } from '../../lib/strapi/category'

export const revalidate = 900

function AnswerGroup({
  category,
  answerGroup,
}: { category: Category; answerGroup: Category['answerGroups'][number] }) {
  return (
    <div className="space-y-4">
      <div className="text-xl font-medium">{answerGroup.name}</div>
      <div className="grid-cols-2 grid gap-y-1 gap-x-4">
        {answerGroup.answers.map((answer) => (
          <Link
            key={answer.slug}
            href={`/faq/${category.slug}/${answerGroup.slug}/${answer.slug}`}
          >
            <div className="text-lg font-medium dark:text-[#AAAAAA] dark:hover:text-gray-300">
              {answer.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function FaqCategoryPage({
  params,
}: {
  params: { 'category-slug': string }
}) {
  const category = await getFaqCategory(params['category-slug'])

  return (
    <div className="w-full space-y-6">
      <div className="text-2xl font-bold space-y-4">{category.name}</div>
      <div className="space-y-6">
        {category.answerGroups.map((answerGroup) => (
          <AnswerGroup
            key={answerGroup.slug}
            category={category}
            answerGroup={answerGroup}
          />
        ))}
      </div>
    </div>
  )
}
