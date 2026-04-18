import { updateSettings } from "@/stores/settingsStore.js";
import {
  Button,
  Dropdown,
  Label,
  Kbd,
  Slider,
  Switch,
  Tabs,
} from "@heroui/react";

import { ChevronsUpDown } from "lucide-react";

const bgColor = "bg-default/60 dark:bg-default/30";

export const ItemWrapper = ({ title, children }) => {
  return (
    <div className="settings-group">
      <div className="text-xs text-muted font-medium ml-2.5 mb-1">{title}</div>
      <div className="rounded-xl overflow-hidden shadow-custom">{children}</div>
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
      <div className="flex items-center gap-2">
        {icon}
        <Slider
          aria-label="slider"
          className="w-full"
          value={[settingValue]}
          onChange={(value) => updateSettings({ [settingName]: value[0] })}
          maxValue={max}
          minValue={min}
          step={step}
        >
          <div className="text-sm text-foreground line-clamp-1">{label}</div>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
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
        isDisabled={disabled}
        onChange={(value) => updateSettings({ [settingName]: value })}
      >
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch>
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
        <Button variant="tertiary" size="sm">
          {options.find((opt) => opt.value === settingValue.toString())
            ?.label || settingValue}
          <ChevronsUpDown className="size-4 shrink-0 text-muted opacity-60" />
        </Button>

        <Dropdown.Popover>
          <Dropdown.Menu
            aria-label="Single selection"
            selectedKeys={new Set([settingValue.toString()])}
            selectionMode="single"
            onSelectionChange={(values) =>
              updateSettings({ [settingName]: values.currentKey })
            }
          >
            {options.map((option) => (
              <Dropdown.Item
                id={option.value.toString()}
                key={option.value}
                textValue={option.label}
              >
                <Dropdown.ItemIndicator />
                <Label>{option.label}</Label>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
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
        variant="primary"
        selectedKey={settingValue}
        onSelectionChange={(value) => {
          updateSettings({ [settingName]: value });
        }}
      >
        <Tabs.ListContainer>
          <Tabs.List
            aria-label={settingName}
            className="bg-default-100/90 backdrop-blur-md shadow-custom-inner p-px gap-0 rounded-small overflow-visible"
          >
            {options.map((option) => (
              <Tabs.Tab
                key={option.value}
                id={option.value}
                className="py-1 h-7"
              >
                <div className="flex items-center space-x-2">
                  {option.icon}
                  {option.label && <span>{option.label}</span>}
                </div>
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
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
      <Kbd>
        {kbdKey && <Kbd.Abbr keyValue={kbdKey} />}
        <Kbd.Content>{keyStr}</Kbd.Content>
      </Kbd>
    </div>
  );
}
