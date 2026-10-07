import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../theme";

type Props = {
  currentStep: number;
  totalSteps?: number;
};

export default function BookingProgress({ currentStep, totalSteps = 4 }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Step {currentStep} of {totalSteps}
      </Text>

      <View style={styles.track}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              index < currentStep && styles.segmentActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  label: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },

  track: {
    flexDirection: "row",
    gap: spacing.xs,
  },

  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },

  segmentActive: {
    backgroundColor: colors.primary,
  },
});
