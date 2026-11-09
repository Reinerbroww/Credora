import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Base>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </Base>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 20V10" />
      <path d="M9.5 20V4" />
      <path d="M15 20v-7" />
      <path d="M20.5 20V7" />
    </Base>
  );
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="m9 13 2 2 4-4.5" />
    </Base>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.9 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8.9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </Base>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Base>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </Base>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
    </Base>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Base>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m9 6 6 6-6 6" />
    </Base>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m15 6-6 6 6 6" />
    </Base>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Base>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m4 12.5 5 5L20 6.5" />
    </Base>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10.3 4.2 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Base>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Base>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 9h18" />
      <path d="M16 14h2" />
    </Base>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3 5 6v6c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4.5" />
    </Base>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Base>
  );
}

export function TrendIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Base>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Base>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Base>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
      <path d="M10 21v-3h4v3" />
    </Base>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Base>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Base>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6.3 6.3 2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" />
    </Base>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />
    </Base>
  );
}

export function FolderIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </Base>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6" />
      <path d="M4.5 11.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6" />
    </Base>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 21h16" />
    </Base>
  );
}
