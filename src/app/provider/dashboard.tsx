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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import { auth, db } from "../../services/firebase";

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

export default function ProviderDashboardScreen() {
  const [providerName, setProviderName] =
    useState("Provider");

  const [category, setCategory] =
    useState("Service Provider");

  const [district, setDistrict] =
    useState("Service Area");

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loadingBookings, setLoadingBookings] =
    useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const loadProviderProfile = async () => {
      try {
        const providerDoc = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!providerDoc.exists()) {
          console.log(
            "Provider profile not found."
          );
          return;
        }

        const data = providerDoc.data();

        setProviderName(
          data.name || "Provider"
        );

        setCategory(
          data.category || "Service Provider"
        );

        setDistrict(
          data.district || "Service Area"
        );
      } catch (error) {
        console.log(
          "Error loading provider profile:",
          error
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProviderProfile();

    /*
      Load only bookings assigned to this
      logged-in provider.
    */
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,

      (snapshot) => {
        const loadedBookings: Booking[] =
          snapshot.docs.map((bookingDoc) => ({
            id: bookingDoc.id,
            ...bookingDoc.data(),
          })) as Booking[];

        console.log(
          "Dashboard provider bookings:",
          loadedBookings.length
        );

        setBookings(loadedBookings);
        setLoadingBookings(false);
      },

      (error) => {
        console.log(
          "Dashboard booking error:",
          error
        );

        setLoadingBookings(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const pendingRequests = bookings.filter(
    (booking) =>
      booking.status === "pending"
  );

  const upcomingJobs = bookings.filter(
    (booking) =>
      booking.status === "confirmed" ||
      booking.status === "in_progress"
  );

  const completedJobs = bookings.filter(
    (booking) =>
      booking.status === "completed"
  );

  const totalEarnings =
    completedJobs.reduce(
      (total, booking) =>
        total +
        Number(booking.servicePrice || 0),
      0
    );

  const latestRequest =
    pendingRequests.length > 0
      ? pendingRequests[0]
      : null;

  const displayedUpcomingJobs =
    upcomingJobs.slice(0, 2);

  const openRequestDetails = (
    booking: Booking
  ) => {
    router.push({
      pathname: "/provider/request-details",

      params: {
        bookingId: booking.id,

        customer:
          booking.customerName ||
          "Customer",

        phone:
          booking.customerPhone || "",

        email:
          booking.customerEmail || "",

        service:
          booking.service ||
          "Home Service",

        date:
          booking.date || "",

        time:
          booking.time || "",

        location:
          booking.address || "",

        description:
          booking.description || "",

        price: String(
          booking.servicePrice || 0
        ),

        totalAmount: String(
          booking.totalAmount || 0
        ),

        status:
          booking.status || "pending",
      },
    });
  };

  const openJobDetails = (
    booking: Booking
  ) => {
    router.push({
      pathname: "/provider/job-details",

      params: {
        bookingId: booking.id,

        customer:
          booking.customerName ||
          "Customer",

        phone:
          booking.customerPhone || "",

        email:
          booking.customerEmail || "",

        service:
          booking.service ||
          "Home Service",

        date:
          booking.date || "",

        time:
          booking.time || "",

        location:
          booking.address || "",

        description:
          booking.description || "",

        price: String(
          booking.servicePrice || 0
        ),

        totalAmount: String(
          booking.totalAmount || 0
        ),

        status:
          booking.status || "confirmed",
      },
    });
  };

  const getInitials = (
    name?: string
  ) => {
    if (!name) {
      return "CU";
    }

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getJobStatusLabel = (
    status?: string
  ) => {
    if (status === "in_progress") {
      return "In Progress";
    }

    return "Confirmed";
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View style={styles.topHeader}>
          <View>
            <Text style={styles.logo}>
              FIXORA
            </Text>

            <Text style={styles.location}>
              📍{" "}
              {loadingProfile
                ? "Loading..."
                : district}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Text
                style={styles.notification}
              >
                🔔
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallAvatar}
              onPress={() =>
                router.push(
                  "/provider/profile"
                )
              }
            >
              <Text
                style={styles.avatarEmoji}
              >
                👨‍🔧
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PROVIDER */}

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTop}>
            <View
              style={styles.providerAvatar}
            >
              <Text
                style={styles.providerEmoji}
              >
                👨‍🔧
              </Text>
            </View>

            <View
              style={styles.welcomeContent}
            >
              <Text
                style={styles.welcomeTitle}
              >
                {loadingProfile
                  ? "Loading..."
                  : `Hello, ${providerName} 👋`}
              </Text>

              <Text
                style={
                  styles.welcomeSubtitle
                }
              >
                {loadingProfile
                  ? "Loading provider profile..."
                  : category}
              </Text>
            </View>

            <View
              style={styles.availableBadge}
            >
              <View
                style={styles.greenDot}
              />

              <Text
                style={styles.availableText}
              >
                Available
              </Text>
            </View>
          </View>

          <View style={styles.zoneRow}>
            <Text style={styles.zoneText}>
              📍{" "}
              {loadingProfile
                ? "Loading service area..."
                : district}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/provider/availability"
                )
              }
            >
              <Text
                style={styles.changeText}
              >
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* REAL STATS */}

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() =>
              router.push(
                "/provider/jobs"
              )
            }
          >
            <Text style={styles.statIcon}>
              🧰
            </Text>

            <Text style={styles.statValue}>
              {loadingBookings
                ? "..."
                : upcomingJobs.length}
            </Text>

            <Text style={styles.statLabel}>
              Active Jobs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() =>
              router.push(
                "/provider/requests"
              )
            }
          >
            <Text style={styles.statIcon}>
              📋
            </Text>

            <View
              style={styles.statValueRow}
            >
              <Text
                style={styles.statValue}
              >
                {loadingBookings
                  ? "..."
                  : pendingRequests.length}
              </Text>

              {pendingRequests.length >
                0 && (
                <Text
                  style={styles.newBadge}
                >
                  NEW
                </Text>
              )}
            </View>

            <Text style={styles.statLabel}>
              Pending Action
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() =>
              router.push(
                "/provider/earnings"
              )
            }
          >
            <Text style={styles.statIcon}>
              💵
            </Text>

            <Text style={styles.statValue}>
              {loadingBookings
                ? "..."
                : `Rs. ${totalEarnings.toLocaleString()}`}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Earnings
            </Text>
          </TouchableOpacity>
        </View>

        {/* NEW REQUEST */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            🟠 New Request
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/provider/requests"
              )
            }
          >
            <Text style={styles.viewAll}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {latestRequest ? (
          <View style={styles.requestCard}>
            <View
              style={styles.requestTop}
            >
              <View
                style={
                  styles.requestTitleArea
                }
              >
                <Text
                  style={
                    styles.requestTitle
                  }
                >
                  {latestRequest.service ||
                    "Home Service"}
                </Text>

                <Text
                  style={
                    styles.requestDate
                  }
                >
                  🕐 October{" "}
                  {latestRequest.date ||
                    "-"}
                  ,{" "}
                  {latestRequest.time ||
                    "-"}
                </Text>
              </View>

              <View>
                <Text
                  style={
                    styles.requestPrice
                  }
                >
                  Rs.{" "}
                  {Number(
                    latestRequest.servicePrice ||
                      0
                  ).toLocaleString()}
                </Text>

                <Text
                  style={styles.priceLabel}
                >
                  Est. Payout
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.requestLocation
              }
            >
              📍{" "}
              {latestRequest.address ||
                "Location not provided"}
            </Text>

            <View
              style={styles.customerRow}
            >
              <View
                style={
                  styles.customerAvatar
                }
              >
                <Text
                  style={
                    styles.customerInitials
                  }
                >
                  {getInitials(
                    latestRequest.customerName
                  )}
                </Text>
              </View>

              <View
                style={styles.customerInfo}
              >
                <Text
                  style={
                    styles.customerName
                  }
                >
                  {latestRequest.customerName ||
                    "Customer"}
                </Text>

                <Text
                  style={styles.rating}
                >
                  New booking request
                </Text>
              </View>

              <View
                style={
                  styles.paymentBadge
                }
              >
                <Text
                  style={styles.paymentText}
                >
                  Pending
                </Text>
              </View>
            </View>

            <View
              style={
                styles.requestButtons
              }
            >
              <TouchableOpacity
                style={
                  styles.detailsButton
                }
                onPress={() =>
                  openRequestDetails(
                    latestRequest
                  )
                }
              >
                <Text
                  style={
                    styles.detailsText
                  }
                >
                  View Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.acceptButton
                }
                onPress={() =>
                  openRequestDetails(
                    latestRequest
                  )
                }
              >
                <Text
                  style={
                    styles.acceptText
                  }
                >
                  ✓ Review Request
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              📭
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No new requests
            </Text>

            <Text
              style={styles.emptyText}
            >
              New customer booking requests
              will appear here.
            </Text>
          </View>
        )}

        {/* UPCOMING JOBS */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            📅 Upcoming Jobs
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/provider/jobs"
              )
            }
          >
            <Text style={styles.viewAll}>
              See All (
              {upcomingJobs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {displayedUpcomingJobs.length >
        0 ? (
          displayedUpcomingJobs.map(
            (job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() =>
                  openJobDetails(job)
                }
              >
                <View
                  style={styles.jobTop}
                >
                  <Text
                    style={
                      styles.jobTitle
                    }
                  >
                    {job.service ||
                      "Home Service"}
                  </Text>

                  <View
                    style={
                      styles.confirmedBadge
                    }
                  >
                    <Text
                      style={
                        styles.confirmedText
                      }
                    >
                      {getJobStatusLabel(
                        job.status
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.jobPrice
                    }
                  >
                    Rs.{" "}
                    {Number(
                      job.servicePrice || 0
                    ).toLocaleString()}
                  </Text>
                </View>

                <Text
                  style={styles.jobDate}
                >
                  October{" "}
                  {job.date || "-"},{" "}
                  {job.time || "-"}
                </Text>

                <View
                  style={styles.jobBottom}
                >
                  <Text
                    style={
                      styles.jobLocation
                    }
                  >
                    📍{" "}
                    {job.address ||
                      "Location not provided"}
                  </Text>

                  <Text
                    style={
                      styles.jobAction
                    }
                  >
                    ›
                  </Text>
                </View>
              </TouchableOpacity>
            )
          )
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🧰
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No upcoming jobs
            </Text>

            <Text
              style={styles.emptyText}
            >
              Accepted bookings will appear
              here.
            </Text>
          </View>
        )}

        {/* COMPLETED SUMMARY */}

        <View
          style={styles.completedSummary}
        >
          <Text
            style={styles.completedIcon}
          >
            ✅
          </Text>

          <View
            style={styles.completedContent}
          >
            <Text
              style={
                styles.completedTitle
              }
            >
              {completedJobs.length} Completed{" "}
              {completedJobs.length === 1
                ? "Job"
                : "Jobs"}
            </Text>

            <Text
              style={
                styles.completedDescription
              }
            >
              Total earnings: Rs.{" "}
              {totalEarnings.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/provider/jobs"
              )
            }
          >
            <Text
              style={
                styles.completedArrow
              }
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D47C7",
  },

  location: {
    marginTop: 3,
    fontSize: 12,
    color: "#334155",
    maxWidth: 240,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  notification: {
    fontSize: 21,
  },

  smallAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarEmoji: {
    fontSize: 20,
  },

  welcomeCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  welcomeTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  providerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  providerEmoji: {
    fontSize: 26,
  },

  welcomeContent: {
    flex: 1,
    marginLeft: 12,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  welcomeSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#059669",
    marginRight: 6,
  },

  availableText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },

  zoneRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  zoneText: {
    flex: 1,
    paddingRight: 10,
    fontSize: 12,
    color: "#334155",
  },

  changeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  statsRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 105,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
  },

  statIcon: {
    fontSize: 20,
  },

  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  statValue: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#475569",
  },

  newBadge: {
    marginLeft: 5,
    backgroundColor: "#FED7AA",
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 8,
    fontWeight: "700",
    color: "#92400E",
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },

  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  requestTitleArea: {
    flex: 1,
    paddingRight: 10,
  },

  requestTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  requestDate: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  requestPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  priceLabel: {
    fontSize: 9,
    color: "#64748B",
    textAlign: "right",
  },

  requestLocation: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
  },

  customerRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  customerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  customerInitials: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },

  customerInfo: {
    flex: 1,
    marginLeft: 10,
  },

  customerName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  rating: {
    marginTop: 2,
    fontSize: 10,
    color: "#64748B",
  },

  paymentBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },

  paymentText: {
    fontSize: 9,
    color: "#92400E",
    fontWeight: "700",
  },

  requestButtons: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  detailsText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 13,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: "#1D4ED8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  acceptText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  jobTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  jobTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  confirmedBadge: {
    backgroundColor: "#A7F3D0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  confirmedText: {
    fontSize: 9,
    color: "#065F46",
    fontWeight: "700",
  },

  jobPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  jobDate: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  jobBottom: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  jobLocation: {
    flex: 1,
    fontSize: 11,
    color: "#64748B",
  },

  jobAction: {
    fontSize: 18,
    color: "#2563EB",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 30,
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 11,
    textAlign: "center",
    color: "#64748B",
  },

  completedSummary: {
    marginTop: 18,
    backgroundColor: "#0D47C7",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  completedIcon: {
    fontSize: 22,
  },

  completedContent: {
    flex: 1,
    marginLeft: 12,
  },

  completedTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  completedDescription: {
    marginTop: 2,
    color: "#BFDBFE",
    fontSize: 11,
  },

  completedArrow: {
    color: "#FFFFFF",
    fontSize: 24,
  },
});