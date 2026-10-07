// src/app/provider/earnings.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import ScreenHeader from "../../components/ScreenHeader";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

type Booking = {
  id: string;

  customerName?: string;
  service?: string;

  providerId?: string | null;

  servicePrice?: number;
  totalAmount?: number;

  status?: string;

  completedAt?: Timestamp | null;
};

const asMoney = (value: any) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatDate = (timestamp?: Timestamp | null) => {
  if (!timestamp) return "Completed";
  return timestamp.toDate().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ProviderEarningsScreen() {
  const [completedJobs, setCompletedJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const earningsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      earningsQuery,
      (snapshot) => {
        const jobs: Booking[] = snapshot.docs
          .map((bookingDoc) => ({
            id: bookingDoc.id,
            ...(bookingDoc.data() as any),
          }))
          .filter((b: any) => b.status === "completed") as Booking[];

        // newest first
        jobs.sort((a, b) => {
          const first = a.completedAt?.toMillis?.() || 0;
          const second = b.completedAt?.toMillis?.() || 0;
          return second - first;
        });

        setCompletedJobs(jobs);
        setLoading(false);
      },
      (error) => {
        console.log("Earnings loading error:", error);
        alert(error.message || "Unable to load earnings.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const now = new Date();

  const startOfWeek = useMemo(() => {
    const d = new Date(now);
    const day = d.getDay(); // Sun=0
    const difference = day === 0 ? 6 : day - 1; // Monday as week start
    d.setDate(d.getDate() - difference);
    d.setHours(0, 0, 0, 0);
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startOfMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalEarnings = useMemo(
    () =>
      completedJobs.reduce(
        (total, job) => total + Number(job.servicePrice || 0),
        0,
      ),
    [completedJobs],
  );

  const thisWeekEarnings = useMemo(() => {
    return completedJobs.reduce((total, job) => {
      if (!job.completedAt) return total;
      const completedDate = job.completedAt.toDate();
      if (completedDate >= startOfWeek) {
        return total + Number(job.servicePrice || 0);
      }
      return total;
    }, 0);
  }, [completedJobs, startOfWeek]);

  const thisMonthEarnings = useMemo(() => {
    return completedJobs.reduce((total, job) => {
      if (!job.completedAt) return total;
      const completedDate = job.completedAt.toDate();
      if (completedDate >= startOfMonth) {
        return total + Number(job.servicePrice || 0);
      }
      return total;
    }, 0);
  }, [completedJobs, startOfMonth]);

  const graphDays = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(now.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const amount = completedJobs.reduce((total, job) => {
        if (!job.completedAt) return total;
        const completedDate = job.completedAt.toDate();
        if (completedDate >= date && completedDate < nextDay) {
          return total + Number(job.servicePrice || 0);
        }
        return total;
      }, 0);

      return {
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        amount,
      };
    });

    return days;
  }, [completedJobs, now]);

  const maxGraphAmount = useMemo(() => {
    const max = Math.max(...graphDays.map((d) => d.amount), 1);
    return max;
  }, [graphDays]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading earnings…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          eyebrow="FIXORA"
          title="Earnings"
          subtitle="Track your income and recent payouts from completed jobs."
        />

        {/* Total card */}
        <View style={styles.totalCard}>
          <View style={styles.totalTopRow}>
            <View style={styles.totalIcon}>
              <Ionicons name="wallet-outline" size={18} color={colors.white} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>Total earnings</Text>
              <Text style={styles.totalValue}>{asMoney(totalEarnings)}</Text>
              <Text style={styles.totalHint}>
                {completedJobs.length} completed{" "}
                {completedJobs.length === 1 ? "job" : "jobs"}
              </Text>
            </View>
          </View>

          <View style={styles.totalPillsRow}>
            <View style={styles.totalPill}>
              <Text style={styles.pillLabel}>This week</Text>
              <Text style={styles.pillValue}>{asMoney(thisWeekEarnings)}</Text>
            </View>

            <View style={styles.totalPill}>
              <Text style={styles.pillLabel}>This month</Text>
              <Text style={styles.pillValue}>{asMoney(thisMonthEarnings)}</Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Last 7 days</Text>
          <Text style={styles.sectionMeta}>Overview</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            {graphDays.map((item, index) => {
              const height =
                item.amount === 0
                  ? 8
                  : Math.max(16, (item.amount / maxGraphAmount) * 130);

              const label =
                item.amount > 0
                  ? item.amount >= 1000
                    ? `${Math.round(item.amount / 1000)}k`
                    : `${Math.round(item.amount)}`
                  : "";

              return (
                <View key={`${item.label}-${index}`} style={styles.barCol}>
                  <Text style={styles.barTopLabel} numberOfLines={1}>
                    {label}
                  </Text>

                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height }]} />
                  </View>

                  <Text style={styles.barDay}>{item.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.chartNote}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.chartNoteText}>
              Bars show your earned service amount per day (completed jobs).
            </Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <Text style={styles.sectionMeta}>{completedJobs.length} total</Text>
        </View>

        {completedJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="cash-outline" size={22} color={colors.textSecondary} />
            </View>

            <Text style={styles.emptyTitle}>No earnings yet</Text>
            <Text style={styles.emptyText}>
              Completed jobs will appear here as transactions.
            </Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {completedJobs.map((tx) => (
              <View key={tx.id} style={styles.txCard}>
                <View style={styles.txIcon}>
                  <Ionicons name="checkmark-done-outline" size={18} color={colors.success} />
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txService} numberOfLines={1}>
                    {tx.service || "Home Service"}
                  </Text>
                  <Text style={styles.txCustomer} numberOfLines={1}>
                    {tx.customerName || "Customer"}
                  </Text>
                  <Text style={styles.txDate}>{formatDate(tx.completedAt)}</Text>
                </View>

                <View style={styles.txAmount}>
                  <Text style={styles.txValue}>{asMoney(tx.servicePrice)}</Text>
                  <View style={styles.txBadge}>
                    <Ionicons name="shield-checkmark-outline" size={12} color={colors.success} />
                    <Text style={styles.txBadgeText}>Earned</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 90, // room for bottom nav
  },

  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },

  totalTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  totalIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
  },

  totalValue: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: "900",
    color: colors.white,
  },

  totalHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.78)",
  },

  totalPillsRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },

  totalPill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  pillLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
  },

  pillValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "900",
    color: colors.white,
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

  sectionMeta: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  chartBars: {
    height: 190,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },

  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  barTopLabel: {
    minHeight: 14,
    marginBottom: 6,
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  barTrack: {
    width: 18,
    height: 150,
    borderRadius: 9,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  barFill: {
    width: "100%",
    borderRadius: 9,
    backgroundColor: colors.primary,
  },

  barDay: {
    marginTop: 8,
    fontSize: 10,
    color: colors.textSecondary,
  },

  chartNote: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chartNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
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

  txList: {
    gap: spacing.md,
  },

  txCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  txIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  txInfo: {
    flex: 1,
  },

  txService: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  txCustomer: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  txDate: {
    marginTop: 3,
    ...typography.caption,
  },

  txAmount: {
    alignItems: "flex-end",
  },

  txValue: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  txBadge: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.successLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },

  txBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.success,
  },
});