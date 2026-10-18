import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "@/components/search/SearchResults";

export const metadata: Metadata = { title: "Search projects | Zot a Project" };

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default function SearchPage(props: SearchPageProps) {
  return <Suspense fallback={<p role="status" className="p-10 text-2xl">Loading search…</p>}><SearchPageContent {...props} /></Suspense>;
}

async function SearchPageContent({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  return <SearchResults query={(Array.isArray(q) ? q[0] : q) ?? ""} />;
}
