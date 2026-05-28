export type UILang = "en" | "de";

export const translations: Record<UILang, Record<string, string>> = {
  en: {
    // Nav
    "nav.edit": "Edit",
    "nav.done": "Done",

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

    // Generic section fields
    "section.title": "Title",
    "section.subtext": "Subtext",
    "section.description": "Description",
    "section.icon": "Icon",
    "section.moveUp": "Move up",
    "section.moveDown": "Move down",
    "section.remove": "Remove section",

    // Image section editor
    "imageSection.caption": "Caption",
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
    "insightsSection.shortDescription": "Short description",
    "insightsSection.addBlock": "Add Block",
    "insightsSection.blockHeader": "Block header",
    "insightsSection.blockDescription": "Block description",

    // Timeline section editor
    "timelineSection.addEntry": "Add Entry",
    "timelineSection.date": "Date",
    "timelineSection.entryTitle": "Title",
    "timelineSection.description": "Description (optional)",
  },

  de: {
    // Nav
    "nav.edit": "Bearbeiten",
    "nav.done": "Fertig",

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

    // Generic section fields
    "section.title": "Titel",
    "section.subtext": "Untertext",
    "section.description": "Beschreibung",
    "section.icon": "Symbol",
    "section.moveUp": "Nach oben",
    "section.moveDown": "Nach unten",
    "section.remove": "Abschnitt entfernen",

    // Image section editor
    "imageSection.caption": "Bildunterschrift",
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
    "insightsSection.shortDescription": "Kurzbeschreibung",
    "insightsSection.addBlock": "Block hinzufügen",
    "insightsSection.blockHeader": "Block-Überschrift",
    "insightsSection.blockDescription": "Block-Beschreibung",

    // Timeline section editor
    "timelineSection.addEntry": "Eintrag hinzufügen",
    "timelineSection.date": "Datum",
    "timelineSection.entryTitle": "Titel",
    "timelineSection.description": "Beschreibung (optional)",
  },
};
