"use client";

import { useEffect } from "react";
import { ErrorStatePage } from "@/components/utility/utility-pages";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <ErrorStatePage kind="500" onRetry={reset} />;
}
