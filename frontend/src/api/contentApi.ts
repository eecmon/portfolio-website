import { isLocalMode } from "./apiMode";

export interface HeroLink {
  name: string;
  href: string;
  iconUrl?: string;
}

export interface HeroContent {
  firstName: string;
  lastName: string;
  occupation_de: string;
  occupation_en: string;
  summary_de: string;
  summary_en: string;
  profile_image: string;
  links: HeroLink[];
}

// ── Portfolio Sections ────────────────────────────────────────────

export type SectionType = "timeline" | "text" | "image" | "skills" | "insights";

export interface TimelineItem {
  id: string;
  order: number;
  date: string;
  title: string;
  description?: string;
}

// Image section
export interface SectionImage {
  id: string;
  imageUrl: string;
  caption?: string;
  order: number;
}

// Skills section
export interface SkillBadgeItem {
  id: string;
  label: string;
}

export interface SkillGroup {
  id: string;
  order: number;
  heading: string;
  items: SkillBadgeItem[];
}

// Insights section
export interface InsightDetailBlock {
  id: string;
  order: number;
  header?: string;
  description?: string;
  imageUrl?: string;
}

export interface InsightItem {
  id: string;
  order: number;
  name: string;
  shortDescription: string;
  detailBlocks: InsightDetailBlock[];
}

export interface PortfolioSection {
  id: string;
  type: SectionType;
  order: number;
  title: string;
  subtext?: string;
  description?: string;
  iconUrl?: string;
  data: Record<string, unknown>;
}

export interface Content {
  hero: HeroContent;
  sections: PortfolioSection[];
}

const STORAGE_KEY = "portfolio.content";

const defaultContent: Content = {
  hero: {
    firstName: "",
    lastName: "",
    occupation_de: "",
    occupation_en: "",
    summary_de: "",
    summary_en: "",
    profile_image: "",
    links: [],
  },
  sections: [],
};

export async function getContent(): Promise<Content> {
  if (isLocalMode()) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultContent, hero: { ...defaultContent.hero }, sections: [] };
    const parsed = JSON.parse(raw) as Partial<Content>;
    return { ...defaultContent, ...parsed, sections: parsed.sections ?? [] };
  }

  const res = await fetch("/api/content");
  if (!res.ok) throw new Error(`GET /api/content failed: ${res.status}`);
  const data = (await res.json()) as Partial<Content>;
  return { ...defaultContent, ...data, sections: data.sections ?? [] };
}

export async function putContent(content: Content): Promise<void> {
  if (isLocalMode()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    return;
  }

  const res = await fetch("/api/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new Error(`PUT /api/content failed: ${res.status}`);
}
