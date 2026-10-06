import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

type Props = {
  label?: string;
};

export default function LoadingState({ label = "Loading..." }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  label: {
    ...typography.secondary,
    marginTop: spacing.md,
  },
});
