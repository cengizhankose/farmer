/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ["@shared/core", "@adapters/core"],
}

module.exports = nextConfig