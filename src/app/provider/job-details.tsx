// src/app/provider/job-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import StatusBadge, { StatusType } from "../../components/StatusBadge";
import { db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

const asMoney = (value: any) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatWhen = (date?: string, time?: string) => {
  const d = (date || "").trim();
  const t = (time || "").trim();
  if (!d && !t) return "—";
  const dateLabel = /^\d+$/.test(d) ? `Day ${d}` : d;
  return [dateLabel, t].filter(Boolean).join(" • ");
};

const toStatusType = (status?: string): StatusType => {
  if (status === "pending") return "pending";
  if (status === "confirmed") return "confirmed";
  if (status === "in_progress") return "in_progress";
  if (status === "completed") return "completed";
  if (status === "declined") return "declined";
  if (status === "cancelled") return "cancelled";
  return "confirmed";
};

export default function ProviderJobDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const bookingId = typeof params.bookingId === "string" ? params.bookingId : "";

  const customer = typeof params.customer === "string" ? params.customer : "Customer";
  const phone = typeof params.phone === "string" ? params.phone : "";
  const email = typeof params.email === "string" ? params.email : "";

  const service = typeof params.service === "string" ? params.service : "Home Service";
  const date = typeof params.date === "string" ? params.date : "";
  const time = typeof params.time === "string" ? params.time : "";
  const location = typeof params.location === "string" ? params.location : "";
  const description =
    typeof params.description === "string"
      ? params.description
      : "No description provided";

  const price = typeof params.price === "string" ? params.price : "0";
  const totalAmount = typeof params.totalAmount === "string" ? params.totalAmount : "0";

  const [status, setStatus] = useState(
    typeof params.status === "string" ? params.status : "confirmed",
  );
  const [loading, setLoading] = useState(false);

  const customerInitials = useMemo(() => {
    return customer
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [customer]);

  const handleStartJob = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found.");
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "in_progress",
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStatus("in_progress");
      Alert.alert("Job Started", "The job status is now In Progress.");
    } catch (error: any) {
      console.log("Start job error:", error);
      Alert.alert("Error", error.message || "Unable to start job.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found.");
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStatus("completed");
      Alert.alert("Job Completed", "The job has been marked as completed.");
    } catch (error: any) {
      console.log("Complete job error:", error);
      Alert.alert("Error", error.message || "Unable to complete job.");
    } finally {
      setLoading(false);
    }
  };

  const bottomPad = Math.max(insets.bottom, spacing.md);
  const showStart = status === "confirmed";
  const showComplete = status === "in_progress";
  const showCompleted = status === "completed";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          Job details
        </Text>

        <View style={{ width: 40 }}>
          <StatusBadge status={toStatusType(status)} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (showStart || showComplete || showCompleted ? 110 : 24) + bottomPad },
        ]}
      >
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryIcon}>
              <Ionicons name="construct-outline" size={18} color={colors.primary} />
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.serviceTitle} numberOfLines={1}>
                {service}
              </Text>
              <Text style={styles.whenText} numberOfLines={1}>
                {formatWhen(date, time)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.serviceMoney}>{asMoney(price)}</Text>
              <Text style={styles.moneyCaption}>Service price</Text>
            </View>
          </View>

          <View style={styles.summaryBottom}>
            <View style={styles.summaryPill}>
              <Ionicons name="cash-outline" size={14} color={colors.primary} />
              <Text style={styles.summaryPillText}>
                Customer total: {asMoney(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Customer</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/provider/chat",
                  params: { bookingId, customer },
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.linkText}>Message</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitials}>{customerInitials}</Text>
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.customerName} numberOfLines={1}>
                {customer}
              </Text>
              {!!phone && (
                <Text style={styles.customerMeta} numberOfLines={1}>
                  <Ionicons name="call-outline" size={13} color={colors.textSecondary} /> {phone}
                </Text>
              )}
              {!!email && (
                <Text style={styles.customerMeta} numberOfLines={1}>
                  <Ionicons name="mail-outline" size={13} color={colors.textSecondary} /> {email}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.customerActions}>
            <SecondaryButton
              title="Open chat"
              onPress={() =>
                router.push({
                  pathname: "/provider/chat",
                  params: { bookingId, customer },
                })
              }
              style={{ flex: 1 }}
            />
            <SecondaryButton
              title="View jobs"
              variant="ghost"
              onPress={() => router.replace("/provider/jobs")}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service location</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={3}>
              {location || "Location not provided"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Problem description</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {description || "No description provided"}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progress</Text>

          <Step
            active
            title="Booking confirmed"
            subtitle="You accepted the customer request."
          />

          <DividerLine />

          <Step
            active={status === "in_progress" || status === "completed"}
            title="Job in progress"
            subtitle="Service work has started."
          />

          <DividerLine />

          <Step
            active={status === "completed"}
            title="Job completed"
            subtitle="Service work has been completed."
          />
        </View>
      </ScrollView>

      {(showStart || showComplete || showCompleted) && (
        <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
          {showStart ? (
            <PrimaryButton
              title={loading ? "Starting…" : "Start job"}
              onPress={handleStartJob}
              loading={loading}
              icon="play-outline"
            />
          ) : null}

          {showComplete ? (
            <PrimaryButton
              title={loading ? "Completing…" : "Mark as completed"}
              onPress={handleCompleteJob}
              loading={loading}
              icon="checkmark-done-outline"
            />
          ) : null}

          {showCompleted ? (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
              <Text style={styles.completedText}>Job completed</Text>
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

function Step({
  active,
  title,
  subtitle,
}: {
  active?: boolean;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, active ? styles.stepDotActive : styles.stepDotIdle]} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[styles.stepTitle, !active && { color: colors.textSecondary }]}>
          {title}
        </Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function DividerLine() {
  return <View style={styles.stepLine} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
  },

  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  topBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
    textAlign: "center",
  },

  scrollContent: {
    padding: spacing.xl,
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  serviceTitle: {
    ...typography.cardTitle,
    fontWeight: "900",
  },

  whenText: {
    marginTop: 3,
    ...typography.caption,
    color: colors.textSecondary,
  },

  serviceMoney: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },

  moneyCaption: {
    marginTop: 2,
    ...typography.caption,
    textAlign: "right",
  },

  summaryBottom: {
    marginTop: spacing.md,
  },

  summaryPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },

  summaryPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTitle: {
    ...typography.sectionHeading,
    fontSize: 15,
    fontWeight: "900",
  },

  linkText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  customerRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  customerAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  customerInitials: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 14,
  },

  customerName: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  customerMeta: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },

  customerActions: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },

  infoRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  descriptionBox: {
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  descriptionText: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  stepRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
  },

  stepDotActive: {
    backgroundColor: colors.primary,
  },

  stepDotIdle: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },

  stepTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  stepSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  stepLine: {
    width: 2,
    height: 26,
    backgroundColor: colors.borderStrong,
    marginLeft: 6,
    marginTop: spacing.sm,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md + 2,
  },

  completedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },

  completedText: {
    color: colors.success,
    fontWeight: "900",
  },
});