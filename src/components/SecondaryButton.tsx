import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { colors, radius, spacing } from "../theme";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "outline" | "ghost";
  style?: ViewStyle;
};

export default function SecondaryButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "outline",
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        variant === "outline" ? styles.outline : styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : colors.textSecondary}
        />
      ) : (
        <Text style={variant === "outline" ? styles.outlineText : styles.ghostText}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    minHeight: 48,
  },
  ghost: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  disabled: {
    opacity: 0.6,
  },
  outlineText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  ghostText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
});
