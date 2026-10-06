import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import { colors, radius, spacing, typography } from "../theme";

const SERVICE_EXAMPLES: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Plumbing", icon: "construct-outline" },
  { label: "Electrical", icon: "flash-outline" },
  { label: "Cleaning", icon: "sparkles-outline" },
];

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/fixora-welcome-bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.brand}>FIXORA</Text>
        </View>

        <View style={styles.middleContent}>
          <Text style={styles.title}>Reliable home services.</Text>

          <Text style={styles.subtitle}>
            Find trusted professionals for all your home service needs.
          </Text>

          <View style={styles.chipsRow}>
            {SERVICE_EXAMPLES.map((service) => (
              <View key={service.label} style={styles.chip}>
                <View style={styles.chipIconCircle}>
                  <Ionicons name={service.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.chipText}>{service.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <PrimaryButton
          title="Get Started →"
          onPress={() => router.push("/role-selection")}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  logoText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
  },

  brand: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.primary,
  },

  middleContent: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    ...typography.pageTitle,
    fontSize: 32,
    lineHeight: 40,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    maxWidth: 320,
  },

  chipsRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginTop: spacing.xxxl,
  },

  chip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  chipIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  chipText: {
    ...typography.label,
    color: colors.textPrimary,
    fontSize: 12,
  },
});
