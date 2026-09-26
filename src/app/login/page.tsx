import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { filterSearchResults, getSearchCounts, searchSite } from "@/lib/search";
import { sanitizeProtectedReturnPath } from "@/modules/foundation/routing/access-policy";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Perspective member account.",
  alternates: { canonical: "/login" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const returnPath = next
    ? sanitizeProtectedReturnPath(next, "TEAM")
    : undefined;
  const q = "membership";
  const a = searchSite(q);
  const t = "all" as const;

  return (
    <>
      <AuthPage mode="login" returnPath={returnPath} />
      <div id="current-login-experience">
        <SearchResultsPage
          allResults={a}
          counts={getSearchCounts(a)}
          filteredResults={filterSearchResults(a, t)}
          query={q}
          rawQuery={q}
          sort="relevance"
          type={t}
        />
      </div>
    </>
  );
}
