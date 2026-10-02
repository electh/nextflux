import { updateSettings } from "@/stores/settingsStore.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Info } from "lucide-react";

const rowClass = "bg-secondary/60 dark:bg-secondary/30 min-h-12 px-2.5 py-2";
const keySymbols = {
  command: "⌘",
  cmd: "⌘",
  ctrl: "Ctrl",
  shift: "⇧",
  alt: "⌥",
  option: "⌥",
  enter: "↵",
  up: "↑",
  down: "↓",
  escape: "Esc",
};

function DescriptionTip({ description }) {
  if (!description) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        render={
          <Button variant="ghost" size="icon-xs" aria-label={description} />
        }
      >
        <Info />
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}

export function ItemWrapper({ title, children }) {
  return (
    <section className="settings-group">
      <h3 className="mb-1 ml-2.5 text-xs font-medium text-muted-foreground">
        {title}
      </h3>
      <div className="overflow-hidden rounded-xl shadow-custom">{children}</div>
    </section>
  );
}

export function SliderItem({
  label,
  icon,
  settingName,
  settingValue,
  max,
  min,
  step,
  description,
}) {
  return (
    <Field className={cn(rowClass, "gap-2")}>
      <div className="flex items-center gap-2">
        {icon}
        <FieldLabel id={settingName + "-label"}>{label}</FieldLabel>
        <DescriptionTip description={description} />
        <output
          className="ml-auto text-sm text-muted-foreground"
          aria-live="off"
        >
          {settingValue}
        </output>
      </div>
      <Slider
        aria-labelledby={settingName + "-label"}
        value={[settingValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={(value) =>
          updateSettings({
            [settingName]: Array.isArray(value) ? value[0] : value,
          })
        }
      />
    </Field>
  );
}

export function SwitchItem({
  label,
  icon,
  settingName,
  settingValue,
  disabled = false,
  description,
}) {
  return (
    <Field orientation="horizontal" className={rowClass} disabled={disabled}>
      <div className="flex flex-1 items-center gap-2">
        {icon}
        <FieldLabel htmlFor={settingName}>{label}</FieldLabel>
        <DescriptionTip description={description} />
      </div>
      <Switch
        id={settingName}
        aria-label={label}
        checked={settingValue}
        disabled={disabled}
        onCheckedChange={(checked) =>
          updateSettings({ [settingName]: checked })
        }
      />
    </Field>
  );
}

export function SelItem({
  label,
  icon,
  settingName,
  settingValue,
  options,
  description,
  onValueChange = (value) => updateSettings({ [settingName]: value }),
}) {
  return (
    <Field orientation="horizontal" className={rowClass}>
      <div className="flex flex-1 items-center gap-2">
        {icon}
        <FieldTitle variant="setting" id={settingName + "-label"}>
          {label}
        </FieldTitle>
        <DescriptionTip description={description} />
      </div>
      <Select
        items={options.map((option) => ({
          value: String(option.value),
          label: option.label,
        }))}
        value={String(settingValue)}
        onValueChange={(value) => value !== null && onValueChange(value)}
      >
        <SelectTrigger size="sm" aria-labelledby={settingName + "-label"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent variant="glass">
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

export function GroupItem({
  label,
  icon,
  settingName,
  settingValue,
  options,
  description,
}) {
  return (
    <Field orientation="horizontal" className={rowClass}>
      <div className="flex flex-1 items-center gap-2">
        {icon}
        <FieldTitle variant="setting" id={settingName + "-label"}>
          {label}
        </FieldTitle>
        <DescriptionTip description={description} />
      </div>
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        value={[settingValue]}
        aria-labelledby={settingName + "-label"}
        onValueChange={(values) => {
          if (values.length) updateSettings({ [settingName]: values[0] });
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label || String(option.value)}
          >
            {option.icon}
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}

export function KeyboardItem({ desc, kbdKey, keyStr }) {
  return (
    <div className={cn(rowClass, "flex items-center justify-between gap-2")}>
      <span className="text-sm">{desc}</span>
      <Kbd>
        {[...(kbdKey || []).map((key) => keySymbols[key] || key), keyStr].join(
          " + ",
        )}
      </Kbd>
    </div>
  );
}
