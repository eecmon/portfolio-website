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

export interface Content {
  hero: HeroContent;
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
};

export async function getContent(): Promise<Content> {
  if (isLocalMode()) {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Content) : { ...defaultContent, hero: { ...defaultContent.hero } };
  }

  const res = await fetch("/api/content");
  if (!res.ok) throw new Error(`GET /api/content failed: ${res.status}`);
  return res.json() as Promise<Content>;
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
