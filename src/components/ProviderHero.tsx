import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme/provider";
import ProviderBackdrop from "./ProviderBackdrop";

type Props = { title: string; subtitle: string; eyebrow?: string; onBack?: () => void; children?: ReactNode };
export default function ProviderHero({ title, subtitle, eyebrow = "FIXORA PARTNER", onBack, children }: Props) {
  return (
    <View style={styles.hero}>
      <ProviderBackdrop />
      <View style={styles.topRow}>
        {onBack && <TouchableOpacity onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}><Ionicons name="chevron-back" size={22} color={colors.white} /></TouchableOpacity>}
        <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>F</Text></View><Text style={styles.eyebrow}>{eyebrow}</Text></View>
      </View>
      <View style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  hero: { minHeight: 290, borderRadius: 28, overflow: "hidden", backgroundColor: colors.primary, padding: spacing.xl, marginBottom: spacing.xl, justifyContent: "space-between" },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 9, flexShrink: 1 },
  mark: { width: 29, height: 29, borderRadius: 9, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  markText: { color: colors.primary, fontSize: 18, fontWeight: "900" },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, flexShrink: 1 },
  copy: { paddingTop: 48, maxWidth: 270 },
  title: { color: colors.white, fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -1 },
  subtitle: { color: "#E1E8EF", fontSize: 14, lineHeight: 21, marginTop: 10 },
});
