import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/apply"],
        disallow: ["/portal", "/auth", "/not-a-member", "/login"],
      },
    ],
    sitemap: "https://ainativeclub.com/sitemap.xml",
  };
}
