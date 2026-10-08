import { ComponentProps } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../theme/provider";
import SecondaryButton from "./SecondaryButton";

export default function ProviderSecondaryButton({ title, onPress, disabled, loading, variant = "outline", style }: ComponentProps<typeof SecondaryButton>) {
  return <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} accessibilityRole="button" style={[styles.button, variant === "outline" && styles.outline, (disabled || loading) && styles.disabled, style]}>{loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.label}>{title}</Text>}</TouchableOpacity>;
}
const styles = StyleSheet.create({
  button: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  outline: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.primarySoft },
  disabled: { opacity: 0.6 },
  label: { color: colors.primary, fontWeight: "700", fontSize: 14, textAlign: "center" },
});
