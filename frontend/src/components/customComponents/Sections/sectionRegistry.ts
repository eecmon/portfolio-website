import type { SectionType } from "@/api/contentApi";
import type { SectionProps } from "./TimelineSection";
import type { ComponentType } from "react";

import { TimelineSection } from "./TimelineSection";
import { TextSection } from "./TextSection";
import { ImageSection } from "./ImageSection";
import { SkillsSection } from "./SkillsSection";
import { InsightsSection } from "./InsightsSection";
import { GitHubSection } from "./GitHubSection";
import { ContactSection } from "./ContactSection";

export const sectionRegistry: Partial<Record<SectionType, ComponentType<SectionProps>>> = {
  timeline: TimelineSection,
  text: TextSection,
  image: ImageSection,
  skills: SkillsSection,
  insights: InsightsSection,
  github: GitHubSection,
  contact: ContactSection,
};
