import type { ArticleCategory, MagazinePublicationCategory } from "@/types";
const category = (name: string): ArticleCategory => ({ id: `cat-${name.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")}`, name, slug: name.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-") });
export const categories = {
  leadership: category("Leadership"), business: category("Business"), technology: category("Technology"),
  markets: category("Markets"), finance: category("Finance"), culture: category("Culture"),
  lifestyle: category("Lifestyle"), design: category("Design"), travel: category("Travel"),
  books: category("Books"), strategy: category("Strategy"), opinion: category("Opinion"),
} as const;
export const articleCategories: ArticleCategory[] = Object.values(categories);
export const magazineCategories: MagazinePublicationCategory[] = [{ id: "mag-quarterly", name: "Quarterly", slug: "quarterly" }, { id: "mag-personal", name: "Personal Magazine", slug: "personal-magazine" }];
