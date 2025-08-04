type Props = {
  label?: string;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  color?: "blue" | "gray";
};

import Switch from "../switch/Switch";

export default function ToggleSwitchControlado({ label = "", enabled, setEnabled, color }: Props) {
  return (
    <div>
      <Switch
        label={label}
        defaultChecked={enabled}
        onChange={(checked: boolean) => setEnabled(checked)}
        color={color}
      />
    </div>
  );
}
