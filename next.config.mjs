/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ["posthippocampal-lucently-sang.ngrok-free.dev"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mydynbjficpgzlkqnxfh.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // Your current Meta domains
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      // Added specific patterns for deep subdomains like scontent.ftbs4-2.fna
      {
        protocol: "https",
        hostname: "scontent.**.fna.fbcdn.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "scontent.**.cdninstagram.com",
        pathname: "**",
      },
      // Added generic catch-all for other Meta CDN variations
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
