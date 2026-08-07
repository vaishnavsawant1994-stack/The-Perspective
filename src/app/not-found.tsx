import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
export default function NotFound() { return <PageContainer className="flex min-h-[60vh] flex-col justify-center py-20"><p className="eyebrow mb-4 text-accent">404</p><h1 className="editorial-heading">This page is outside the edition.</h1><p className="mt-5 max-w-lg text-muted">The address may have changed, or the story may have moved to the archive.</p><Link className="mt-8 w-fit border-b border-foreground pb-1 text-sm font-semibold" href="/">Return home</Link></PageContainer>; }
