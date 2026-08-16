"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Crown,
  FileText,
  LockKeyhole,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import {
  formatSubscriptionPrice,
  getPlanPriceCents,
} from "@/lib/subscription-pricing";
import type {
  BillingFrequency,
  MagazineSubscriptionContent,
  SubscriptionPlan,
} from "@/types";
import styles from "./magazine-subscription-redesign.module.css";

const planIcons = [BookOpen, FileText, Crown];
function planPrice(plan: SubscriptionPlan, billing: BillingFrequency) {
  const cents = getPlanPriceCents(plan, billing);
  if (billing === "annual" && cents > 0)
    return formatSubscriptionPrice(Math.round(cents / 12), plan.currency);
  return formatSubscriptionPrice(cents, plan.currency);
}

function PlanCard({
  plan,
  index,
  billing,
}: {
  plan: SubscriptionPlan;
  index: number;
  billing: BillingFrequency;
}) {
  const Icon = planIcons[index] ?? BookOpen;
  return (
    <article
      className={`${styles.planCard} ${plan.featured ? styles.featuredPlan : ""}`}
    >
      {plan.featured ? <b className={styles.bestValue}>Best value</b> : null}
      <header>
        <span>
          <Icon aria-hidden="true" />
        </span>
        <div>
          <h2>{plan.name}</h2>
          <p>
            <strong>{planPrice(plan, billing)}</strong> / month
          </p>
          {billing === "annual" && plan.monthlyPriceCents > 0 ? (
            <small>Billed annually</small>
          ) : null}
        </div>
      </header>
      <p className={styles.planDescription}>{plan.description}</p>
      <ul>
        {plan.marketingBenefits.slice(0, 8).map((benefit) => (
          <li key={benefit}>
            <Check aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
      <Link href={plan.ctaHref}>
        {plan.slug === "reader" ? "Start reading free" : plan.ctaLabel}
      </Link>
    </article>
  );
}

export function MagazineSubscriptionRedesign({
  content,
}: {
  content: MagazineSubscriptionContent;
}) {
  const [billing, setBilling] = useState<BillingFrequency>("monthly");
  const cover = content.readerIssue.coverImage;
  const entitlements = new Map(
    content.entitlements.map((item) => [item.key, item]),
  );
  const featureCards = [
    [
      "Digital Reader",
      "Flip, scroll, zoom and read complete digital issues on every screen.",
      MonitorSmartphone,
      `/magazine/read/${content.readerIssue.slug}`,
    ],
    [
      "Text View",
      "A calm, accessible reading mode for every complete issue and article.",
      FileText,
      `/magazine/read/${content.readerIssue.slug}?view=text`,
    ],
    [
      "Magazine Archive",
      `Explore ${content.archiveIssueCount} issues and timeless stories across every category.`,
      Archive,
      "/magazine/archive",
    ],
    [
      "Premium Content",
      "Unlock deeper interviews, special reports and exclusive long-form editions.",
      LockKeyhole,
      "/magazine/premium",
    ],
  ] as const;

  return (
    <div className={styles.page}>
      <nav
        aria-label="Magazine subscription navigation"
        className={styles.subnav}
      >
        <Link href="/magazine">Magazine</Link>
        <Link href="/magazine/premium">Premium</Link>
        <Link href="/magazine/archive">Archive</Link>
        <Link href={`/magazine/read/${content.readerIssue.slug}`}>
          Digital Reader
        </Link>
        <Link aria-current="page" href="/magazine/subscribe">
          <Crown aria-hidden="true" /> Subscribe
        </Link>
      </nav>

      <section
        aria-labelledby="subscription-redesign-heading"
        className={styles.hero}
      >
        <div className={styles.heroCopy}>
          <p>Subscribe to The Perspective</p>
          <h1 id="subscription-redesign-heading">
            Choose How You
            <br />
            Read The Perspective
          </h1>
          <span>
            From daily editorial coverage to complete digital magazine and
            Premium access, choose the experience that fits how deeply you want
            to read.
          </span>
          <div
            className={styles.billingToggle}
            role="group"
            aria-label="Billing frequency"
          >
            <button
              aria-pressed={billing === "monthly"}
              onClick={() => setBilling("monthly")}
              type="button"
            >
              Monthly billing
            </button>
            <button
              aria-pressed={billing === "annual"}
              onClick={() => setBilling("annual")}
              type="button"
            >
              Annual billing
            </button>
            <b>Save 17%</b>
          </div>
          <ul className={styles.trustList}>
            <li>
              <CircleCheck aria-hidden="true" /> Cancel anytime
            </li>
            <li>
              <ShieldCheck aria-hidden="true" /> Secure payment
            </li>
            <li>
              <Sparkles aria-hidden="true" /> Instant access
            </li>
          </ul>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCover}>
            <div className={styles.heroMagazine}>
              {cover ? (
                <Image
                  alt={cover.alt}
                  fill
                  priority
                  sizes="360px"
                  src={cover.src}
                />
              ) : null}
              <i />
              <div>
                <small>The Perspective</small>
                <b>The Architects of Tomorrow</b>
                <span>Ideas, leaders and the future we build.</span>
              </div>
            </div>
          </div>
          <div className={styles.laptop}>
            <div className={styles.laptopScreen}>
              <div>
                <small>The Perspective</small>
                <h2>
                  Leadership
                  <br />
                  in an Age of
                  <br />
                  Uncertainty
                </h2>
                <p>Long-form reporting for decisions that matter.</p>
              </div>
              {cover ? (
                <Image
                  alt={cover.alt}
                  fill
                  priority
                  sizes="430px"
                  src={cover.src}
                />
              ) : null}
            </div>
            <span />
          </div>
          <div className={styles.phone}>
            {cover ? (
              <Image
                alt={cover.alt}
                fill
                priority
                sizes="150px"
                src={cover.src}
              />
            ) : null}
            <i />
          </div>
        </div>
      </section>

      <section
        aria-label="Subscription plans"
        className={styles.plans}
        id="subscription-plans"
      >
        {content.plans.map((plan, index) => (
          <PlanCard billing={billing} index={index} key={plan.id} plan={plan} />
        ))}
      </section>

      <section
        aria-labelledby="plan-comparison-heading"
        className={styles.comparison}
      >
        <h2 id="plan-comparison-heading">Compare plan benefits</h2>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Benefits</th>
                {content.plans.map((plan) => (
                  <th
                    className={plan.featured ? styles.premiumColumn : ""}
                    key={plan.id}
                  >
                    {plan.name}
                    <small>{planPrice(plan, billing)} / month</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.comparisonKeys.map((key, index) => (
                <tr key={key}>
                  <th>
                    <span>{index + 1}</span>
                    {entitlements.get(key)?.label}
                  </th>
                  {content.plans.map((plan) => (
                    <td
                      className={plan.featured ? styles.premiumColumn : ""}
                      key={plan.id}
                    >
                      {plan.entitlementKeys.includes(key) ? (
                        <Check aria-label="Included" />
                      ) : (
                        <i aria-label="Not included">—</i>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-label="Subscription features"
        className={styles.featureStrip}
      >
        {featureCards.map(([title, description, Icon, href], index) => (
          <Link href={href} key={title}>
            <div className={styles.featureArtwork}>
              {index === 2 ? (
                <span className={styles.archiveGrid}>
                  {Array.from({ length: 12 }, (_, item) => (
                    <i key={item} />
                  ))}
                </span>
              ) : cover ? (
                <Image alt="" fill sizes="180px" src={cover.src} />
              ) : null}
              <b>
                <Icon aria-hidden="true" />
              </b>
            </div>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
              <span>
                Learn more <ArrowRight aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className={styles.audienceFaq}>
        <article aria-labelledby="audience-heading">
          <h2 id="audience-heading">Who is each plan for?</h2>
          <div>
            {content.audiences.map((audience, index) => {
              const Icon = [Users, BookOpen, Crown][index] ?? Users;
              return (
                <section key={audience.tier}>
                  <Icon aria-hidden="true" />
                  <h3>{audience.name}</h3>
                  <p>{audience.description}</p>
                  <Link href={content.plans[index]?.ctaHref ?? "/magazine"}>
                    {index === 0
                      ? "Start reading free"
                      : index === 1
                        ? "Subscribe to Digital"
                        : "Go Premium"}{" "}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </section>
              );
            })}
          </div>
        </article>
        <article aria-labelledby="faq-redesign-heading">
          <h2 id="faq-redesign-heading">Frequently asked questions</h2>
          <div>
            {content.faqs.slice(0, 5).map((faq) => (
              <details key={faq.id}>
                <summary>
                  {faq.question}
                  <span>+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
          <Link href="#subscription-current-content">
            View all FAQs <ArrowRight aria-hidden="true" />
          </Link>
        </article>
      </section>

      <section
        aria-labelledby="why-subscribe-heading"
        className={styles.whySubscribe}
      >
        <h2 id="why-subscribe-heading">Why subscribe to The Perspective?</h2>
        <div>
          {[
            [
              BookOpen,
              "Independent Journalism",
              "Unbiased reporting and editorial independence.",
            ],
            [
              Users,
              "Deep Expertise",
              "In-depth analysis from leading voices and experts.",
            ],
            [
              ShieldCheck,
              "Quality Over Quantity",
              "Curated stories that inform, inspire and influence.",
            ],
            [
              MonitorSmartphone,
              "Built for Readers",
              "A beautiful, focused reading experience.",
            ],
          ].map(([Icon, title, description]) => {
            const ItemIcon = Icon as typeof BookOpen;
            return (
              <article key={title as string}>
                <ItemIcon aria-hidden="true" />
                <div>
                  <h3>{title as string}</h3>
                  <p>{description as string}</p>
                </div>
              </article>
            );
          })}
        </div>
        <aside>
          <div className={styles.ctaCovers}>
            {content.premiumIssues.slice(0, 2).map((issue) => (
              <MagazineCover issue={issue} key={issue.id} variant="compact" />
            ))}
          </div>
          <div>
            <h3>Ready to read smarter?</h3>
            <p>
              Join readers who trust The Perspective for stories that matter.
            </p>
            <Link href="#subscription-plans">View all plans</Link>
          </div>
        </aside>
      </section>

      <section className={styles.briefing}>
        <Mail aria-hidden="true" />
        <div>
          <h2>The Perspective Briefing</h2>
          <p>
            Get premium stories, interviews and highlights delivered to your
            inbox every week.
          </p>
        </div>
        <NewsletterForm
          buttonLabel="Subscribe now"
          label="Perspective briefing"
          theme="light"
        />
      </section>

      <section
        aria-labelledby="original-subscription-heading"
        className={styles.originalIntro}
      >
        <p>Complete subscription guide</p>
        <h2 id="original-subscription-heading">
          Original plans and membership details
        </h2>
        <span>
          The existing subscription content, Digital Reader explanation, archive
          information and complete FAQ collection continue below.
        </span>
      </section>
      <div id="subscription-current-content" />
    </div>
  );
}
