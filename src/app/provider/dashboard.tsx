import NewRequestAlert from "../../components/NewRequestAlert";
import ProviderIllustration from "../../components/ProviderIllustration";
import ProviderBackdrop from "../../components/ProviderBackdrop";
// src/app/provider/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import SecondaryButton from "../../components/ProviderSecondaryButton";
import PrimaryButton from "../../components/ProviderPrimaryButton";
import StatusBadge, { StatusType } from "../../components/StatusBadge";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme/provider";

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
  address?: string;
  description?: string;

  servicePrice?: number;
  platformFee?: number;
  totalAmount?: number;

  status?: string;
};

const money = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;

export default function ProviderDashboardScreen() {
  const [providerName, setProviderName] = useState("Provider");
  const [category, setCategory] = useState("Service Provider");
  const [district, setDistrict] = useState("Service Area");

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const loadProviderProfile = async () => {
      try {
        const providerDoc = await getDoc(doc(db, "users", user.uid));

        if (!providerDoc.exists()) {
          console.log("Provider profile not found.");
          return;
        }

        const data = providerDoc.data();

        setProviderName(data.name || "Provider");
        setCategory(data.category || "Service Provider");
        setDistrict(data.district || "Service Area");
      } catch (error) {
        console.log("Error loading provider profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProviderProfile();

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const loadedBookings: Booking[] = snapshot.docs.map((bookingDoc) => ({
          id: bookingDoc.id,
          ...(bookingDoc.data() as any),
        })) as Booking[];

        console.log("Dashboard provider bookings:", loadedBookings.length);

        setBookings(loadedBookings);
        setLoadingBookings(false);
      },
      (error) => {
        console.log("Dashboard booking error:", error);
        setLoadingBookings(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const pendingRequests = bookings.filter((booking) => booking.status === "pending");

  const upcomingJobs = bookings.filter(
    (booking) => booking.status === "confirmed" || booking.status === "in_progress",
  );

  const completedJobs = bookings.filter((booking) => booking.status === "completed");

  const totalEarnings = completedJobs.reduce(
    (total, booking) => total + Number(booking.servicePrice || 0),
    0,
  );

  const latestRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  const displayedUpcomingJobs = upcomingJobs.slice(0, 2);

  const openRequestDetails = (booking: Booking) => {
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

  const openJobDetails = (booking: Booking) => {
    router.push({
      pathname: "/provider/job-details",
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
        status: booking.status || "confirmed",
      },
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "CU";
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getJobStatusLabel = (status?: string) => {
    if (status === "in_progress") return "In Progress";
    return "Confirmed";
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* subtle attractive background (does not block touches) */}
      <View pointerEvents="none" style={styles.bgDecor}>
        <View style={styles.blobA} />
        <View style={styles.blobB} />
        <View style={styles.blobC} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PREMIUM BLUE HEADER */}
        <View style={styles.headerHero}>
          <ProviderBackdrop />
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1, paddingRight: spacing.md }}>
              <Text style={[styles.brand, { color: colors.accent, fontSize: 12, letterSpacing: 2 }]}>FIXORA PARTNER</Text>

              <View style={styles.headerLocationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={styles.headerLocationText} numberOfLines={1}>
                  {loadingProfile ? "Loading..." : district}
                </Text>
              </View>
            </View>

            {/* Notification -> Settings (as you requested) */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/provider/settings")}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.white} />
            </TouchableOpacity>

            {/* Profile/avatar -> /provider/profile */}
            <TouchableOpacity
              style={styles.headerAvatarBtn}
              onPress={() => router.push("/provider/profile")}
              activeOpacity={0.85}
            >
              <Text style={styles.headerAvatarText}>
                {getInitials(loadingProfile ? "PR" : providerName)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerMain}>
            <Text style={styles.greeting} numberOfLines={1}>
              {loadingProfile ? "Loading..." : `Hello, ${providerName}`}
            </Text>

            <Text style={styles.category} numberOfLines={2}>
              {loadingProfile ? "Loading provider profile..." : category}
            </Text>

            <View style={styles.headerPillsRow}>
              {/* Availability status */}
              <View style={styles.availabilityPill}>
                <View style={styles.availabilityDot} />
                <Text style={styles.availabilityText}>Available</Text>
              </View>

              {/* Change availability */}
              <TouchableOpacity
                style={styles.changeAvailabilityPill}
                onPress={() => router.push("/provider/availability")}
                activeOpacity={0.85}
              >
                <Ionicons name="calendar-outline" size={14} color={colors.white} />
                <Text style={styles.changeAvailabilityText}>Change availability</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SUMMARY / STATISTICS */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/provider/jobs")}
            activeOpacity={0.9}
          >
            <View style={styles.statIconWrap}>
              <ProviderIllustration kind="jobs" size={58} />
            </View>
            <Text style={styles.statValue}>
              {loadingBookings ? "..." : String(upcomingJobs.length)}
            </Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/provider/requests")}
            activeOpacity={0.9}
          >
            <View style={[styles.statIconWrap, { backgroundColor: colors.warningLight }]}>
              <ProviderIllustration kind="requests" size={58} />
            </View>

            <View style={styles.pendingValueRow}>
              <Text style={styles.statValue}>
                {loadingBookings ? "..." : String(pendingRequests.length)}
              </Text>

              {pendingRequests.length > 0 && !loadingBookings ? (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.statLabel}>Pending Action</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/provider/earnings")}
            activeOpacity={0.9}
          >
            <View style={[styles.statIconWrap, { backgroundColor: colors.successLight }]}>
              <ProviderIllustration kind="earnings" size={58} />
            </View>

            <Text style={styles.statValue}>
              {loadingBookings ? "..." : money(totalEarnings)}
            </Text>

            <Text style={styles.statLabel}>Earnings</Text>
          </TouchableOpacity>
        </View>

        {/* NEW REQUEST */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}><Text style={styles.sectionTitle}>New request</Text><NewRequestAlert count={loadingBookings ? 0 : pendingRequests.length} /></View>

          <TouchableOpacity
            onPress={() => router.push("/provider/requests")}
            activeOpacity={0.85}
          >
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        {latestRequest ? (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {latestRequest.service || "Home Service"}
                </Text>

                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    October {latestRequest.date || "-"}, {latestRequest.time || "-"}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.moneyText}>
                  Rs. {Number(latestRequest.servicePrice || 0).toLocaleString()}
                </Text>
                <Text style={styles.moneySub}>Est. Payout</Text>
              </View>
            </View>

            <View style={[styles.metaRow, { marginTop: spacing.sm }]}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={2}>
                {latestRequest.address || "Location not provided"}
              </Text>
            </View>

            <View style={styles.personRow}>
              <View style={styles.personAvatar}>
                <Text style={styles.personInitials}>
                  {getInitials(latestRequest.customerName)}
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.personName} numberOfLines={1}>
                  {latestRequest.customerName || "Customer"}
                </Text>
                <Text style={styles.personSub}>New booking request</Text>
              </View>

              <StatusBadge status={toStatusType(latestRequest.status) as StatusType} />
            </View>

            <View style={styles.actionsRow}>
              <SecondaryButton
                title="View Details"
                onPress={() => openRequestDetails(latestRequest)}
                style={{ flex: 1 }}
              />

              <PrimaryButton
                title="✓ Review Request"
                onPress={() => openRequestDetails(latestRequest)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="mail-open-outline" size={22} color={colors.textSecondary} />
            </View>

            <Text style={styles.emptyTitle}>No new requests</Text>
            <Text style={styles.emptyText}>
              New customer booking requests will appear here.
            </Text>
          </View>
        )}

        {/* UPCOMING JOBS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming jobs</Text>

          <TouchableOpacity onPress={() => router.push("/provider/jobs")} activeOpacity={0.85}>
            <Text style={styles.sectionLink}>See all ({upcomingJobs.length})</Text>
          </TouchableOpacity>
        </View>

        {displayedUpcomingJobs.length > 0 ? (
          displayedUpcomingJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => openJobDetails(job)}
              activeOpacity={0.9}
            >
              <View style={styles.jobTopRow}>
                <View style={styles.jobIconWrap}>
                  <Ionicons name="construct-outline" size={18} color={colors.primary} />
                </View>

                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.service || "Home Service"}
                  </Text>
                  <Text style={styles.jobMeta} numberOfLines={1}>
                    October {job.date || "-"}, {job.time || "-"}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <View style={styles.statusPillWrap}>
                    <Text style={styles.statusPillText}>
                      {getJobStatusLabel(job.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.metaRow, { marginTop: spacing.sm }]}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {job.address || "Location not provided"}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>

              <View style={styles.jobBottomRow}>
                <Text style={styles.jobMoney}>
                  Rs. {Number(job.servicePrice || 0).toLocaleString()}
                </Text>
                <Text style={styles.jobMoneySub}>Service price</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
            </View>

            <Text style={styles.emptyTitle}>No upcoming jobs</Text>
            <Text style={styles.emptyText}>Accepted bookings will appear here.</Text>
          </View>
        )}

        {/* COMPLETED SUMMARY */}
        <TouchableOpacity
          style={styles.completedCard}
          onPress={() => router.push("/provider/jobs")}
          activeOpacity={0.9}
        >
          <View style={styles.completedIcon}>
            <Ionicons name="checkmark-done-outline" size={20} color={colors.white} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.completedTitle}>
              {completedJobs.length} Completed {completedJobs.length === 1 ? "Job" : "Jobs"}
            </Text>

            <Text style={styles.completedSub}>
              Total earnings: Rs. {totalEarnings.toLocaleString()}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: "#0B1220",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 10 },
  default: {},
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // subtle decorative background (light only)
  bgDecor: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  blobA: {
    position: "absolute",
    top: -120,
    right: -140,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: colors.primarySoft,
    opacity: 0.55,
  },
  blobB: {
    position: "absolute",
    top: 220,
    left: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#EEF2FF",
    opacity: 0.45,
  },
  blobC: {
    position: "absolute",
    bottom: -180,
    right: -170,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "#ECFEFF",
    opacity: 0.35,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 90,
  },

  /* Header hero */
  headerHero: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    ...(shadow as any),
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  brand: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: colors.white,
  },

  headerLocationRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  headerLocationText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },

  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerAvatarText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 12,
  },

  headerMain: {
    marginTop: spacing.lg,
  },

  greeting: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.white,
  },

  category: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.82)",
  },

  headerPillsRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  availabilityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },

  availabilityText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.white,
  },

  changeAvailabilityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  changeAvailabilityText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.white,
  },

  /* Stats */
  statsRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },

  statCard: {
flex: 1,
backgroundColor: colors.surface,
borderRadius: radius.xl,
borderWidth: 1,
borderColor: colors.border,
...(shadow as any),
padding: 12,
minWidth: 0,
shadowOpacity: 0.06,
shadowRadius: 14,
shadowOffset: { width: 0, height: 5 }
},

  statIconWrap: {
borderRadius: radius.md,
borderColor: colors.border,
alignItems: "center",
justifyContent: "center",
width: 58,
height: 58,
borderWidth: 0,
backgroundColor: "transparent"
},

  pendingValueRow: {
flexDirection: "row",
alignItems: "center",
flexWrap: "wrap",
gap: 4,
marginTop: 0
},

  statValue: {
marginTop: spacing.sm,
color: colors.textPrimary,
fontSize: 19,
lineHeight: 25,
fontWeight: "800"
},

  statLabel: {
marginTop: 4,
...typography.caption,
color: colors.textSecondary,
fontSize: 11,
lineHeight: 16
},

  newBadge: {
backgroundColor: colors.warningLight,
borderRadius: radius.pill,
paddingHorizontal: 5,
paddingVertical: 2
},

  newBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.warning,
  },

  /* Sections */
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

  sectionLink: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  /* Card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...(shadow as any),
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  metaRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },

  moneyText: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },

  moneySub: {
    marginTop: 2,
    ...typography.caption,
    textAlign: "right",
  },

  personRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  personAvatar: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  personInitials: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  personName: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  personSub: {
    marginTop: 2,
    ...typography.caption,
    color: colors.textSecondary,
  },

  actionsRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },

  /* Jobs */
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...(shadow as any),
  },

  jobTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  jobIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  jobTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  jobMeta: {
    marginTop: 3,
    ...typography.caption,
    color: colors.textSecondary,
  },

  statusPillWrap: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statusPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
  },

  jobBottomRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  jobMoney: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  jobMoneySub: {
    marginTop: 2,
    ...typography.caption,
  },

  /* Empty */
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
    ...(shadow as any),
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
    textAlign: "center",
    color: colors.textSecondary,
  },

  /* Completed summary */
  completedCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...(shadow as any),
  },

  completedIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  completedTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
  },

  completedSub: {
    marginTop: 3,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "600",
  },
});