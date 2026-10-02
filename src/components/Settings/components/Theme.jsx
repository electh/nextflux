import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { useStore } from "@nanostores/react";
import { MoonStar, Paintbrush, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ItemWrapper } from "@/components/ui/settingItem";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SettingIcon from "@/components/ui/SettingIcon";
import { setTheme, themeState, themes } from "@/stores/themeStore";

// Miniature reader palettes mirror the surfaces of each theme in index.css.
const previewPalettes = {
  light: {
    background: "#ffffff",
    sidebar: "#efefef",
    text: "#171717",
    muted: "#d4d4d4",
    accent: "oklch(0.488 0.243 264.376)",
  },
  stone: {
    background: "rgb(244, 241, 236)",
    sidebar: "rgb(227, 224, 219)",
    text: "rgb(66, 64, 59)",
    muted: "rgb(220, 217, 213)",
    accent: "rgb(216, 94.007, 74.996)",
  },
  dark: {
    background: "oklch(0.205 0 0)",
    sidebar: "oklch(0.145 0 0)",
    text: "#fafafa",
    muted: "oklch(0.269 0 0)",
    accent: "oklch(0.623 0.214 259.815)",
  },
  "nord-dark": {
    background: "rgb(46, 52, 64)",
    sidebar: "rgb(36, 41, 51)",
    text: "#fafafa",
    muted: "rgb(59, 66, 82)",
    accent: "rgb(135, 192, 208)",
  },
};

function ThemePreview({ themeId, split = false }) {
  const palette = previewPalettes[themeId];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 128 80"
      className="block size-full h-auto"
      style={split ? { clipPath: "inset(0 50% 0 0)" } : undefined}
    >
      <rect width="128" height="80" rx="8" fill={palette.sidebar} />
      <rect
        x="5"
        y="5"
        width="118"
        height="70"
        rx="5"
        fill={palette.background}
      />
      <path
        d="M34 5H10a5 5 0 0 0-5 5v60a5 5 0 0 0 5 5h24Z"
        fill={palette.sidebar}
      />
      <circle cx="15" cy="15" r="3" fill={palette.accent} />
      <rect x="11" y="25" width="17" height="3" rx="1.5" fill={palette.muted} />
      <rect x="9" y="33" width="21" height="7" rx="2" fill={palette.muted} />
      <rect x="11" y="45" width="14" height="3" rx="1.5" fill={palette.muted} />
      <rect x="44" y="16" width="54" height="4" rx="2" fill={palette.text} />
      <rect x="44" y="26" width="66" height="3" rx="1.5" fill={palette.muted} />
      <rect x="44" y="33" width="48" height="3" rx="1.5" fill={palette.muted} />
      <rect x="44" y="43" width="68" height="15" rx="3" fill={palette.muted} />
      <rect x="44" y="64" width="37" height="3" rx="1.5" fill={palette.muted} />
      <rect
        x="94"
        y="63"
        width="18"
        height="5"
        rx="2.5"
        fill={palette.accent}
      />
    </svg>
  );
}

function PreviewOptions({ label, icon, options, value, onChange }) {
  return (
    <div className="theme-options flex flex-col gap-2 bg-secondary/60 dark:bg-secondary/30 p-2.5">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <ToggleGroup
        aria-label={label}
        value={[value]}
        onValueChange={(values) => values.length > 0 && onChange(values[0])}
        className="w-full items-stretch"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            aria-label={option.name}
            className="theme-option flex h-auto min-w-0 flex-1 flex-col gap-1.5 p-1.5"
          >
            <span className="theme-option-preview relative block w-full overflow-hidden rounded-xl">
              <span className="relative block w-full">
                <ThemePreview
                  themeId={option.preview}
                  split={Boolean(option.secondPreview)}
                />
                {option.secondPreview && (
                  <span className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
                    <ThemePreview themeId={option.secondPreview} />
                  </span>
                )}
              </span>
            </span>
            <span className="theme-option-label text-xs leading-5">
              {option.name}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function ThemeSwatch({ theme }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <circle cx="8" cy="8" r="7.5" fill={theme.color} />
      <path
        d="M 2.697 13.303 A 7.5 7.5 0 0 0 13.303 2.697 Z"
        fill={theme.accent}
      />
      <circle cx="8" cy="8" r="7.5" fill="none" stroke="var(--border)" />
    </svg>
  );
}

function ThemeSelect({ mode, value, themeMode, label, icon }) {
  const { t } = useTranslation();
  const options = themes[mode].map((theme) => ({
    ...theme,
    value: theme.id,
    label: t(`settings.appearance.themes.${theme.id}`, {
      defaultValue: theme.name,
    }),
  }));
  return (
    <div className="flex justify-between items-center gap-2 bg-secondary/60 dark:bg-secondary/30 px-2.5 py-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <Select
        items={options}
        value={value}
        onValueChange={(id) => {
          if (id === null) return;
          themeState.set({ ...themeState.get(), [`${mode}Theme`]: id });
          setTheme(themeMode);
        }}
      >
        <SelectTrigger size="sm" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((theme) => (
              <SelectItem key={theme.id} value={theme.id}>
                <ThemeSwatch theme={theme} />
                {theme.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Theme() {
  const { t } = useTranslation();
  const { themeMode, lightTheme, darkTheme } = useStore(themeState);
  return (
    <ItemWrapper title={t("settings.appearance.theme")}>
      <PreviewOptions
        label={t("settings.appearance.mode")}
        icon={
          <SettingIcon variant="blue">
            <Paintbrush />
          </SettingIcon>
        }
        value={themeMode}
        onChange={(mode) => setTheme(mode)}
        options={[
          {
            id: "system",
            name: t("settings.appearance.system"),
            preview: lightTheme,
            secondPreview: darkTheme,
          },
          {
            id: "light",
            name: t("settings.appearance.light"),
            preview: lightTheme,
          },
          {
            id: "dark",
            name: t("settings.appearance.dark"),
            preview: darkTheme,
          },
        ]}
      />
      <Separator />
      <ThemeSelect
        mode="light"
        value={lightTheme}
        themeMode={themeMode}
        label={t("settings.appearance.lightTheme")}
        icon={
          <SettingIcon variant="amber">
            <Sun />
          </SettingIcon>
        }
      />
      <Separator />
      <ThemeSelect
        mode="dark"
        value={darkTheme}
        themeMode={themeMode}
        label={t("settings.appearance.darkTheme")}
        icon={
          <SettingIcon variant="purple">
            <MoonStar />
          </SettingIcon>
        }
      />
    </ItemWrapper>
  );
}
