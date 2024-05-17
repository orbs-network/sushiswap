export const getAllPools = (contractAddress: string) => {
	const query = JSON.stringify({
		query:
			'query ($contractAddress: String!) {\n  tron {\n    smartContractEvents(\n      smartContractAddress: {is: $contractAddress}\n      smartContractEvent: {is: "PairCreated"}\n    ) {\n      arguments {\n        argument\n        value\n      }\n    }\n  }\n}\n',
		variables: `{\n  \"contractAddress\": \"${contractAddress}\"\n}`,
	});

	return query;
};
