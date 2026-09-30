import { useTranslation } from "react-i18next";
import { NotFancyLogo } from "@/components/Settings/components/NotFancyLogo.jsx";
import { Heart } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <NotFancyLogo since={2025} />

      {/* Made with love section */}
      <div className="text-center text-muted-foreground px-3">
        Made with{" "}
        <span className="text-danger">
          <Heart className="size-3 fill-current inline-block" />
        </span>{" "}
        by{" "}
        <a
          href="https://github.com/electh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          electh
        </a>
      </div>

      {/* Acknowledgments section */}
      <div className="flex flex-col gap-2 items-center px-3 pb-3 text-muted-foreground">
        {t("about.acknowledgments")}
        <div className="flex flex-col gap-0.5 items-center justify-center text-sm">
          <a
            href="https://reederapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Reeder
          </a>
          <a
            href="https://www.heroui.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            HeroUI
          </a>
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            TailwindCSS
          </a>
          <a
            href="https://react-photo-view.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            React-photo-view
          </a>
          <a
            href="https://shiki.matsu.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Shiki
          </a>
          <a
            href="https://virtuoso.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Virtuoso
          </a>
        </div>
      </div>
    </div>
  );
}
