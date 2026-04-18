import { cn } from "@/lib/utils";

export default function SettingIcon({ variant = "default", children }) {
  const colorVariants = {
    default: "bg-gray-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    red: "bg-red-500",
    pink: "bg-pink-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
    cyan: "bg-cyan-500",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 size-6 rounded-[6px]",
        colorVariants[variant],
      )}
    >
      <div className="flex items-center justify-center shrink-0 size-4 text-accent-foreground">
        {children}
      </div>
    </div>
  );
}
