import ProviderBackdrop from "./ProviderBackdrop";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/provider";
import ProviderIllustration, { ProviderIllustrationKind } from "./ProviderIllustration";

type Props = { title: string; subtitle?: string; eyebrow?: string; illustration?: ProviderIllustrationKind; badge?: ReactNode };
export default function ProviderPageHeader({ title, subtitle, eyebrow = "FIXORA PARTNER", illustration, badge }: Props) {
  const label = title.toLowerCase();
  const kind = illustration ?? (label.includes("earn") ? "earnings" : label.includes("schedul") || label.includes("availab") ? "schedule" : label.includes("service") || label.includes("pric") ? "services" : label.includes("request") ? "requests" : label.includes("profile") || label.includes("setting") || label.includes("review") ? "profile" : "jobs");
  return <View style={styles.header}><ProviderBackdrop variant="page" /><View style={styles.top}><View style={styles.copy}><Text style={styles.eyebrow}>{eyebrow === "FIXORA" ? "FIXORA PARTNER" : eyebrow}</Text><Text style={styles.title}>{title}</Text></View><ProviderIllustration kind={kind} size={94} /></View>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}{badge && <View style={styles.badge}>{badge}</View>}<View style={styles.line} /></View>;
}
const styles = StyleSheet.create({
  header: { backgroundColor: colors.primary, borderRadius: 24, padding: spacing.xl, marginBottom: spacing.xl, overflow: "hidden" },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.accent, letterSpacing: 1.5, fontSize: 10, fontWeight: "800", marginBottom: 12 },
  title: { color: colors.white, fontSize: 27, lineHeight: 34, letterSpacing: -0.6, fontWeight: "800" },
  subtitle: { color: "#E3EBF2", fontSize: 13, lineHeight: 21, marginTop: 10 },
  badge: { alignSelf: "flex-start", marginTop: 16 },
  line: { width: 35, height: 3, borderRadius: 2, backgroundColor: colors.accent, marginTop: 18 },
});
