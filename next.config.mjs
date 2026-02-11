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
      // ასევე შეგიძლია დაამატო Meta-ს დომენიც, თუ "ლაივ" ლინკებსაც იყენებ ხანდახან
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
    ],
  },
};

export default nextConfig;
