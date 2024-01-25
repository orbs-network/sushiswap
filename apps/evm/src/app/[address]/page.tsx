import { EVM_APP_BASE_URL } from '@sushiswap/client'

export default async function AccountPage({
  params,
}: { params: { address: string } }) {
  const positions = await fetch(
    `${EVM_APP_BASE_URL}/pool/api/v1/positions/v2?user=${params.address}`,
    {
      next: { revalidate: 60 },
    },
  ).then((data) => data.json())
  return (
    <>
      <h1>{params.address}</h1>
      {positions && <div>{JSON.stringify(positions)}</div>}
    </>
  )
}
