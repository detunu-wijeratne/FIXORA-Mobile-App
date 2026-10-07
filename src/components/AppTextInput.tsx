import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export default function AppTextInput({
  label,
  error,
  secureTextEntry,
  style,
  ...rest
}: Props) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputRow, error && styles.inputRowError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry ? hidden : false}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidden(!hidden)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg - 2,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg - 2,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeButton: {
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.error,
  },
});
