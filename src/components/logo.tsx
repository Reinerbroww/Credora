interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sage text-[#112016] shadow-[0_6px_18px_-8px_rgba(184,217,168,0.8)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 2.6 4.5 5.8v5.6c0 4.6 3.1 8.5 7.5 10 4.4-1.5 7.5-5.4 7.5-10V5.8L12 2.6Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="m8.3 13.2 2.3-2.6 2.1 1.9 3-3.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight text-white">
            Credora
          </span>
          <span className="block text-[9px] font-medium uppercase tracking-[0.2em] text-muted">
            Credit Intelligence
          </span>
        </span>
      )}
    </div>
  );
}
