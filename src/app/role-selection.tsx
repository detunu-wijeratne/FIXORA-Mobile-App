import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing, typography } from "../theme";

export default function RoleSelectionScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.hero}>
        <Image
          source={require("../../assets/images/role-selection-hero.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.heroOverlay} />

        <View style={styles.heroContent}>
          <View style={styles.heroBrand}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>F</Text>
            </View>
            <Text style={styles.brand}>FIXORA</Text>
          </View>

          <Text style={styles.title}>
            How would you like{"\n"}to continue?
          </Text>

          <Text style={styles.subtitle}>
            Choose how you'll use FIXORA.
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.options}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => router.push("/customer-login")}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={26} color={colors.primary} />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I'm a Customer</Text>
              <Text style={styles.cardDescription}>
                Find trusted professionals for your home.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => router.push("/provider/login")}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I'm a Service Provider</Text>
              <Text style={styles.cardDescription}>
                Manage jobs, requests and availability.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  hero: {
    height: "42%",
    minHeight: 280,
    width: "100%",
  },

  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,16,32,0.52)",
  },

  heroContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl + 8,
  },

  heroBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  logoText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },

  brand: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.white,
  },

  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800",
    color: colors.white,
  },

  subtitle: {
    marginTop: spacing.sm + 1,
    fontSize: 15,
    lineHeight: 21,
    color: "rgba(255,255,255,0.88)",
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },

  options: {
    marginTop: -spacing.xxl,
    gap: spacing.lg,
  },

  roleCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 92,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
