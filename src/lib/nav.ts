import type { ComponentType, SVGProps } from "react";
import {
  ChartIcon,
  ClipboardCheckIcon,
  GridIcon,
  LayersIcon,
  SettingsIcon,
} from "@/components/icons";

export interface NavItem {
  labelKey: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.overview", href: "/dashboard", icon: GridIcon },
  { labelKey: "nav.applications", href: "/applications", icon: LayersIcon },
  { labelKey: "nav.portfolio", href: "/portfolio", icon: ChartIcon },
  { labelKey: "nav.underwriting", href: "/underwriting", icon: ClipboardCheckIcon },
  { labelKey: "nav.settings", href: "/settings", icon: SettingsIcon },
];

interface PageMeta {
  titleKey: string;
  sectionKey: string;
}

export function getPageMeta(pathname: string): PageMeta {
  if (pathname.startsWith("/applications/new")) {
    return { titleKey: "page.addApplication", sectionKey: "section.applications" };
  }
  if (/^\/applications\/[^/]+\/assessment/.test(pathname)) {
    return { titleKey: "page.riskAssessment", sectionKey: "section.applications" };
  }
  if (/^\/applications\/[^/]+/.test(pathname)) {
    return { titleKey: "page.applicationDetail", sectionKey: "section.applications" };
  }
  if (pathname.startsWith("/applications")) {
    return { titleKey: "page.applications", sectionKey: "section.workspace" };
  }
  if (/^\/underwriting\/[^/]+/.test(pathname)) {
    return { titleKey: "page.reviewDetail", sectionKey: "section.underwriting" };
  }
  if (pathname.startsWith("/underwriting")) {
    return { titleKey: "page.underwriting", sectionKey: "section.workspace" };
  }
  if (pathname.startsWith("/portfolio")) {
    return { titleKey: "page.portfolio", sectionKey: "section.workspace" };
  }
  if (pathname.startsWith("/settings")) {
    return { titleKey: "page.settings", sectionKey: "section.workspace" };
  }
  return { titleKey: "page.overview", sectionKey: "section.workspace" };
}
