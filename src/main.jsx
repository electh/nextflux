import "./i18n";
import { initTheme } from "@/stores/themeStore";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "@/routes/index.jsx";
import { RouterProvider } from "react-router";
import SplashScreen from "@/components/SplashScreen";
import { Toaster } from "sonner";
import {
  Info,
  CircleCheck,
  TriangleAlert,
  CircleX,
  Loader2,
} from "lucide-react";

// 初始化主题
initTheme();

createRoot(document.getElementById("root")).render(
  <>
    <SplashScreen />
    <Toaster
      icons={{
        loading: <Loader2 className="size-4! animate-spin! text-accent!" />,
        success: <CircleCheck className="size-4! text-green-500" />,
        info: <Info className="size-4! text-blue-500" />,
        warning: <TriangleAlert className="size-4! text-yellow-500" />,
        error: <CircleX className="size-4! text-red-500" />,
      }}
      toastOptions={{
        classNames: {
          toast: "rounded-2xl! bg-overlay! shadow-custom-md! p-4! border-none!",
          title: "text-foreground!",
          description: "text-default!",
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
  </>,
);
