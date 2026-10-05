import { useTranslation } from "react-i18next";

export default function MediaPlaceholder({ style }) {
  const { t } = useTranslation();
  return (
    <div
      className="bg-secondary w-full"
      style={style}
      role="status"
      aria-label={t("common.loading")}
    />
  );
}
