import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../theme";

export default function RoleSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="How would you like to continue?"
        subtitle="Choose your role to continue with FIXORA."
      />

      <View style={styles.options}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/customer-login")}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="person-outline" size={26} color={colors.primary} />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Continue as Customer</Text>
            <Text style={styles.cardDescription}>
              Find and book trusted home service professionals.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/provider/login")}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase-outline" size={26} color={colors.primary} />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Continue as Service Provider</Text>
            <Text style={styles.cardDescription}>
              Manage jobs, requests and your service availability.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xxl,
  },

  options: {
    marginTop: spacing.lg,
    gap: spacing.lg + 2,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 88,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg,
  },

  cardContent: {
    flex: 1,
    marginRight: spacing.sm,
  },

  cardTitle: {
    ...typography.cardTitle,
    fontSize: 17,
  },

  cardDescription: {
    ...typography.secondary,
    marginTop: spacing.xs + 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
