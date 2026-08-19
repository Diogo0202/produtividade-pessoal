import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING | string;

const MAPPING = {
  "house.fill": "home",
  checklist: "checklist",
  calendar: "calendar-today",
  target: "track-changes",
  plus: "add",
  circle: "radio-button-unchecked",
  checkmark: "check",
  "clock.fill": "schedule",
  sparkles: "auto-awesome",
  pencil: "edit",
  "chevron.right": "chevron-right",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  rain: "grain",
  wind: "air",
  bolt: "bolt",
  thermostat: "thermostat",
  fog: "foggy",
  sun: "wb-sunny",
  cloud: "cloud",
  location: "my-location",
  info: "info-outline",
  "arrow.up.right": "north-east",
  map: "map",
  radar: "radar",
  refresh: "refresh",
  water: "water-drop",
  gust: "air",
  warnings: "warning-amber",
  data: "analytics",
  shield: "verified-user",
  filter: "filter-list",
  history: "history",
  search: "search",
} as IconMapping;

export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name as keyof typeof MAPPING] ?? "help-outline"} style={style} />;
}
