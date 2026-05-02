import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Banner } from "@/hooks/useBanners";

const STOREFRONT_HOSTS = ["ucogold.com", "www.ucogold.com"];
const ROTATE_INTERVAL_MS = 7000;

type LinkParse =
  | { type: "internal"; path: string }
  | { type: "external"; path: string }
  | { type: "none"; path: "" };

function parseLink(linkUrl: string | null): LinkParse {
  if (!linkUrl) return { type: "none", path: "" };
  if (linkUrl.startsWith("/")) return { type: "internal", path: linkUrl };
  try {
    const url = new URL(linkUrl);
    const sameHost =
      typeof window !== "undefined" && url.hostname === window.location.hostname;
    if (STOREFRONT_HOSTS.includes(url.hostname) || sameHost) {
      return { type: "internal", path: url.pathname + url.search + url.hash };
    }
    return { type: "external", path: linkUrl };
  } catch {
    return { type: "none", path: "" };
  }
}

function SlideLinkWrapper({
  linkUrl,
  children,
  ariaLabel,
}: {
  linkUrl: string | null;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const parsed = parseLink(linkUrl);
  const baseClass = "block w-full h-full";
  if (parsed.type === "internal") {
    return (
      <Link to={parsed.path} className={cn(baseClass, "cursor-pointer")} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  if (parsed.type === "external") {
    return (
      <a
        href={parsed.path}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClass, "cursor-pointer")}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return <div className={baseClass}>{children}</div>;
}

interface Props {
  banners: Banner[];
}

const HeroBannerCarousel = ({ banners }: Props) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const total = banners.length;
  const hasMultiple = total > 1;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!hasMultiple || paused || reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [hasMultiple, paused, reducedMotion, total]);

  const goTo = useCallback(
    (i: number) => {
      if (total === 0) return;
      setIndex(((i % total) + total) % total);
    },
    [total]
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  if (total === 0) return null;

  return (
    <section
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="group relative w-full aspect-[16/5] overflow-hidden bg-muted focus:outline-none"
    >
      {banners.map((banner, i) => {
        const isActive = i === index;
        const ariaLabel =
          banner.title ?? `Slide ${i + 1} of ${total}`;
        return (
          <div
            key={banner.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${total}`}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-out",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            <SlideLinkWrapper linkUrl={banner.link_url} ariaLabel={ariaLabel}>
              <div className="relative w-full h-full">
                <img
                  src={banner.image_url}
                  alt={banner.title ?? ""}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
                {/* Bottom-left gradient scrim for text legibility */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0) 60%)",
                  }}
                />
                {(banner.title || banner.subtitle) && (
                  <div className="absolute bottom-0 left-0 max-w-[90%] md:max-w-[60%] p-5 md:p-8">
                    {banner.title && (
                      <h2 className="font-bold text-white leading-[1.1] text-[22px] md:text-[36px]">
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="mt-2 text-white/85 leading-snug text-sm md:text-lg">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </SlideLinkWrapper>
          </div>
        );
      })}

      {/* Arrows — desktop only, visible on hover */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {hasMultiple && (
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((b, i) => {
            const isActive = i === index;
            return (
              <button
                key={b.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all",
                  isActive
                    ? "bg-accent w-6 h-2"
                    : "bg-white/60 hover:bg-white/80 w-2 h-2"
                )}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HeroBannerCarousel;
