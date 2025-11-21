import "./i18n";
import { initTheme } from "@/stores/themeStore";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "@/routes/index.jsx";
import { HeroUIProvider, Spinner } from "@heroui/react";
import { RouterProvider } from "react-router";
import SplashScreen from "@/components/SplashScreen";
import { Toaster } from "sonner";

// 初始化主题
initTheme();

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <SplashScreen />
    <Toaster
      theme="system"
      icons={{
        loading: (
          <div className="flex">
            <Spinner variant="simple" classNames={{ wrapper: "size-4" }} />
          </div>
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "rounded-lg! bg-content2! shadow-custom! p-4!",
        },
      }}
    />
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
      }}
    />
  </HeroUIProvider>,
);
