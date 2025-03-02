import "./i18n";
import { initTheme } from "@/stores/themeStore";
import { environment } from "@/stores/environmentStore";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "@/routes/index.jsx";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { RouterProvider } from "react-router";
import SplashScreen from "@/components/SplashScreen";

try {
    const environmentRequest = await fetch('/environment.json');
    if (environmentRequest.ok) {
        environment.set(await environmentRequest.json());
    }
}
catch (error) {
    console.error('Cannot fetch environment configuration', error);
}

// 初始化主题
initTheme();

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <ToastProvider
      placement="bottom-center"
      toastOffset={20}
      toastProps={{ timeout: 3000 }}
    />
    <SplashScreen />
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
