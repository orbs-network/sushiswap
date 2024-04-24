export default function PoolByIdPage({ params }: { params: { poolId: string } }) {
	const { poolId } = params;
	const decodedPoolId = decodeURIComponent(poolId);
	return (
		<div>
			<h1>PoolByIdPage {decodedPoolId}</h1>
		</div>
	);
}
