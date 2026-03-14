import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
}

const Breadcrumbs = ({ segments }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto scrollbar-hide">
        <li className="flex items-center gap-1 shrink-0">
          <Link to="/" className="hover:text-primary transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <li key={i} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
              {isLast || !seg.href ? (
                <span className={`truncate ${isLast ? "text-foreground font-medium" : ""}`}>
                  {seg.label}
                </span>
              ) : (
                <Link to={seg.href} className="hover:text-primary transition truncate">
                  {seg.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
