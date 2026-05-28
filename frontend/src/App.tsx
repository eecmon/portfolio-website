import { useState } from "react";
import { SiteSettingsProvider, useSiteSettings } from "@/context/SiteSettingsContext";
import { PortfolioContentProvider, usePortfolioContent } from "@/context/PortfolioContentContext";
import { NavBar } from "@/components/customComponents/NavBar";
import { HeroComponent } from "@/components/customComponents/HeroComponent";
import { SectionRenderer } from "@/components/customComponents/Sections/SectionRenderer";
import { PortfolioBuilder } from "@/components/customComponents/Builder";
import { isLocalMode } from "@/api/apiMode";

function PortfolioApp() {
  const { content, updateContent } = usePortfolioContent();
  const { settings, updateSettings } = useSiteSettings();
  const [isEditing, setIsEditing] = useState(false);

  // displayLang is the currently selected portfolio view language.
  // It starts at the configured default but can be toggled via the NavBar language switcher.
  const [displayLang, setDisplayLang] = useState<string>(
    () => settings?.defaultLanguage ?? "en"
  );

  // In local mode the CloudFront meta tag is absent — treat dev as editor.
  const editorAllowed =
    isLocalMode() ||
    (document.querySelector<HTMLMetaElement>('meta[name="x-editor-allowed"]')
      ?.content ?? "false") === "true";

  if (!content || !settings) return null;

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
    <div className="min-h-screen bg-background">
      <NavBar
        firstName={content.hero.firstName}
        lastName={content.hero.lastName}
        editorAllowed={editorAllowed}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(true)}
        multilanguage={settings.multilanguage}
        displayLanguage={displayLang}
        onLanguageChange={setDisplayLang}
      />
      <main>
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
