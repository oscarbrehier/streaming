import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
	/* config options here */

	basePath: isProd ? "/streaming" : "",

	cacheComponents: true,

	reactCompiler: true,
	experimental: {
		serverActions: {
			bodySizeLimit: '5gb'
		}
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
				port: "",
				pathname: "/t/p/**"
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com"
			}
		]
	}
};

export default nextConfig;
