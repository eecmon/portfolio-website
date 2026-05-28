import { useState } from "react";
import { SiteSettingsProvider, useSiteSettings } from "@/context/SiteSettingsContext";
import { PortfolioContentProvider, usePortfolioContent } from "@/context/PortfolioContentContext";
import { NavBar } from "@/components/customComponents/NavBar";
import type { NavItem } from "@/components/customComponents/NavBar/NavBar";
import { HeroComponent } from "@/components/customComponents/HeroComponent";
import { SectionRenderer } from "@/components/customComponents/Sections/SectionRenderer";
import { Footer } from "@/components/customComponents/Footer";
import { PortfolioBuilder } from "@/components/customComponents/Builder";
import { isLocalMode } from "@/api/apiMode";
import { slugify } from "@/lib/utils";

function PortfolioApp() {
  const { content, updateContent } = usePortfolioContent();
  const { settings, updateSettings } = useSiteSettings();
  const [isEditing, setIsEditing] = useState(false);

  // displayLang is the currently selected portfolio view language.
  // It starts at the configured default but can be toggled via the NavBar language switcher.
  const [displayLang, setDisplayLang] = useState<string>(
    () => settings?.defaultLanguage ?? "en"
  );

  // In local mode treat as editor. In API mode the Lambda injects editor.allowed
  // into the GET /content response based on the viewer's IP (CloudFront function).
  const editorAllowed = isLocalMode() || content?.editor?.allowed === true;

  if (!content || !settings) return null;

  const navItems: NavItem[] = [
    ...(content.hero.navLabel ? [{ label: content.hero.navLabel, anchor: slugify(content.hero.navLabel) }] : []),
    ...[...( content.sections ?? [])].sort((a, b) => a.order - b.order)
      .filter((s) => s.navLabel)
      .map((s) => ({ label: s.navLabel!, anchor: slugify(s.navLabel!) })),
  ];

  if (isEditing && editorAllowed) {
    return (
      <PortfolioBuilder
        initialSettings={settings}
        initialContent={content}
        onSaveSettings={updateSettings}
        onSaveContent={updateContent}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar
        firstName={content.hero.firstName}
        lastName={content.hero.lastName}
        editorAllowed={editorAllowed}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(true)}
        multilanguage={settings.multilanguage}
        displayLanguage={displayLang}
        onLanguageChange={setDisplayLang}
        navItems={navItems}
      />
      <main className="flex-1">
        <HeroComponent
          content={content.hero}
          defaultLanguage={displayLang}
          multilanguage={settings.multilanguage}
        />
        <SectionRenderer
          sections={content.sections ?? []}
          defaultLanguage={displayLang}
          multilanguage={settings.multilanguage}
        />
      </main>
      <Footer hero={content.hero} defaultLanguage={displayLang} />
    </div>
  );
}

function App() {
  return (
    <SiteSettingsProvider>
      <PortfolioContentProvider>
        <PortfolioApp />
      </PortfolioContentProvider>
    </SiteSettingsProvider>
  );
}

export default App;
