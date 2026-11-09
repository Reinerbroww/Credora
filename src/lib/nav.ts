import type { ComponentType, SVGProps } from "react";
import {
  ChartIcon,
  ClipboardCheckIcon,
  GridIcon,
  LayersIcon,
  SettingsIcon,
} from "@/components/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: GridIcon },
  { label: "Applications", href: "/applications", icon: LayersIcon },
  { label: "Portfolio Analytics", href: "/portfolio", icon: ChartIcon },
  { label: "Underwriting Reviews", href: "/underwriting", icon: ClipboardCheckIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

interface PageMeta {
  title: string;
  section: string;
}

export function getPageMeta(pathname: string): PageMeta {
  if (pathname.startsWith("/applications/new")) {
    return { title: "Add Application", section: "Applications" };
  }
  if (/^\/applications\/[^/]+\/assessment/.test(pathname)) {
    return { title: "Risk Assessment", section: "Applications" };
  }
  if (/^\/applications\/[^/]+/.test(pathname)) {
    return { title: "Application Detail", section: "Applications" };
  }
  if (pathname.startsWith("/applications")) {
    return { title: "Applications", section: "Workspace" };
  }
  if (/^\/underwriting\/[^/]+/.test(pathname)) {
    return { title: "Review Detail", section: "Underwriting Reviews" };
  }
  if (pathname.startsWith("/underwriting")) {
    return { title: "Underwriting Reviews", section: "Workspace" };
  }
  if (pathname.startsWith("/portfolio")) {
    return { title: "Portfolio Analytics", section: "Workspace" };
  }
  if (pathname.startsWith("/settings")) {
    return { title: "Settings", section: "Workspace" };
  }
  return { title: "Overview", section: "Workspace" };
}
