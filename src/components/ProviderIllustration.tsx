import { Image } from "expo-image";
import { View } from "react-native";

export type ProviderIllustrationKind = "home" | "jobs" | "requests" | "schedule" | "earnings" | "profile" | "services";
const cells: Record<Exclude<ProviderIllustrationKind, "home">, [number, number]> = { jobs: [0, 0], requests: [1, 0], schedule: [2, 0], earnings: [0, 1], profile: [1, 1], services: [2, 1] };
export default function ProviderIllustration({ kind, size = 64 }: { kind: ProviderIllustrationKind; size?: number }) {
  if (kind === "home") return <Image source={require("../../assets/images/provider-home-icon.png")} contentFit="contain" style={{ width: size, height: size, flexShrink: 0 }} accessible={false} />;
  const [column, row] = cells[kind];
  const cell = size * 1.1;
  const inset = (cell - size) / 2;
  return <View pointerEvents="none" style={{ width: size, height: size, overflow: "hidden", flexShrink: 0 }} accessible={false}><Image source={require("../../assets/images/provider-illustrations.png")} contentFit="fill" style={{ position: "absolute", width: cell * 3, height: cell * 2, left: -column * cell - inset, top: -row * cell - inset }} accessible={false} /></View>;
}
