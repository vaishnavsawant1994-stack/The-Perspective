import type { Author } from "@/types";
const author = (id: string, name: string, role: string, biography: string): Author => ({ id, name, slug: id.replace("author-", ""), role, biography });
export const authors: Author[] = [
  author("author-ava-morgan", "Ava Morgan", "Editor at Large", "Ava writes about leadership, institutions, and global influence."),
  author("author-amara-sen", "Amara Sen", "Senior Correspondent", "Amara reports on cities, public life, and how policy becomes lived experience."),
  author("author-julian-cross", "Julian Cross", "Business Editor", "Julian covers global companies, markets, and long-term capital."),
  author("author-noor-rahman", "Noor Rahman", "Technology Editor", "Noor examines the infrastructures and people shaping emerging technology."),
  author("author-lena-park", "Lena Park", "Culture Correspondent", "Lena reports on design, books, travel, and contemporary culture."),
  author("author-david-owusu", "David Owusu", "Markets Correspondent", "David writes about public markets and global investment flows."),
];
export const getAuthorById = (id: string) => authors.find((item) => item.id === id) ?? authors[0];
