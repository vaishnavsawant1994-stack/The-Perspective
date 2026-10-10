export type ProductionAlias = {
  readonly source: string;
  readonly destination: string;
};

export const r14ProductionAliases: readonly ProductionAlias[] = [
  { source: "/blogs", destination: "/perspective" },
  { source: "/magazine/subscribe", destination: "/subscribe" },
  { source: "/newsletter", destination: "/newsletters" },
  { source: "/my-perspective", destination: "/my" },
  { source: "/my-perspective/saved", destination: "/my/saved" },
  { source: "/my-perspective/following", destination: "/my/following" },
  { source: "/my-perspective/newsletters", destination: "/my/newsletters" },
  { source: "/my-perspective/subscription", destination: "/my/subscription" },
  { source: "/my-perspective/billing", destination: "/my/billing" },
  { source: "/my-perspective/settings", destination: "/my/settings" },
  { source: "/my-perspective/notifications", destination: "/my/notifications" },
  { source: "/my-perspective/magazines", destination: "/my/magazines" },
  { source: "/my-perspective/events", destination: "/my/events" },
  { source: "/my-perspective/support", destination: "/my/support" },
  { source: "/sign-in", destination: "/login" },
  { source: "/premium", destination: "/magazine/premium" },
];

export const supersededLegacyAliasSources = new Set([
  ...r14ProductionAliases.map(({ source }) => source),
  "/subscribe",
  "/advertise",
]);
