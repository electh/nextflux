import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CloseButton({
  className,
  children,
  variant = "secondary",
  ...props
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant={variant}
      size="icon-xs"
      aria-label={t("common.close")}
      {...props}
      className={cn("rounded-full", className)}
    >
      {children ?? <X />}
    </Button>
  );
}
