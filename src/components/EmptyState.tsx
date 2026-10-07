import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
};

export default function EmptyState({
  icon = "file-tray-outline",
  title,
  description,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.cardTitle,
    textAlign: "center",
  },
  description: {
    ...typography.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
