import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPanel } from "@/components/customComponents/Builder/SettingsPanel";
import type { Settings } from "@/api/settingsApi";

const defaultSettings: Settings = {
  theme: "modern-1",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  textColor: "#111827",
  multilanguage: false,
  defaultLanguage: "en",
};

describe("SettingsPanel", () => {
  it("renders the theme field", () => {
    render(<SettingsPanel settings={defaultSettings} onChange={vi.fn()} />);
    // Theme is a Select rendered as a combobox button with id="theme"
    expect(screen.getByRole("combobox", { name: /theme/i })).toBeInTheDocument();
  });

  it("renders all three color inputs", () => {
    render(<SettingsPanel settings={defaultSettings} onChange={vi.fn()} />);
    // Two <label for="primaryColor"> exist (shadcn Label + swatch wrapper),
    // so constrain to input elements only.
    expect(
      screen.getByLabelText(/primary/i, { selector: "input[type='color']" })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/secondary/i, { selector: "input[type='color']" })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/text/i, { selector: "input[type='color']" })
    ).toBeInTheDocument();
  });

  it("renders the multilanguage switch", () => {
    render(<SettingsPanel settings={defaultSettings} onChange={vi.fn()} />);
    // @base-ui Switch renders role="switch" (the visual element) and a hidden
    // checkbox with the same id — query by role to avoid ambiguity.
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("calls onChange with updated primaryColor when color input changes", () => {
    const onChange = vi.fn();
    render(<SettingsPanel settings={defaultSettings} onChange={onChange} />);
    const input = screen.getByLabelText(/primary/i, {
      selector: "input[type='color']",
    });
    // fireEvent is more reliable than userEvent for type="color"
    fireEvent.change(input, { target: { value: "#ff0000" } });
    expect(onChange).toHaveBeenCalledWith({ primaryColor: "#ff0000" });
  });

  it("calls onChange when multilanguage switch is toggled", async () => {
    const onChange = vi.fn();
    render(<SettingsPanel settings={defaultSettings} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith({ multilanguage: true });
  });

  it("shows hint text reflecting current multilanguage state", () => {
    render(<SettingsPanel settings={defaultSettings} onChange={vi.fn()} />);
    expect(screen.getByText(/only en fields visible/i)).toBeInTheDocument();
  });
});
