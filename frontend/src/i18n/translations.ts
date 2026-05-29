export type UILang = "en" | "de";

export const translations: Record<UILang, Record<string, string>> = {
  en: {
    // Nav
    "nav.edit": "Edit",
    "nav.done": "Done",
    "nav.label": "Navigation label",
    "nav.labelPlaceholder": "e.g. About, Skills…",

    // Builder chrome
    "builder.title": "Portfolio Builder",
    "builder.livePreview": "Live Preview",

    // Common actions
    "common.save": "Save",
    "common.saving": "Saving…",
    "common.cancel": "Cancel",
    "common.remove": "Remove",
    "common.uploading": "Uploading…",
    "common.uploadIcon": "Upload Icon",
    "common.changeIcon": "Change Icon",
    "common.removeIcon": "Remove icon",
    "common.uploadImage": "Upload Image",
    "common.changeImage": "Change Image",

    // Hero editor
    "hero.card": "Hero",
    "hero.firstName": "First Name",
    "hero.lastName": "Last Name",
    "hero.occupationEn": "Occupation (EN)",
    "hero.occupationDe": "Occupation (DE)",
    "hero.summaryEn": "Summary (EN)",
    "hero.summaryDe": "Summary (DE)",
    "hero.profileImage": "Profile Image",
    "hero.links": "Links",
    "hero.addLink": "Add Link",
    "hero.noLinks": "No links yet — click Add Link to add one.",

    // Sections panel
    "sections.heading": "Sections",
    "sections.empty": "No sections yet — use the button below to add one.",
    "sections.insert": "+ Insert",
    "sections.add": "+ Add Section",

    // Section type names (used in add menus + section card headers)
    "sectionType.timeline": "Timeline",
    "sectionType.text": "Text",
    "sectionType.image": "Image",
    "sectionType.skills": "Skills",
    "sectionType.insights": "Insights",
    "sectionType.github": "GitHub Activity",

    // GitHub section editor
    "githubSection.tokenNote": "Contribution data is fetched server-side using the PORTFOLIO_GITHUB_PAT secret — no token is exposed to visitors.",
    "githubSection.showGraph": "Show contribution graph",

    // Generic section fields
    "section.title": "Title",
    "section.titleEn": "Title (EN)",
    "section.titleDe": "Title (DE)",
    "section.subtext": "Subtext",
    "section.subtextEn": "Subtext (EN)",
    "section.subtextDe": "Subtext (DE)",
    "section.description": "Description",
    "section.descriptionEn": "Description (EN)",
    "section.descriptionDe": "Description (DE)",
    "section.icon": "Icon",
    "section.moveUp": "Move up",
    "section.moveDown": "Move down",
    "section.remove": "Remove section",

    // Image section editor
    "imageSection.caption": "Caption",
    "imageSection.captionEn": "Caption (EN)",
    "imageSection.captionDe": "Caption (DE)",
    "imageSection.addImage": "Add Image",
    "imageSection.noImages": "No images yet.",

    // Skills section editor
    "skillsSection.heading": "Group heading",
    "skillsSection.addGroup": "Add Group",
    "skillsSection.addItem": "Add Skill",
    "skillsSection.noGroups": "No skill groups yet.",
    "skillsSection.label": "Skill label",

    // Insights section editor
    "insightsSection.addItem": "Add Insight",
    "insightsSection.noItems": "No insights yet.",
    "insightsSection.name": "Name",
    "insightsSection.nameEn": "Name (EN)",
    "insightsSection.nameDe": "Name (DE)",
    "insightsSection.shortDescription": "Short description",
    "insightsSection.shortDescriptionEn": "Short description (EN)",
    "insightsSection.shortDescriptionDe": "Short description (DE)",
    "insightsSection.addBlock": "Add Block",
    "insightsSection.blockHeader": "Block header",
    "insightsSection.blockHeaderEn": "Block header (EN)",
    "insightsSection.blockHeaderDe": "Block header (DE)",
    "insightsSection.blockDescription": "Block description",
    "insightsSection.blockDescriptionEn": "Block description (EN)",
    "insightsSection.blockDescriptionDe": "Block description (DE)",

    // Footer
    "footer.resumeOf": "This is the resume website of",

    // Timeline section editor
    "timelineSection.addEntry": "Add Entry",
    "timelineSection.date": "Date",
    "timelineSection.entryTitle": "Title",
    "timelineSection.entryTitleEn": "Title (EN)",
    "timelineSection.entryTitleDe": "Title (DE)",
    "timelineSection.description": "Description (optional)",
    "timelineSection.descriptionEn": "Description (EN)",
    "timelineSection.descriptionDe": "Description (DE)",
  },

  de: {
    // Nav
    "nav.edit": "Bearbeiten",
    "nav.done": "Fertig",
    "nav.label": "Navigationsbezeichnung",
    "nav.labelPlaceholder": "z.B. Über mich, Fähigkeiten…",

    // Builder chrome
    "builder.title": "Portfolio-Builder",
    "builder.livePreview": "Vorschau",

    // Common actions
    "common.save": "Speichern",
    "common.saving": "Wird gespeichert…",
    "common.cancel": "Abbrechen",
    "common.remove": "Entfernen",
    "common.uploading": "Wird hochgeladen…",
    "common.uploadIcon": "Symbol hochladen",
    "common.changeIcon": "Symbol ändern",
    "common.removeIcon": "Symbol entfernen",
    "common.uploadImage": "Bild hochladen",
    "common.changeImage": "Bild ändern",

    // Hero editor
    "hero.card": "Hero",
    "hero.firstName": "Vorname",
    "hero.lastName": "Nachname",
    "hero.occupationEn": "Beruf (EN)",
    "hero.occupationDe": "Beruf (DE)",
    "hero.summaryEn": "Zusammenfassung (EN)",
    "hero.summaryDe": "Zusammenfassung (DE)",
    "hero.profileImage": "Profilbild",
    "hero.links": "Links",
    "hero.addLink": "Link hinzufügen",
    "hero.noLinks": "Noch keine Links — klicke auf 'Link hinzufügen'.",

    // Sections panel
    "sections.heading": "Abschnitte",
    "sections.empty": "Noch keine Abschnitte — nutze den Button unten.",
    "sections.insert": "+ Einfügen",
    "sections.add": "+ Abschnitt hinzufügen",

    // Section type names
    "sectionType.timeline": "Zeitstrahl",
    "sectionType.text": "Text",
    "sectionType.image": "Bild",
    "sectionType.skills": "Fähigkeiten",
    "sectionType.insights": "Einblicke",
    "sectionType.github": "GitHub-Aktivität",

    // GitHub section editor
    "githubSection.tokenNote": "Beitragsdaten werden serverseitig über das Secret PORTFOLIO_GITHUB_PAT abgerufen — kein Token wird an Besucher weitergegeben.",
    "githubSection.showGraph": "Beitragsgraph anzeigen",

    // Generic section fields
    "section.title": "Titel",
    "section.titleEn": "Titel (EN)",
    "section.titleDe": "Titel (DE)",
    "section.subtext": "Untertext",
    "section.subtextEn": "Untertext (EN)",
    "section.subtextDe": "Untertext (DE)",
    "section.description": "Beschreibung",
    "section.descriptionEn": "Beschreibung (EN)",
    "section.descriptionDe": "Beschreibung (DE)",
    "section.icon": "Symbol",
    "section.moveUp": "Nach oben",
    "section.moveDown": "Nach unten",
    "section.remove": "Abschnitt entfernen",

    // Image section editor
    "imageSection.caption": "Bildunterschrift",
    "imageSection.captionEn": "Bildunterschrift (EN)",
    "imageSection.captionDe": "Bildunterschrift (DE)",
    "imageSection.addImage": "Bild hinzufügen",
    "imageSection.noImages": "Noch keine Bilder.",

    // Skills section editor
    "skillsSection.heading": "Gruppenüberschrift",
    "skillsSection.addGroup": "Gruppe hinzufügen",
    "skillsSection.addItem": "Fähigkeit hinzufügen",
    "skillsSection.noGroups": "Noch keine Gruppen.",
    "skillsSection.label": "Bezeichnung",

    // Insights section editor
    "insightsSection.addItem": "Einblick hinzufügen",
    "insightsSection.noItems": "Noch keine Einblicke.",
    "insightsSection.name": "Name",
    "insightsSection.nameEn": "Name (EN)",
    "insightsSection.nameDe": "Name (DE)",
    "insightsSection.shortDescription": "Kurzbeschreibung",
    "insightsSection.shortDescriptionEn": "Kurzbeschreibung (EN)",
    "insightsSection.shortDescriptionDe": "Kurzbeschreibung (DE)",
    "insightsSection.addBlock": "Block hinzufügen",
    "insightsSection.blockHeader": "Block-Überschrift",
    "insightsSection.blockHeaderEn": "Block-Überschrift (EN)",
    "insightsSection.blockHeaderDe": "Block-Überschrift (DE)",
    "insightsSection.blockDescription": "Block-Beschreibung",
    "insightsSection.blockDescriptionEn": "Block-Beschreibung (EN)",
    "insightsSection.blockDescriptionDe": "Block-Beschreibung (DE)",

    // Footer
    "footer.resumeOf": "Dies ist die Lebenslauf-Website von",

    // Timeline section editor
    "timelineSection.addEntry": "Eintrag hinzufügen",
    "timelineSection.date": "Datum",
    "timelineSection.entryTitle": "Titel",
    "timelineSection.entryTitleEn": "Titel (EN)",
    "timelineSection.entryTitleDe": "Titel (DE)",
    "timelineSection.description": "Beschreibung (optional)",
    "timelineSection.descriptionEn": "Beschreibung (EN)",
    "timelineSection.descriptionDe": "Beschreibung (DE)",
  },
};
