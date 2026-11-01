"use client";

import { Analytics } from "@vercel/analytics/next";

// Never send search prompts, OAuth codes, or arbitrary URLs to analytics.
export default function SiteAnalytics() {
  return <Analytics beforeSend={(event) => {
    const url = new URL(event.url);
    if (!["/", "/search", "/sign-in"].includes(url.pathname)) return null;
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  }} />;
}
