// src/app/provider/requests.tsx
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
import StatusBadge from "../../components/StatusBadge";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

type Booking = {
  id: string;

  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;

  providerId?: string | null;
  providerName?: string;

  service?: string;
  date?: string;
  time?: string;
  description?: string;
  address?: string;

  servicePrice?: number;
  platformFee?: number;
  totalAmount?: number;

  status?: string;
};

type FilterKey = "all" | "today" | "tomorrow";

const asMoney = (value: any) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatWhen = (date?: string, time?: string) => {
  const d = (date || "").trim();
  const t = (time || "").trim();
  if (!d && !t) return "—";
  const dateLabel = /^\d+$/.test(d) ? `Day ${d}` : d;
  return [dateLabel, t].filter(Boolean).join(" • ");
};

export default function ProviderRequestsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    // Load only bookings assigned to this provider,
    // then filter pending locally.
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const loaded: Booking[] = snapshot.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((b) => b.status === "pending") as Booking[];

        // Optional sort: if date is numeric, earlier first
        loaded.sort((a, b) => {
          const da = Number(a.date);
          const dbb = Number(b.date);
          if (!Number.isNaN(da) && !Number.isNaN(dbb) && da !== dbb) return da - dbb;
          return String(a.time || "").localeCompare(String(b.time || ""));
        });

        setBookings(loaded);
        setLoading(false);
      },
      (error) => {
        console.log("Error loading provider requests:", error);
        alert(error.message || "Unable to load booking requests.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;

    // NOTE: Your date field appears to be a day-of-month string.
    // This filter will behave best if `date` equals today's day number.
    const now = new Date();
    const todayDay = String(now.getDate());
    const tomorrowDay = String(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getDate());

    if (filter === "today") return bookings.filter((b) => String(b.date || "") === todayDay);
    if (filter === "tomorrow") return bookings.filter((b) => String(b.date || "") === tomorrowDay);

    return bookings;
  }, [bookings, filter]);

  const openRequest = (booking: Booking) => {
    router.push({
      pathname: "/provider/request-details",
      params: {
        bookingId: booking.id,
        customer: booking.customerName || "Customer",
        phone: booking.customerPhone || "",
        email: booking.customerEmail || "",
        service: booking.service || "Home Service",
        date: booking.date || "",
        time: booking.time || "",
        location: booking.address || "",
        description: booking.description || "",
        price: String(booking.servicePrice || 0),
        totalAmount: String(booking.totalAmount || 0),
        status: booking.status || "pending",
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
          title="Incoming requests"
          subtitle="Review new customer service requests assigned to you."
        />

        <View style={styles.filtersCard}>
          <FilterButton label="All" active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterButton label="Today" active={filter === "today"} onPress={() => setFilter("today")} />
          <FilterButton label="Tomorrow" active={filter === "tomorrow"} onPress={() => setFilter("tomorrow")} />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading requests…</Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="mail-open-outline" size={22} color={colors.textSecondary} />
            </View>

            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptyText}>
              New booking requests assigned to you will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.requestCard}
                onPress={() => openRequest(booking)}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <View style={styles.iconBox}>
                    <Ionicons name="clipboard-outline" size={18} color={colors.warning} />
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.service} numberOfLines={1}>
                      {booking.service || "Home Service"}
                    </Text>
                    <Text style={styles.customer} numberOfLines={1}>
                      {booking.customerName || "Customer"}
                    </Text>
                  </View>

                  <StatusBadge status="pending" />
                </View>

                <View style={styles.meta}>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {formatWhen(booking.date, booking.time)}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText} numberOfLines={2}>
                      {booking.address || "Location not provided"}
                    </Text>
                  </View>
                </View>

                <View style={styles.bottom}>
                  <View>
                    <Text style={styles.priceLabel}>Estimated service</Text>
                    <Text style={styles.price}>{asMoney(booking.servicePrice)}</Text>
                  </View>

                  <View style={styles.ctaRow}>
                    <Text style={styles.ctaText}>Review</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.filterBtn, active && styles.filterBtnActive]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 90,
  },

  filtersCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 6,
    gap: 6,
  },

  filterBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  filterBtnActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textSecondary,
  },

  filterTextActive: {
    color: colors.primary,
  },

  loadingWrap: {
    marginTop: spacing.xl + 10,
    alignItems: "center",
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  emptyCard: {
    marginTop: spacing.lg,
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

  list: {
    marginTop: spacing.md,
    gap: spacing.md,
  },

  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  info: { flex: 1 },

  service: {
    ...typography.cardTitle,
    fontWeight: "900",
  },

  customer: {
    marginTop: 3,
    ...typography.secondary,
    fontSize: 12,
  },

  meta: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  metaText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },

  bottom: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  price: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  ctaText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },
});