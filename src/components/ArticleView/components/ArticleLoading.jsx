import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

export default function ArticleLoading() {
  const { t } = useTranslation();
  return (
    <div
      className="flex w-full min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground"
      role="status"
    >
      <Spinner aria-hidden="true" />
      {t("common.loading")}
    </div>
  );
}
