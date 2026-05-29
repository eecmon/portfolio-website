import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/i18n";
import type { NavLabelFields as NavLabelValues } from "@/lib/navLabel";

interface NavLabelFieldsProps {
  values: NavLabelValues;
  onUpdate: (patch: Partial<NavLabelValues>) => void;
  lang: string;
  showEn: boolean;
  showDe: boolean;
  idPrefix?: string;
}

export function NavLabelFields({
  values,
  onUpdate,
  lang,
  showEn,
  showDe,
  idPrefix = "nav",
}: NavLabelFieldsProps) {
  const multilanguage = showEn && showDe;

  if (multilanguage) {
    return (
      <div className="flex flex-col gap-3">
        {showEn && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-nav-en`}>{t(lang, "nav.labelEn")}</Label>
            <Input
              id={`${idPrefix}-nav-en`}
              value={values.navLabel_en ?? ""}
              onChange={(e) => onUpdate({ navLabel_en: e.target.value })}
              placeholder={t(lang, "nav.labelPlaceholderEn")}
            />
          </div>
        )}
        {showDe && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-nav-de`}>{t(lang, "nav.labelDe")}</Label>
            <Input
              id={`${idPrefix}-nav-de`}
              value={values.navLabel_de ?? ""}
              onChange={(e) => onUpdate({ navLabel_de: e.target.value })}
              placeholder={t(lang, "nav.labelPlaceholderDe")}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-nav`}>{t(lang, "nav.label")}</Label>
      <Input
        id={`${idPrefix}-nav`}
        value={values.navLabel ?? ""}
        onChange={(e) => onUpdate({ navLabel: e.target.value })}
        placeholder={t(lang, "nav.labelPlaceholder")}
      />
    </div>
  );
}
