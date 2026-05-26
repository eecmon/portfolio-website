import { useState } from "react";
import { SiteSettingsProvider, useSiteSettings } from "@/context/SiteSettingsContext";
import { PortfolioContentProvider, usePortfolioContent } from "@/context/PortfolioContentContext";
import { NavBar } from "@/components/customComponents/NavBar";
import { HeroComponent } from "@/components/customComponents/HeroComponent";
import { PortfolioBuilder } from "@/components/customComponents/Builder";
import { isLocalMode } from "@/api/apiMode";

function PortfolioApp() {
  const { content, updateContent } = usePortfolioContent();
  const { settings, updateSettings } = useSiteSettings();
  const [isEditing, setIsEditing] = useState(false);

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
      />
      <main>
        <HeroComponent
          content={content.hero}
          defaultLanguage={settings.defaultLanguage}
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
