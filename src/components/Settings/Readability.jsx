import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect, Fragment } from "react";
import { settingsState } from "@/stores/settingsStore";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignStartVertical,
  CaseSensitive,
  ListOrdered,
  ListTree,
  SquareCode,
  Type,
  UnfoldHorizontal,
  UnfoldVertical,
} from "lucide-react";
import { useStore } from "@nanostores/react";
import {
  GroupItem,
  ItemWrapper,
  SliderItem,
  SwitchItem,
} from "@/components/ui/settingItem.jsx";
import { resetSettings } from "@/stores/settingsStore.js";
import { useTranslation } from "react-i18next";
import SettingIcon from "@/components/ui/SettingIcon";
import { loadFonts, FONT_CATEGORIES, SYSTEM_FONTS } from "@/lib/fontLoader";
import { updateSettings } from "@/stores/settingsStore.js";

// 字体选择器组件
function FontSelector({ label, icon, settingName, settingValue }) {
  // 打开时预加载所有字体
  useEffect(() => {
    const allFonts = Object.values(FONT_CATEGORIES).flatMap((cat) =>
      cat.fonts.map((f) => f.value),
    );
    loadFonts(allFonts).catch(() => {});
  }, []);

  // 获取当前选中字体的名称
  const getSelectedFontName = () => {
    // 检查系统字体
    const sysFont = SYSTEM_FONTS.find((f) => f.value === settingValue);
    if (sysFont) return sysFont.name;

    // 检查自定义字体
    for (const category of Object.values(FONT_CATEGORIES)) {
      const font = category.fonts.find((f) => f.value === settingValue);
      if (font) return font.name;
    }
    return settingValue;
  };

  // 获取当前选中字体的预览文字
  const getSelectedFontPreview = () => {
    // 检查系统字体
    const sysFont = SYSTEM_FONTS.find((f) => f.value === settingValue);
    if (sysFont) return sysFont.preview;

    // 检查自定义字体
    for (const category of Object.values(FONT_CATEGORIES)) {
      const font = category.fonts.find((f) => f.value === settingValue);
      if (font) return font.preview;
    }
    return "Aa";
  };
  const handleSelectionChange = (keys) => {
    const value = keys;
    if (value) {
      updateSettings({
        [settingName]: value,
      });
    }
  };
  return (
    <div className="flex justify-between items-center gap-2 bg-secondary/60 dark:bg-secondary/30 px-2.5 py-2">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm text-foreground">{label}</div>
      </div>
      <Select value={settingValue} onValueChange={handleSelectionChange}>
        <SelectTrigger size="sm" aria-label={label} className="min-w-[100px]">
          <SelectValue>{getSelectedFontName()}</SelectValue>
          <span
            className="text-muted-foreground"
            style={{ fontFamily: `${settingValue}, system-ui, sans-serif` }}
          >
            {getSelectedFontPreview()}
          </span>
        </SelectTrigger>
        <SelectContent
          variant="glass"
          className="max-h-[300px]"
          alignItemWithTrigger={false}
        >
          <SelectGroup>
            <SelectLabel>System</SelectLabel>
            {SYSTEM_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          {Object.entries(FONT_CATEGORIES).map(
            ([categoryKey, category], index) => (
              <Fragment key={categoryKey}>
                <SelectGroup>
                  <SelectLabel>{category.label}</SelectLabel>
                  {category.fonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span
                        style={{
                          fontFamily: `${font.value}, system-ui, sans-serif`,
                        }}
                      >
                        {font.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
                {index < Object.keys(FONT_CATEGORIES).length - 1 && (
                  <SelectSeparator />
                )}
              </Fragment>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
export default function Readability() {
  const {
    lineHeight,
    fontSize,
    maxWidth,
    alignJustify,
    fontFamily,
    titleFontSize,
    titleAlignType,
    showLineNumbers,
    forceDarkCodeTheme,
    showReadingRail,
  } = useStore(settingsState);
  const { t } = useTranslation();
  return (
    <>
      <ItemWrapper title={t("settings.readability.articleTitle")}>
        <GroupItem
          label={t("settings.readability.titleAlign")}
          icon={
            <SettingIcon variant="green">
              <AlignStartVertical />
            </SettingIcon>
          }
          settingName="titleAlignType"
          settingValue={titleAlignType}
          options={[
            {
              value: "left",
              icon: <AlignLeft className="size-4" />,
            },
            {
              value: "center",
              icon: <AlignCenter className="size-4" />,
            },
          ]}
        />
        <Separator />
        <SliderItem
          label={t("settings.readability.titleFontSize")}
          icon={
            <SettingIcon variant="purple">
              <CaseSensitive />
            </SettingIcon>
          }
          settingName="titleFontSize"
          settingValue={titleFontSize}
          max={3.0}
          min={1.0}
          step={0.2}
        />
      </ItemWrapper>
      <ItemWrapper title={t("settings.readability.text")}>
        <FontSelector
          label={t("settings.readability.font")}
          icon={
            <SettingIcon variant="blue">
              <Type />
            </SettingIcon>
          }
          settingName="fontFamily"
          settingValue={fontFamily}
        />
        <Separator />
        <SwitchItem
          label={t("settings.readability.textAlignJustify")}
          icon={
            <SettingIcon variant="green">
              <AlignJustify />
            </SettingIcon>
          }
          settingName="alignJustify"
          settingValue={alignJustify}
        />
        <Separator />
        <SliderItem
          label={t("settings.readability.lineHeight")}
          icon={
            <SettingIcon variant="purple">
              <UnfoldVertical />
            </SettingIcon>
          }
          settingName="lineHeight"
          settingValue={lineHeight}
          max={2.5}
          min={1.2}
          step={0.1}
        />
        <Separator />
        <SliderItem
          label={t("settings.readability.fontSize")}
          icon={
            <SettingIcon variant="purple">
              <CaseSensitive />
            </SettingIcon>
          }
          settingName="fontSize"
          settingValue={fontSize}
          max={24}
          min={14}
          step={2}
        />
        <Separator />
        <SliderItem
          label={t("settings.readability.maxWidth")}
          icon={
            <SettingIcon variant="purple">
              <UnfoldHorizontal />
            </SettingIcon>
          }
          settingName="maxWidth"
          settingValue={maxWidth}
          max={80}
          min={50}
          step={5}
        />
      </ItemWrapper>
      <ItemWrapper title={t("settings.readability.readingNavigation")}>
        <SwitchItem
          label={t("settings.readability.showReadingRail")}
          icon={
            <SettingIcon variant="green">
              <ListTree />
            </SettingIcon>
          }
          settingName="showReadingRail"
          settingValue={showReadingRail}
        />
      </ItemWrapper>
      <ItemWrapper title={t("settings.appearance.codeBlock")}>
        <SwitchItem
          label={t("settings.appearance.showLineNumbers")}
          icon={
            <SettingIcon variant="default">
              <ListOrdered />
            </SettingIcon>
          }
          settingName="showLineNumbers"
          settingValue={showLineNumbers}
        />
        <Separator />
        <SwitchItem
          label={t("settings.appearance.forceDarkCodeTheme")}
          icon={
            <SettingIcon variant="default">
              <SquareCode />
            </SettingIcon>
          }
          settingName="forceDarkCodeTheme"
          settingValue={forceDarkCodeTheme}
        />
      </ItemWrapper>
      <Button
        variant="destructive"
        onClick={resetSettings}
        className={cn("w-full", "shrink-0")}
      >
        {t("settings.readability.reset")}
      </Button>
    </>
  );
}
