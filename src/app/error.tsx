"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error(error); }, [error]); return <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-5 py-20"><p className="eyebrow mb-4 text-accent">Something went wrong</p><h1 className="editorial-heading">We could not load this edition.</h1><p className="mt-5 text-muted">Please try again. If the problem continues, return to the home page.</p><Button className="mt-8 w-fit" onClick={reset}>Try again</Button></div>; }
