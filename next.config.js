/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PUBLIC_ENV_API_URL: "https://pcdigascrapper.herokuapp.com",
  },
  images: {
    domains: [
      "static.pcdiga.com",
      "socialistmodernism.com",
      "img.globaldata.pt",
      "pcdiga-prod.eu.saleor.cloud",
      "imgix.com",
    ],
  },
  transpilePackages: [
    "ag-grid-community",
    "ag-grid-react",
    "ag-charts-community",
    "ag-charts-react",
  ],
};

module.exports = nextConfig;
