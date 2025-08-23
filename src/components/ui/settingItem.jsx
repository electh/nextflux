import { updateSettings } from "@/stores/settingsStore.js";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Kbd,
  Slider,
  Switch,
  Tab,
  Tabs,
} from "@heroui/react";

import { ChevronsUpDown } from "lucide-react";

const bgColor = "bg-content1/80 dark:bg-content2/30";

export const ItemWrapper = ({ title, children }) => {
  return (
    <div className="settings-group">
      <div className="text-xs text-default-500 font-medium ml-2.5 mb-1">
        {title}
      </div>
      <div className="rounded-xl overflow-hidden border shadow-xs">
        {children}
      </div>
    </div>
  );
};

export const SliderItem = ({
  label,
  icon,
  settingName,
  settingValue,
  max,
  min,
  step,
}) => {
  return (
    <div className={`grid gap-2 ${bgColor} p-2.5`}>
  <div className="text-xs text-foreground/90">{label}</div>
      <div className="flex items-center gap-2">
        {icon}
        <Slider
          aria-label={label}
          value={[settingValue]}
          onChange={(value) => updateSettings({ [settingName]: value[0] })}
          maxValue={max}
          minValue={min}
          showSteps
          step={step}
          classNames={{
            trackWrapper: "rounded-full shadow-custom-inner bg-default-200/30",
            track:
              "h-6 my-0 border-s-primary/20! border-e-transparent! bg-transparent",
            filler:
              "bg-primary/20 after:absolute after:-right-3 after:h-6 after:w-3 after:bg-primary/20 after:rounded-r-full",
            step: "data-[in-range=true]:bg-primary data-[in-range=true]:shadow-md shadow-primary",
          }}
          renderThumb={(props) => (
            <div
              {...props}
              className="group h-5 w-5 top-1/2 bg-default-50 shadow-custom-sm rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
            ></div>
          )}
        />
        <Chip
          size="sm"
          variant="flat"
          classNames={{
            base: "shadow-custom-inner",
            content: "w-10 justify-center text-center",
          }}
        >
          {settingValue}
        </Chip>
      </div>
    </div>
  );
};

export const SwitchItem = ({
  label,
  icon,
  settingName,
  settingValue,
  disabled = false,
}) => {
  return (
    <div
      className={`flex justify-between items-center gap-2 ${bgColor} px-2.5 py-3`}
    >
      <div className="flex items-center gap-2">
        {icon}
  <div className="text-sm text-foreground line-clamp-1">{label}</div>
      </div>
      <Switch
        isSelected={settingValue}
        classNames={{
          wrapper: "shadow-custom-inner h-6 w-11 px-0.5 overflow-visible",
          thumb: "absolute w-5 h-5 shadow-md",
        }}
        isDisabled={disabled}
        onValueChange={(value) => updateSettings({ [settingName]: value })}
      />
    </div>
  );
};

export function SelItem({ label, icon, settingName, settingValue, options }) {
  return (
    <div className={`flex justify-between items-center gap-2 ${bgColor} p-2.5`}>
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm text-foreground line-clamp-1">{label}</div>
      </div>
      <Dropdown>
        <DropdownTrigger>
          <Button
            className="capitalize gap-1 pr-1.5 h-7 rounded-md bg-content1 dark:bg-content3 text-foreground shadow-custom-cursor!"
            variant="solid"
            size="sm"
            endContent={
              <ChevronsUpDown className="size-4 shrink-0 text-default-400" />
            }
          >
            {options.find((opt) => opt.value === settingValue.toString())
              ?.label || settingValue}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label="Single selection example"
          selectedKeys={new Set([settingValue])}
          selectionMode="single"
          variant="flat"
          onSelectionChange={(values) =>
            updateSettings({ [settingName]: values.currentKey })
          }
        >
          {options.map((option) => (
            <DropdownItem key={option.value} style={option.style}>
              {option.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

export function GroupItem({ label, icon, settingName, settingValue, options }) {
  return (
    <div
      className={`flex justify-between items-center gap-2 ${bgColor} px-2.5 h-12`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm text-foreground">{label}</div>
      </div>
      <Tabs
        aria-label={settingName}
        size="sm"
        variant="solid"
        classNames={{
          tabList:
            "bg-default-100/90 dark:bg-content2/90 backdrop-blur-md shadow-custom-inner p-px gap-0 rounded-small overflow-visible",
          tab: "py-1 h-7",
          // Light cursor for better contrast on near-black
          cursor: "bg-default-200 shadow-custom-cursor! rounded-small",
        }}
        selectedKey={settingValue}
        onSelectionChange={(value) => {
          updateSettings({ [settingName]: value });
        }}
      >
        {options.map((option) => (
          <Tab
            key={option.value}
            title={
              <div className="flex items-center space-x-2">
                {option.icon}
                {option.label && <span>{option.label}</span>}
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
}

export function KeyboardItem({ desc, kbdKey, keyStr }) {
  return (
    <div
      className={`flex justify-between items-center gap-2 ${bgColor} px-2.5 py-3`}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm text-foreground">{desc}</div>
      </div>
      <Kbd
        classNames={{
          base: "min-w-8 shadow-custom!",
          abbr: "text-xs text-default-400",
          content: "w-full text-xs text-default-400",
        }}
        keys={kbdKey}
      >
        {keyStr}
      </Kbd>
    </div>
  );
}
