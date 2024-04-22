import { Tab } from "@headlessui/react";
import { Container } from "@sushiswap/ui/components/Container";
import { Button } from "@sushiswap/ui/components/button";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import React, { Fragment, useState } from "react";

export const PoolsView = () => {
	const [tab, setTab] = useState<number>(0);
	const { address } = useWallet();

	return (
		<div className="flex flex-col h-full">
			<Tab.Group defaultIndex={0} selectedIndex={tab} onChange={setTab}>
				<Container maxWidth="7xl" className="px-4 mx-auto">
					<div className="flex items-center gap-2 mb-4">
						<Tab as={Fragment}>
							{({ selected }) => (
								<Button size="sm" variant={selected ? "secondary" : "ghost"} className="!rounded-full">
									All
								</Button>
							)}
						</Tab>
						{address && (
							<>
								<Tab as={Fragment}>
									{({ selected }) => (
										<Button size="sm" variant={selected ? "secondary" : "ghost"} className="!rounded-full">
											My Positions
										</Button>
									)}
								</Tab>
							</>
						)}
					</div>
				</Container>
				<Tab.Panels className="bg-gray-50 dark:bg-white/[0.02] py-4 h-full">
					<Container maxWidth="7xl" className="px-4 mx-auto">
						{/* <PoolFilters
              showCategories={tab === 0}
              farmHandler={farmHandler}
              farmsOnly={farmsOnly}
              query={query}
              setQuery={setQuery}
            /> */}
						<div>pool filters</div>
					</Container>
					<Tab.Panel>
						<Container maxWidth="7xl" className="px-4 mx-auto">
							<div>pools table</div>
							{/* <PoolsTable farmsOnly={farmsOnly} query={query} /> */}
							{/* Pools Table */}
						</Container>
					</Tab.Panel>
					<Tab.Panel>
						<Container maxWidth="7xl" className="px-4 mx-auto">
							<div>positions table</div>
							{/* <PositionsTable query={query} /> */}
						</Container>
					</Tab.Panel>
					<Tab.Panel />
				</Tab.Panels>
			</Tab.Group>
		</div>
	);
};
