/**
 * Response headers applied to every route.
 *
 * Set here rather than in vercel.json so that Vercel, Railway and Netlify all
 * get the same behaviour — a platform-specific config file would silently
 * protect one deployment and not the others.
 *
 * Note there is no Content-Security-Policy. framer-motion writes inline
 * styles, next/font injects a style tag and the JSON-LD is an inline script,
 * so a useful CSP needs nonces and a middleware to issue them. That is worth
 * doing, but it is a change that can break rendering in ways only visible in
 * production, so it is tracked in the README rather than guessed at here.
 */
const securityHeaders = [
  // Stop the browser second-guessing declared content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy clickjacking defence; superseded by frame-ancestors in a CSP.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Send the full URL same-origin, origin only cross-origin, nothing on downgrade.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site uses these, so refuse them outright.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Two years. Deliberately without includeSubDomains or preload: both are
  // effectively irreversible, and this repo cannot know what else is served
  // from the apex domain. Add them once that is confirmed.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Drops `X-Powered-By: Next.js`. Free, and there is no reason to advertise
  // the framework version to a scanner.
  poweredByHeader: false,
  // `eslint.ignoreDuringBuilds: true` used to be set here, which let lint
  // errors through a "successful" build. If a rule is genuinely wrong, disable
  // that rule in .eslintrc.json instead of silencing the whole step.
  images: {
    // `unoptimized: true` was also set. Optimisation is on now; these hosts are
    // the remote sources currently used for project imagery.
    //
    // Note this only takes effect for next/image. The gallery, project and
    // partner images are still plain <img> tags, so nothing currently routes
    // through the optimiser — see the Performance section of the README.
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
