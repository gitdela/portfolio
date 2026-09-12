/**
 * The row of actions under a project: its live surfaces, then whatever the page wants to
 * slot in the middle (the Work index puts "Read the case study" there), then the repository.
 *
 * Actions without a real destination are omitted rather than rendered as "#", so the page
 * never offers a link that goes nowhere.
 */

interface ProjectLink {
  label: string | null;
  url: string | null;
}

interface ProjectLinksProps {
  liveUrl?: string | null;
  liveLabel?: string | null;
  additionalLinks?: (ProjectLink | null)[] | null;
  repositoryUrl?: string | null;
  /** Rendered between the live actions and the repository action. */
  children?: React.ReactNode;
  className?: string;
}

const ACTION_CLASS = "text-accent hover:underline";

/*
 * The outward arrow is an SVG rather than the "↗" character: U+2197 has an Apple Color
 * Emoji glyph, and iOS falls back to it when the webfont has no glyph of its own, so
 * iPhones rendered the blue emoji square. Labels are stripped of any arrow an editor
 * types so the character can never reach the page.
 */
function stripArrow(label: string): string {
  return label.replace(/\s*[\u2197\u2192][\uFE0E\uFE0F]?\s*$/u, "");
}

function OutwardArrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mb-[0.1em] ml-1 inline-block h-[0.62em] w-[0.62em]"
    >
      <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" />
    </svg>
  );
}

export function ProjectLinks({
  liveUrl,
  liveLabel,
  additionalLinks,
  repositoryUrl,
  children,
  className = "",
}: ProjectLinksProps) {
  const extras = (additionalLinks ?? []).filter(
    (link): link is { label: string; url: string } => Boolean(link?.label) && Boolean(link?.url),
  );

  if (!liveUrl && extras.length === 0 && !repositoryUrl && !children) return null;

  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-2 text-body-sm font-bold ${className}`}>
      {liveUrl ? (
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={ACTION_CLASS}>
          {stripArrow(liveLabel ?? "Live site")}
          <OutwardArrow />
        </a>
      ) : null}

      {extras.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={ACTION_CLASS}
        >
          {stripArrow(link.label)}
          <OutwardArrow />
        </a>
      ))}

      {children}

      {repositoryUrl ? (
        <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className={ACTION_CLASS}>
          View on GitHub →
        </a>
      ) : null}
    </div>
  );
}
