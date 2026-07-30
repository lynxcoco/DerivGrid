import { Link } from "@tanstack/react-router";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  to?: string;
}

export function Logo({ size = "md", withText = true, to = "/" }: LogoProps) {
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  const iconSize =
    size === "sm" ? "size-6" : size === "lg" ? "size-9" : "size-7";

  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 group"
      aria-label="DerivGrid home"
    >
      <span
        className={`relative inline-flex ${iconSize} items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground font-bold shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-3/5"
          aria-hidden
        >
          <path
            d="M3 17l4-4 3 3 5-6 4 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 7l3 0 0 3"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withText && (
        <span className={`${textSize} font-bold tracking-tight text-foreground`}>
          Deriv<span className="text-primary">Grid</span>
        </span>
      )}
    </Link>
  );
}
