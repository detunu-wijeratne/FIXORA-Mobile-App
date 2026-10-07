// src/app/provider/schedule.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { collection, onSnapshot, query, where } from "firebase/firestore";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import ScreenHeader from "../../components/ScreenHeader";
import StatusBadge, { StatusType } from "../../components/StatusBadge";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

type Booking = {
  id: string;

  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;

  providerId?: string | null;

  service?: string;
  date?: string;
  time?: string;
  address?: string;
  description?: string;

  servicePrice?: number;
  totalAmount?: number;

  status?: string;
};

const formatWhen = (date?: string, time?: string) => {
  const d = (date || "").trim();
  const t = (time || "").trim();
  if (!d && !t) return "—";
  const dateLabel = /^\d+$/.test(d) ? `Day ${d}` : d;
  return [dateLabel, t].filter(Boolean).join(" • ");
};

const toStatusType = (status?: string): StatusType => {
  if (status === "in_progress") return "in_progress";
  if (status === "confirmed") return "confirmed";
  return "confirmed";
};

export default function ProviderScheduleScreen() {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const scheduleQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      scheduleQuery,
      (snapshot) => {
        const loadedJobs: Booking[] = snapshot.docs
          .map((jobDoc) => ({
            id: jobDoc.id,
            ...(jobDoc.data() as any),
          }))
          .filter(
            (job: any) => job.status === "confirmed" || job.status === "in_progress",
          ) as Booking[];

        // Sort by date (if numeric) then time
        loadedJobs.sort((a, b) => {
          const dateA = Number(a.date);
          const dateB = Number(b.date);

          if (!Number.isNaN(dateA) && !Number.isNaN(dateB) && dateA !== dateB) {
            return dateA - dateB;
          }

          return String(a.time || "").localeCompare(String(b.time || ""));
        });

        setJobs(loadedJobs);
        setLoading(false);
      },
      (error) => {
        console.log("Schedule loading error:", error);
        alert(error.message || "Unable to load schedule.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const nextJob = useMemo(() => (jobs.length > 0 ? jobs[0] : null), [jobs]);

  const openJobDetails = (job: Booking) => {
    router.push({
      pathname: "/provider/job-details",
      params: {
        bookingId: job.id,
        customer: job.customerName || "Customer",
        phone: job.customerPhone || "",
        email: job.customerEmail || "",
        service: job.service || "Home Service",
        date: job.date || "",
        time: job.time || "",
        location: job.address || "",
        description: job.description || "",
        price: String(job.servicePrice || 0),
        totalAmount: String(job.totalAmount || 0),
        status: job.status || "confirmed",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          eyebrow="FIXORA"
          title="Schedule"
          subtitle="See what’s coming next and manage your availability."
        />

        {/* Next job highlight */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightTop}>
            <View style={styles.highlightIcon}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.highlightTitle}>Next job</Text>
              <Text style={styles.highlightSub} numberOfLines={1}>
                {nextJob
                  ? `${nextJob.service || "Home Service"} • ${formatWhen(
                      nextJob.date,
                      nextJob.time,
                    )}`
                  : "No upcoming jobs yet"}
              </Text>
            </View>

            {nextJob ? (
              <StatusBadge status={toStatusType(nextJob.status)} />
            ) : (
              <View style={styles.neutralPill}>
                <Text style={styles.neutralPillText}>—</Text>
              </View>
            )}
          </View>

          {nextJob ? (
            <TouchableOpacity
              style={styles.highlightBtn}
              onPress={() => openJobDetails(nextJob)}
              activeOpacity={0.85}
            >
              <Text style={styles.highlightBtnText}>Open job</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.highlightBtn}
              onPress={() => router.push("/provider/requests")}
              activeOpacity={0.85}
            >
              <Text style={styles.highlightBtnText}>Check requests</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Upcoming jobs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming jobs</Text>
          <TouchableOpacity onPress={() => router.push("/provider/jobs")} activeOpacity={0.85}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading schedule…</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No scheduled jobs</Text>
            <Text style={styles.emptyText}>
              Accepted bookings will appear here. You can also check your incoming requests.
            </Text>
          </View>
        ) : (
          <View style={styles.jobList}>
            {jobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => openJobDetails(job)}
                activeOpacity={0.85}
              >
                <View style={styles.jobTop}>
                  <View style={styles.timeBox}>
                    <Ionicons name="alarm-outline" size={14} color={colors.primary} />
                    <Text style={styles.timeText} numberOfLines={1}>
                      {job.time || "—"}
                    </Text>
                    <Text style={styles.dateText} numberOfLines={1}>
                      {job.date ? (String(job.date).match(/^\d+$/) ? `Day ${job.date}` : job.date) : "—"}
                    </Text>
                  </View>

                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {job.service || "Home Service"}
                    </Text>

                    <Text style={styles.customer} numberOfLines={1}>
                      {job.customerName || "Customer"}
                    </Text>

                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {job.address || "Location not provided"}
                      </Text>
                    </View>

                    <View style={{ marginTop: spacing.sm }}>
                      <StatusBadge status={toStatusType(job.status)} />
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Availability */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Availability</Text>
        </View>

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityIcon}>
            <Ionicons name="calendar-clear-outline" size={18} color={colors.primary} />
          </View>

          <View style={styles.availabilityInfo}>
            <Text style={styles.availabilityTitle}>Manage availability</Text>
            <Text style={styles.availabilityText}>
              Add, remove or change the time slots customers can book.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/provider/availability")}
            activeOpacity={0.85}
          >
            <Text style={styles.manageBtnText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 90, // room for bottom nav
  },

  highlightCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  highlightTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  highlightTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  highlightSub: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  neutralPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },

  neutralPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  highlightBtn: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },

  highlightBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    ...typography.sectionHeading,
    fontSize: 16,
    fontWeight: "900",
  },

  link: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  loadingWrap: {
    marginTop: spacing.xl,
    alignItems: "center",
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
  },

  emptyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  emptyText: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: "center",
  },

  jobList: {
    gap: spacing.md,
  },

  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  jobTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  timeBox: {
    width: 92,
    minHeight: 82,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },

  timeText: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "center",
  },

  dateText: {
    marginTop: 3,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
  },

  jobInfo: { flex: 1 },

  jobTitle: {
    ...typography.cardTitle,
    fontWeight: "900",
  },

  customer: {
    marginTop: 3,
    ...typography.secondary,
    fontSize: 12,
  },

  locationRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  locationText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },

  availabilityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  availabilityIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  availabilityInfo: {
    flex: 1,
  },

  availabilityTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  availabilityText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  manageBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },

  manageBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
});