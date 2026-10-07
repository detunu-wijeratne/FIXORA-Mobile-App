import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import CustomerBottomNav from "../components/CustomerBottomNav";


import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";

type Booking = {
  id: string;
  customerId?: string;

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

  reviewId?: string;
  reviewed?: boolean;
};

export default function BookingDetailsScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string"
      ? params.bookingId
      : "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    if (!bookingId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "bookings", bookingId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setBooking(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setBooking({
          id: snapshot.id,
          ...data,
        } as Booking);

        setLoading(false);
      },
      (error) => {
        console.log("Booking details error:", error);

        alert(
          error.message ||
            "Unable to load booking details."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookingId]);

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

    if (status === "cancelled") {
      return "Cancelled";
    }

    if (status === "confirmed") {
      return "Confirmed";
    }

    return "Pending";
  };

  const handleCancelBooking = () => {
    if (!bookingId) return;

    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "Keep Booking",
          style: "cancel",
        },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelling(true);

              await updateDoc(
                doc(db, "bookings", bookingId),
                {
                  status: "cancelled",
                  cancelledAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                }
              );

              Alert.alert(
                "Booking Cancelled",
                "Your booking has been cancelled."
              );
            } catch (error: any) {
              console.log(
                "Cancel booking error:",
                error
              );

              Alert.alert(
                "Error",
                error.message ||
                  "Unable to cancel booking."
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading booking...
        </Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📭</Text>

        <Text style={styles.emptyTitle}>
          Booking not found
        </Text>
      </View>
    );
  }

  const status = booking.status || "pending";

  const canChat =
    status === "confirmed" ||
    status === "in_progress" ||
    status === "completed";

  const canReview = status === "completed";

  const canCancel = status === "pending";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            Booking Details
          </Text>

          <View
            style={[
              styles.statusBadge,

              status === "confirmed" &&
                styles.confirmedBadge,

              status === "in_progress" &&
                styles.progressBadge,

              status === "completed" &&
                styles.completedBadge,

              (status === "declined" ||
                status === "cancelled") &&
                styles.declinedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,

                status === "confirmed" &&
                  styles.confirmedText,

                status === "in_progress" &&
                  styles.progressText,

                status === "completed" &&
                  styles.completedText,

                (status === "declined" ||
                  status === "cancelled") &&
                  styles.declinedText,
              ]}
            >
              {getStatusLabel(status)}
            </Text>
          </View>
        </View>

        <Text style={styles.bookingId}>
          Booking ID: {booking.id}
        </Text>

        <View style={styles.providerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              👨‍🔧
            </Text>
          </View>

          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>
              {booking.providerName ||
                "Service Provider"}
            </Text>

            <Text style={styles.providerService}>
              {booking.service || "Home Service"}
            </Text>

            <Text style={styles.verified}>
              ✓ Verified Provider
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Service Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Service
            </Text>

            <Text style={styles.value}>
              {booking.service || "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Date
            </Text>

            <Text style={styles.value}>
              October {booking.date || "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Time
            </Text>

            <Text style={styles.value}>
              {booking.time || "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Service Price
            </Text>

            <Text style={styles.value}>
              Rs.{" "}
              {Number(
                booking.servicePrice || 0
              ).toLocaleString()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Platform Fee
            </Text>

            <Text style={styles.value}>
              Rs.{" "}
              {Number(
                booking.platformFee || 0
              ).toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              Rs.{" "}
              {Number(
                booking.totalAmount || 0
              ).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Service Location
          </Text>

          <Text style={styles.description}>
            📍{" "}
            {booking.address ||
              "Location not provided"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Problem Description
          </Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.description}>
              {booking.description ||
                "No description provided"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Booking Progress
          </Text>

          <View style={styles.progressItem}>
            <View style={styles.activeDot} />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Booking Requested
              </Text>

              <Text style={styles.progressDescription}>
                Your request was sent to the provider.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View
              style={
                status === "confirmed" ||
                status === "in_progress" ||
                status === "completed"
                  ? styles.activeDot
                  : styles.inactiveDot
              }
            />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Provider Confirmed
              </Text>

              <Text style={styles.progressDescription}>
                Your provider accepted the booking.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View
              style={
                status === "in_progress" ||
                status === "completed"
                  ? styles.activeDot
                  : styles.inactiveDot
              }
            />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Service In Progress
              </Text>

              <Text style={styles.progressDescription}>
                The provider has started the job.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View
              style={
                status === "completed"
                  ? styles.activeDot
                  : styles.inactiveDot
              }
            />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Completed
              </Text>

              <Text style={styles.progressDescription}>
                Service work has been completed.
              </Text>
            </View>
          </View>
        </View>

        {canChat && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              router.push({
                pathname: "/customer-chat",
                params: {
                  bookingId: booking.id,
                  provider:
                    booking.providerName ||
                    "Provider",
                },
              })
            }
          >
            <Text style={styles.chatButtonText}>
              💬 Chat with Provider
            </Text>
          </TouchableOpacity>
        )}

        {canReview && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() =>
              router.push({
                pathname: "/rate-review",
                params: {
                  bookingId: booking.id,
                  providerId:
                    booking.providerId || "",
                  provider:
                    booking.providerName ||
                    "Provider",
                  service:
                    booking.service ||
                    "Home Service",
                  reviewId: booking.reviewId || "",
                },
              })
            }
          >
            <Text style={styles.reviewButtonText}>
              {booking.reviewed
                ? "⭐ View / Edit Review"
                : "⭐ Rate & Review"}
            </Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              cancelling && styles.disabledButton,
            ]}
            disabled={cancelling}
            onPress={handleCancelBooking}
          >
            <Text style={styles.cancelButtonText}>
              {cancelling
                ? "Cancelling..."
                : "Cancel Booking"}
            </Text>
          </TouchableOpacity>
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

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7FC",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  bookingId: {
    marginTop: 6,
    fontSize: 10,
    color: "#94A3B8",
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
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

  providerCard: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 27,
  },

  providerInfo: {
    marginLeft: 12,
  },

  providerName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  providerService: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  verified: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  section: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
  },

  value: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  divider: {
    marginTop: 14,
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  totalValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563EB",
  },

  descriptionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
  },

  description: {
    fontSize: 12,
    lineHeight: 19,
    color: "#475569",
  },

  progressItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
    backgroundColor: "#2563EB",
  },

  inactiveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },

  progressInfo: {
    flex: 1,
    marginLeft: 12,
  },

  progressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  progressDescription: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  progressLine: {
    width: 2,
    height: 27,
    marginLeft: 6,
    marginVertical: 4,
    backgroundColor: "#CBD5E1",
  },

  chatButton: {
    marginTop: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  chatButtonText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  reviewButton: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  reviewButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  cancelButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#DC2626",
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },
});