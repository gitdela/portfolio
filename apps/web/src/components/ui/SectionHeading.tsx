/**
 * The signature motif: a 13px uppercase eyebrow above a 30×3px accent bar.
 *
 * The bar's bottom margin is not one constant in the handoff — it is 24px on the Home and
 * About section headings, 20px on About Skills and Contact Elsewhere, 14px inside the case
 * study and blog-post body, and 8px on Home's testimonials where an italic note follows.
 * Those four values are the whole set, so they are named rather than passed as numbers.
 */
const BAR_SPACING = {
  wide: "mb-6", // 24px
  medium: "mb-5", // 20px
  narrow: "mb-[14px]",
  tight: "mb-2", // 8px — a note follows immediately
} as const;

export type SectionHeadingSpacing = keyof typeof BAR_SPACING;

export interface SectionHeadingProps {
  children: React.ReactNode;
  spacing?: SectionHeadingSpacing;
  /** Rendering level. The page's single h1 lives elsewhere, so these default to h2. */
  as?: "h2" | "h3";
  id?: string;
}

export function SectionHeading({
  children,
  spacing = "wide",
  as: Tag = "h2",
  id,
}: SectionHeadingProps) {
  return (
    <>
      <Tag id={id} className="section-eyebrow m-0 mb-1">
        {children}
      </Tag>
      <div className={`h-[3px] w-[30px] bg-accent ${BAR_SPACING[spacing]}`} />
    </>
  );
}
