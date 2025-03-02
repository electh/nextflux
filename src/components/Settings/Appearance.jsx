import { settingsState } from "@/stores/settingsStore";
import { Divider } from "@heroui/react";
import { useStore } from "@nanostores/react";
import {
  ItemWrapper,
  SelItem,
  SwitchItem,
} from "@/components/ui/settingItem.jsx";
import {
  CandyOff,
  Circle,
  CircleDashed,
  Clock,
  LayoutList,
  ListEnd,
  Rss,
  Square,
  Text,
  MonitorCog,
} from "lucide-react";
import Theme from "./components/Theme";
import { useTranslation } from "react-i18next";
import SettingIcon from "@/components/ui/SettingIcon";

export default function Appearance() {
  const {
    feedIconShape,
    useGrayIcon,
    cardImageSize,
    showFavicon,
    showTextPreview,
    showReadingTime,
    truncateTitles,
    reduceMotion,
    interfaceFontSize,
  } = useStore(settingsState);
  const { t } = useTranslation();
  return (
    <>
      <Theme />
      <ItemWrapper title={t("settings.appearance.display")}>
        <SelItem
          label={t("settings.appearance.interfaceDisplay")}
          icon={
            <SettingIcon variant="green">
              <MonitorCog />
            </SettingIcon>
          }
          settingName="interfaceFontSize"
          settingValue={interfaceFontSize}
          options={[
            { value: "14", label: t("settings.appearance.moreSpace") },
            { value: "16", label: t("settings.appearance.normal") },
            { value: "18", label: t("settings.appearance.LargerText") },
          ]}
        />
      </ItemWrapper>
      <ItemWrapper title={t("settings.appearance.favicons")}>
        <SelItem
          label={t("settings.appearance.shape")}
          icon={
            <SettingIcon variant="blue">
              {feedIconShape === "circle" ? <Circle /> : <Square />}
            </SettingIcon>
          }
          settingName="feedIconShape"
          settingValue={feedIconShape}
          options={[
            { value: "circle", label: t("settings.appearance.circle") },
            { value: "square", label: t("settings.appearance.square") },
          ]}
        />
        <Divider />
        <SwitchItem
          label={t("settings.appearance.grayscale")}
          icon={
            <SettingIcon variant="default">
              <CircleDashed />
            </SettingIcon>
          }
          settingName="useGrayIcon"
          settingValue={useGrayIcon}
        />
      </ItemWrapper>
      <ItemWrapper title={t("settings.appearance.articleList")}>
        <SelItem
          label={t("settings.appearance.imagePreviews")}
          icon={
            <SettingIcon variant="green">
              <LayoutList />
            </SettingIcon>
          }
          settingName="cardImageSize"
          settingValue={cardImageSize}
          options={[
            { value: "none", label: t("settings.appearance.none") },
            { value: "small", label: t("settings.appearance.small") },
            { value: "large", label: t("settings.appearance.large") },
          ]}
        />
        <Divider />
        <SwitchItem
          label={t("settings.appearance.showFavicon")}
          icon={
            <SettingIcon variant="green">
              <Rss />
            </SettingIcon>
          }
          settingName="showFavicon"
          settingValue={showFavicon}
        />
        <Divider />
        <SwitchItem
          label={t("settings.appearance.showTextPreview")}
          icon={
            <SettingIcon variant="green">
              <Text />
            </SettingIcon>
          }
          settingName="showTextPreview"
          settingValue={showTextPreview}
        />
        <Divider />
        <SwitchItem
          label={t("settings.appearance.showReadingTime")}
          icon={
            <SettingIcon variant="green">
              <Clock />
            </SettingIcon>
          }
          settingName="showReadingTime"
          settingValue={showReadingTime}
        />
        <Divider />
        <SwitchItem
          label={t("settings.appearance.truncateTitles")}
          icon={
            <SettingIcon variant="green">
              <ListEnd />
            </SettingIcon>
          }
          settingName="truncateTitles"
          settingValue={truncateTitles}
        />
      </ItemWrapper>

      <ItemWrapper title={t("settings.appearance.motion")}>
        <SwitchItem
          label={t("settings.appearance.reduceMotion")}
          icon={
            <SettingIcon variant="cyan">
              <CandyOff />
            </SettingIcon>
          }
          settingName="reduceMotion"
          settingValue={reduceMotion}
        />
      </ItemWrapper>
    </>
  );
}
