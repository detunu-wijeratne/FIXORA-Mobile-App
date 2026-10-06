import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius, spacing } from "../theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export default function Card({ children, style, padded = true }: Props) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.xl,
  },
});
