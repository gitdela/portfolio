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
          {liveLabel ?? "Live site ↗"}
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
          {link.label}
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
