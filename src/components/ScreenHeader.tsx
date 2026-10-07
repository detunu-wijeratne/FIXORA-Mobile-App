import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export default function ScreenHeader({ title, subtitle, eyebrow }: Props) {
  return (
    <View style={styles.container}>
      {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.pageTitle,
  },
  subtitle: {
    ...typography.secondary,
    marginTop: spacing.sm,
  },
});
