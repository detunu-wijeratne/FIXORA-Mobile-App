import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";

import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { colors, radius, spacing, typography } from "../theme";

export default function BookingConfirmationScreen() {
  const params = useLocalSearchParams();

  const name =
    typeof params.name === "string" ? params.name : "Service Provider";

  const service =
    typeof params.service === "string" ? params.service : "Home Service";

  const date = typeof params.date === "string" ? params.date : "5";

  const time = typeof params.time === "string" ? params.time : "9:30 AM";

  const imageUrl =
    typeof params.imageUrl === "string" ? params.imageUrl : "";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.successCircle}>
          <Ionicons name="checkmark-circle" size={56} color={colors.success} />
        </View>

        <Text style={styles.title}>Booking confirmed!</Text>

        <Text style={styles.subtitle}>
          Your booking request has been successfully submitted.
        </Text>

        <View style={styles.card}>
          <Text style={styles.providerName}>{name}</Text>
          <Text style={styles.service}>{service}</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>October {date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{time}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>

            <View style={styles.statusPill}>
              <Ionicons name="time-outline" size={13} color={colors.warning} />
              <Text style={styles.status}>Pending Provider Approval</Text>
            </View>
          </View>
        </View>

        {imageUrl && (
          <View style={styles.photoCard}>
            <Text style={styles.photoTitle}>Attached Photo</Text>

            <Image
              source={{ uri: imageUrl }}
              style={styles.photo}
              resizeMode="cover"
              onLoad={() => console.log("Confirmation Cloudinary image loaded")}
              onError={(event) => {
                console.log("Confirmation image error:", event.nativeEvent.error);
                console.log("Confirmation image URL:", imageUrl);
              }}
            />

            <View style={styles.photoStatusRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.photoStatusText}>
                Photo attached to this booking
              </Text>
            </View>
          </View>
        )}

        <PrimaryButton
          title="View My Bookings"
          style={styles.primaryButton}
          onPress={() => router.push("/my-bookings")}
        />

        <SecondaryButton
          title="Back to Home"
          style={styles.secondaryButton}
          onPress={() => router.replace("/customer-home")}
        />
      </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    padding: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },

  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    ...typography.pageTitle,
    marginTop: spacing.xl,
    textAlign: "center",
  },

  subtitle: {
    ...typography.secondary,
    marginTop: spacing.sm + 1,
    textAlign: "center",
    maxWidth: 310,
  },

  card: {
    marginTop: spacing.xxl,
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg + 2,
  },

  providerName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  service: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.md,
  },

  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.warningLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },

  status: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.warning,
  },

  photoCard: {
    marginTop: spacing.lg,
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
  },

  photoTitle: {
    marginBottom: spacing.sm + 2,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  photo: {
    width: "100%",
    height: 210,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },

  photoStatusRow: {
    marginTop: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },

  photoStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },

  primaryButton: {
    marginTop: spacing.xxl,
    width: "100%",
  },

  secondaryButton: {
    marginTop: spacing.md,
    width: "100%",
  },
});
