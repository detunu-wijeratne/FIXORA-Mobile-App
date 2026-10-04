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
  description?: string;
  address?: string;

  servicePrice?: number;
  platformFee?: number;
  totalAmount?: number;

  status?: string;
};

export default function ProviderRequestsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    console.log(
      "Logged provider UID:",
      user.uid
    );

    /*
      Load only bookings assigned to this provider.

      We only use providerId in the Firestore query.
      Then we filter pending bookings locally.

      This avoids needing a Firestore composite index.
    */
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,

      (snapshot) => {
        console.log(
          "Bookings assigned to provider:",
          snapshot.docs.length
        );

        const loadedBookings: Booking[] =
          snapshot.docs
            .map((bookingDoc) => {
              const data = bookingDoc.data();

              console.log(
                "Provider booking:",
                bookingDoc.id,
                data
              );

              return {
                id: bookingDoc.id,
                ...data,
              } as Booking;
            })
            .filter(
              (booking) =>
                booking.status === "pending"
            );

        console.log(
          "Pending requests:",
          loadedBookings.length
        );

        setBookings(loadedBookings);
        setLoading(false);
      },

      (error) => {
        console.log(
          "Error loading provider requests:",
          error
        );

        alert(
          error.message ||
            "Unable to load booking requests."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>
          Incoming Requests
        </Text>

        <Text style={styles.subtitle}>
          Review new customer service requests.
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                styles.activeTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>
              Tomorrow
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
              Loading requests...
            </Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              📭
            </Text>

            <Text style={styles.emptyTitle}>
              No pending requests
            </Text>

            <Text style={styles.emptyText}>
              There are currently no pending
              bookings assigned to you.
            </Text>
          </View>
        ) : (
          <View style={styles.requestList}>
            {bookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.requestCard}
                onPress={() =>
                  router.push({
                    pathname:
                      "/provider/request-details",

                    params: {
                      bookingId: booking.id,

                      customer:
                        booking.customerName ||
                        "Customer",

                      phone:
                        booking.customerPhone ||
                        "",

                      email:
                        booking.customerEmail ||
                        "",

                      service:
                        booking.service ||
                        "Home Service",

                      date:
                        booking.date ||
                        "",

                      time:
                        booking.time ||
                        "",

                      location:
                        booking.address ||
                        "",

                      description:
                        booking.description ||
                        "",

                      price: String(
                        booking.servicePrice ||
                          0
                      ),

                      totalAmount: String(
                        booking.totalAmount ||
                          0
                      ),

                      status:
                        booking.status ||
                        "pending",
                    },
                  })
                }
              >
                <View style={styles.cardTop}>
                  <View
                    style={styles.serviceIcon}
                  >
                    <Text
                      style={
                        styles.serviceEmoji
                      }
                    >
                      🔧
                    </Text>
                  </View>

                  <View
                    style={styles.requestInfo}
                  >
                    <Text
                      style={
                        styles.serviceTitle
                      }
                    >
                      {booking.service ||
                        "Home Service"}
                    </Text>

                    <Text
                      style={
                        styles.customerName
                      }
                    >
                      {booking.customerName ||
                        "Customer"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.pendingBadge
                    }
                  >
                    <Text
                      style={
                        styles.pendingText
                      }
                    >
                      Pending
                    </Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <Text
                    style={styles.detailText}
                  >
                    📅 October{" "}
                    {booking.date || "-"} •{" "}
                    {booking.time || "-"}
                  </Text>

                  <Text
                    style={styles.detailText}
                  >
                    📍{" "}
                    {booking.address ||
                      "Location not provided"}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <View>
                    <Text
                      style={
                        styles.priceLabel
                      }
                    >
                      Estimated Service
                    </Text>

                    <Text style={styles.price}>
                      Rs.{" "}
                      {Number(
                        booking.servicePrice ||
                          0
                      ).toLocaleString()}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.viewDetails
                    }
                  >
                    View Details →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <ProviderBottomNav />
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
    alignItems: "center",
    paddingVertical: 9,
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
    color: "#1D4ED8",
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

  requestList: {
    marginTop: 16,
    gap: 12,
  },

  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceEmoji: {
    fontSize: 21,
  },

  requestInfo: {
    flex: 1,
    marginLeft: 11,
  },

  serviceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  customerName: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  pendingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400E",
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