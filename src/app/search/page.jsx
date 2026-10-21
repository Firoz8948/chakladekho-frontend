import { Suspense } from "react";

import SearchPageClient from "./SearchPageClient";
import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Search",
  path: "/search",
  noIndex: true,
});

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageClient />
    </Suspense>
  );
}
