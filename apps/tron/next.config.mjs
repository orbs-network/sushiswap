import defaultNextConfig from "@sushiswap/nextjs-config";

/** @type {import('next').NextConfig} */
const nextConfig = {
	...defaultNextConfig,
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	transpilePackages: ["@sushiswap/ui"],
	async redirects() {
		return [
			{
				source: "/",
				permanent: true,
				destination: "/swap",
			},
		];
	},
	async rewrites() {
		return [];
	},
};

export default nextConfig;
