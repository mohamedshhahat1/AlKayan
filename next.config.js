/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `eslint.ignoreDuringBuilds: true` used to be set here, which let lint
  // errors through a "successful" build. If a rule is genuinely wrong, disable
  // that rule in .eslintrc.json instead of silencing the whole step.
  images: {
    // `unoptimized: true` was also set. Optimisation is on now; these hosts are
    // the remote sources currently used for project imagery.
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
