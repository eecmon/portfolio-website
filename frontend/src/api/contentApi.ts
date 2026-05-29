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
  profile_image_position?: string;
  profile_image_zoom?: number;
  navLabel?: string;
  navLabel_en?: string;
  navLabel_de?: string;
  links: HeroLink[];
}

// ── Portfolio Sections ────────────────────────────────────────────

export type SectionType = "timeline" | "text" | "image" | "skills" | "insights" | "github" | "contact";

export interface TimelineItem {
  id: string;
  order: number;
  date: string;
  title: string;
  title_en?: string;
  title_de?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
}

// Image section
export interface SectionImage {
  id: string;
  imageUrl: string;
  caption?: string;
  caption_en?: string;
  caption_de?: string;
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
  header_en?: string;
  header_de?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
  imageUrl?: string;
}

export interface InsightItem {
  id: string;
  order: number;
  name: string;
  name_en?: string;
  name_de?: string;
  shortDescription: string;
  shortDescription_en?: string;
  shortDescription_de?: string;
  detailBlocks: InsightDetailBlock[];
}

export interface PortfolioSection {
  id: string;
  type: SectionType;
  order: number;
  navLabel?: string;
  navLabel_en?: string;
  navLabel_de?: string;
  title: string;
  title_en?: string;
  title_de?: string;
  subtext?: string;
  subtext_en?: string;
  subtext_de?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
  iconUrl?: string;
  data: Record<string, unknown>;
}

export interface Content {
  hero: HeroContent;
  sections: PortfolioSection[];
  /** Populated by the API at read-time; never persisted. */
  editor?: { allowed: boolean; viewerIp?: string | null };
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
  // Strip runtime-only fields before saving
  const { editor: _editor, ...payload } = content;

  if (isLocalMode()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return;
  }

  const res = await fetch("/api/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PUT /api/content failed: ${res.status}`);
}
