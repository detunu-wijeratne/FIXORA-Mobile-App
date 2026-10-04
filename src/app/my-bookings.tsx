import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerBottomNav from "../components/CustomerBottomNav";
import { auth, db } from "../services/firebase";

type Booking = {
  id: string;

  customerId?: string;
  providerName?: string;

  service?: string;
  date?: string;
  time?: string;
  address?: string;
  description?: string;

  servicePrice?: number;
  totalAmount?: number;

  status?: string;
};

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] =
    useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const loadedBookings: Booking[] =
          snapshot.docs.map((bookingDoc) => ({
            id: bookingDoc.id,
            ...bookingDoc.data(),
          })) as Booking[];

        setBookings(loadedBookings);
        setLoading(false);
      },
      (error) => {
        console.log(
          "Error loading customer bookings:",
          error
        );

        alert(
          error.message ||
            "Unable to load your bookings."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (selectedTab === "all") {
      return true;
    }

    if (selectedTab === "active") {
      return (
        booking.status === "pending" ||
        booking.status === "confirmed" ||
        booking.status === "in_progress"
      );
    }

    if (selectedTab === "completed") {
      return booking.status === "completed";
    }

    return true;
  });

  const getStatusLabel = (status?: string) => {
    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "declined") {
      return "Declined";
    }

    if (status === "confirmed") {
      return "Confirmed";
    }

    return "Pending";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>My Bookings</Text>

        <Text style={styles.subtitle}>
          Track your current and previous service bookings.
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "all" &&
                styles.activeTab,
            ]}
            onPress={() => setSelectedTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "all" &&
                  styles.activeTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "active" &&
                styles.activeTab,
            ]}
            onPress={() => setSelectedTab("active")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "active" &&
                  styles.activeTabText,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "completed" &&
                styles.activeTab,
            ]}
            onPress={() => setSelectedTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "completed" &&
                  styles.activeTabText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text style={styles.loadingText}>
              Loading bookings...
            </Text>
          </View>
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>

            <Text style={styles.emptyTitle}>
              No bookings found
            </Text>

            <Text style={styles.emptyText}>
              Your service bookings will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.bookingList}>
            {filteredBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() =>
                  router.push({
                    pathname: "/booking-details",
                    params: {
                      bookingId: booking.id,

                      provider:
                        booking.providerName ||
                        "Provider",

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
                        booking.status ||
                        "pending",
                    },
                  })
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <Text style={styles.icon}>
                      🔧
                    </Text>
                  </View>

                  <View style={styles.bookingInfo}>
                    <Text style={styles.serviceTitle}>
                      {booking.service ||
                        "Home Service"}
                    </Text>

                    <Text style={styles.providerName}>
                      {booking.providerName ||
                        "Provider"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,

                      booking.status ===
                        "confirmed" &&
                        styles.confirmedBadge,

                      booking.status ===
                        "in_progress" &&
                        styles.progressBadge,

                      booking.status ===
                        "completed" &&
                        styles.completedBadge,

                      booking.status ===
                        "declined" &&
                        styles.declinedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,

                        booking.status ===
                          "confirmed" &&
                          styles.confirmedText,

                        booking.status ===
                          "in_progress" &&
                          styles.progressText,

                        booking.status ===
                          "completed" &&
                          styles.completedText,

                        booking.status ===
                          "declined" &&
                          styles.declinedText,
                      ]}
                    >
                      {getStatusLabel(
                        booking.status
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <Text style={styles.detailText}>
                    📅 October{" "}
                    {booking.date || "-"} •{" "}
                    {booking.time || "-"}
                  </Text>

                  <Text style={styles.detailText}>
                    📍{" "}
                    {booking.address ||
                      "Location not provided"}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <View>
                    <Text style={styles.priceLabel}>
                      Estimated Total
                    </Text>

                    <Text style={styles.price}>
                      Rs.{" "}
                      {Number(
                        booking.totalAmount || 0
                      ).toLocaleString()}
                    </Text>
                  </View>

                  <Text style={styles.viewDetails}>
                    View Details →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <CustomerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
  },

  tabs: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 9,
  },

  activeTab: {
    backgroundColor: "#FFFFFF",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  activeTabText: {
    color: "#2563EB",
  },

  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },

  emptyCard: {
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  emptyIcon: {
    fontSize: 38,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },

  bookingList: {
    marginTop: 16,
    gap: 12,
  },

  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 21,
  },

  bookingInfo: {
    flex: 1,
    marginLeft: 11,
  },

  serviceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  providerName: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#92400E",
  },

  confirmedBadge: {
    backgroundColor: "#DCFCE7",
  },

  confirmedText: {
    color: "#166534",
  },

  progressBadge: {
    backgroundColor: "#DBEAFE",
  },

  progressText: {
    color: "#1D4ED8",
  },

  completedBadge: {
    backgroundColor: "#E2E8F0",
  },

  completedText: {
    color: "#475569",
  },

  declinedBadge: {
    backgroundColor: "#FEE2E2",
  },

  declinedText: {
    color: "#B91C1C",
  },

  details: {
    marginTop: 14,
    gap: 6,
  },

  detailText: {
    fontSize: 12,
    color: "#475569",
  },

  bottomRow: {
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceLabel: {
    fontSize: 10,
    color: "#64748B",
  },

  price: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  viewDetails: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
});