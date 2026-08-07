import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { Input } from "./input";
export function SearchInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) { return <label className="relative block"><span className="sr-only">Search</span><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input type="search" className="pl-10" {...props} /></label>; }
