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

/*
  Fakes a smooth top-to-bottom dark gradient using stacked flex
  bands instead of a gradient library (none is installed, and the
  task asked not to add a dependency unless truly necessary). Each
  band is a little darker than the one above it, so the photo stays
  bright near the top (around the brand mark) and reads dark enough
  near the bottom for the headline and cards to stay legible.
*/
const OVERLAY_BAND_OPACITIES = [0.1, 0.18, 0.28, 0.4, 0.52, 0.62, 0.68, 0.72];

export default function RoleSelectionScreen() {
  return (
    <View style={styles.root}>
      <Image
        source={require("../../assets/images/role-selection-hero.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.overlay} pointerEvents="none">
        {OVERLAY_BAND_OPACITIES.map((opacity, index) => (
          <View
            key={index}
            style={{ flex: 1, backgroundColor: `rgba(6,10,24,${opacity})` }}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.brand}>FIXORA</Text>
        </View>

        <View style={styles.bottomBlock}>
          <View style={styles.headlineWrap}>
            <Text style={styles.title}>How would you like{"\n"}to continue?</Text>
            <Text style={styles.subtitle}>Choose how you'll use FIXORA.</Text>
          </View>

          <View style={styles.options}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => router.push("/customer-login")}
              activeOpacity={0.9}
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
              activeOpacity={0.9}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
  },

  safe: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 34,
    height: 34,
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

  bottomBlock: {
    paddingBottom: spacing.sm,
  },

  headlineWrap: {
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: spacing.sm + 2,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.86)",
  },

  options: {
    gap: spacing.md + 2,
  },

  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg + 2,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 92,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg - 2,
  },

  cardContent: {
    flex: 1,
    marginRight: spacing.sm,
  },

  cardTitle: {
    ...typography.cardTitle,
    fontSize: 16,
  },

  cardDescription: {
    ...typography.secondary,
    marginTop: spacing.xs,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
