import { useState } from "react";
import { SiteSettingsProvider, useSiteSettings } from "@/context/SiteSettingsContext";
import { PortfolioContentProvider, usePortfolioContent } from "@/context/PortfolioContentContext";
import { NavBar } from "@/components/customComponents/NavBar";
import type { NavItem } from "@/components/customComponents/NavBar/NavBar";
import { HeroComponent } from "@/components/customComponents/HeroComponent";
import { SectionRenderer } from "@/components/customComponents/Sections/SectionRenderer";
import { Footer } from "@/components/customComponents/Footer";
import { PortfolioBuilder } from "@/components/customComponents/Builder";
import {
  ThemeIntroOverlay,
  shouldShowThemeIntro,
} from "@/components/customComponents/ThemeIntro";
import { isLocalMode } from "@/api/apiMode";
import { buildNavItems } from "@/lib/navLabel";
import { cn } from "@/lib/utils";

function PortfolioApp() {
  const { content, updateContent } = usePortfolioContent();
  const { settings, updateSettings } = useSiteSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introRevealing, setIntroRevealing] = useState(false);

  // displayLang is the currently selected portfolio view language.
  // It starts at the configured default but can be toggled via the NavBar language switcher.
  const [displayLang, setDisplayLang] = useState<string>(
    () => settings?.defaultLanguage ?? "en"
  );

  // In local mode treat as editor. In API mode the Lambda injects editor.allowed
  // into the GET /content response based on the viewer's IP (CloudFront function).
  const editorAllowed = isLocalMode() || content?.editor?.allowed === true;

  const showThemeIntro =
    !introComplete &&
    !isEditing &&
    content != null &&
    settings != null &&
    shouldShowThemeIntro(settings.theme, content.hero.firstName, content.hero.lastName);

  const blurSiteContent = showThemeIntro && !introRevealing;

  if (!content || !settings) return null;

  const navItems: NavItem[] = buildNavItems(content.hero, content.sections ?? [], displayLang);

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
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[filter,transform] duration-300 ease-out",
          blurSiteContent && "pointer-events-none blur-md brightness-[0.97]",
          introRevealing && "pointer-events-auto"
        )}
      >
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
            theme={settings.theme}
          />
          <SectionRenderer
            sections={content.sections ?? []}
            defaultLanguage={displayLang}
            multilanguage={settings.multilanguage}
            theme={settings.theme}
          />
        </main>
        <Footer hero={content.hero} defaultLanguage={displayLang} theme={settings.theme} />
      </div>

      {showThemeIntro && (
        <ThemeIntroOverlay
          theme={settings.theme}
          firstName={content.hero.firstName}
          lastName={content.hero.lastName}
          onReveal={() => setIntroRevealing(true)}
          onComplete={() => setIntroComplete(true)}
        />
      )}
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
