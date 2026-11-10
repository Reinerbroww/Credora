import Image from "next/image";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/credora-mark.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_6px_18px_rgba(132,193,118,0.35)]"
      />
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
