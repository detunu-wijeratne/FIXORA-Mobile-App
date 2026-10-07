import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LoadingState from "../components/LoadingState";
import PrimaryButton from "../components/PrimaryButton";
import StatusBadge, { StatusType } from "../components/StatusBadge";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

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
};

export default function BookingDetailsScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string" ? params.bookingId : "";

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
        alert(error.message || "Unable to load booking details.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookingId]);

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

              await updateDoc(doc(db, "bookings", bookingId), {
                status: "cancelled",
                cancelledAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });

              Alert.alert("Booking Cancelled", "Your booking has been cancelled.");
            } catch (error: any) {
              console.log("Cancel booking error:", error);

              Alert.alert(
                "Error",
                error.message || "Unable to cancel booking."
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
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centerContainer} edges={["top"]}>
          <LoadingState label="Loading booking..." />
        </SafeAreaView>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centerContainer} edges={["top"]}>
          <Ionicons name="file-tray-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Booking not found</Text>
        </SafeAreaView>
      </>
    );
  }

  const status = (booking.status || "pending") as StatusType;

  const canChat =
    status === "confirmed" || status === "in_progress" || status === "completed";

  const canReview = status === "completed";

  const canCancel = status === "pending";
  const canEdit = status === "pending";

  const stageActive = {
    requested: true,
    confirmed: status === "confirmed" || status === "in_progress" || status === "completed",
    inProgress: status === "in_progress" || status === "completed",
    completed: status === "completed",
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Booking Details</Text>
          <StatusBadge status={status} />
        </View>

        <Text style={styles.bookingId}>Booking ID: {booking.id}</Text>

        <View style={styles.providerCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={26} color={colors.primary} />
          </View>

          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>
              {booking.providerName || "Service Provider"}
            </Text>

            <Text style={styles.providerService}>
              {booking.service || "Home Service"}
            </Text>

            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
              <Text style={styles.verified}>Verified Provider</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{booking.service || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>October {booking.date || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{booking.time || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Service Price</Text>
            <Text style={styles.value}>
              Rs. {Number(booking.servicePrice || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Platform Fee</Text>
            <Text style={styles.value}>
              Rs. {Number(booking.platformFee || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rs. {Number(booking.totalAmount || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>

          <View style={styles.inlineRow}>
            <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.description}>
              {booking.address || "Location not provided"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.description}>
              {booking.description || "No description provided"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Progress</Text>

          <View style={styles.progressItem}>
            <View style={styles.activeDot} />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Booking Requested</Text>
              <Text style={styles.progressDescription}>
                Your request was sent to the provider.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View style={stageActive.confirmed ? styles.activeDot : styles.inactiveDot} />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Provider Confirmed</Text>
              <Text style={styles.progressDescription}>
                Your provider accepted the booking.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View style={stageActive.inProgress ? styles.activeDot : styles.inactiveDot} />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Service In Progress</Text>
              <Text style={styles.progressDescription}>
                The provider has started the job.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View style={stageActive.completed ? styles.activeDot : styles.inactiveDot} />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Completed</Text>
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
                  provider: booking.providerName || "Provider",
                },
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            <Text style={styles.chatButtonText}>Chat with Provider</Text>
          </TouchableOpacity>
        )}

        {canReview && (
          <PrimaryButton
            title="Rate & Review"
            icon="star"
            style={styles.reviewButton}
            onPress={() =>
              router.push({
                pathname: "/rate-review",
                params: {
                  bookingId: booking.id,
                  providerId: booking.providerId || "",
                  provider: booking.providerName || "Provider",
                  service: booking.service || "Home Service",
                },
              })
            }
          />
        )}

        {canEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/edit-booking",
                params: { bookingId: booking.id },
              })
            }
          >
            <Ionicons name="pencil-outline" size={16} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit Booking</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.disabledButton]}
            disabled={cancelling}
            onPress={handleCancelBooking}
          >
            <Text style={styles.cancelButtonText}>
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Text>
          </TouchableOpacity>
        )}
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

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    ...typography.pageTitle,
    fontSize: 22,
  },

  bookingId: {
    marginTop: spacing.xs + 2,
    fontSize: 10,
    color: colors.textMuted,
  },

  providerCard: {
    marginTop: spacing.xl,
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  providerInfo: {
    marginLeft: spacing.md,
  },

  providerName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  providerService: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textSecondary,
  },

  verifiedRow: {
    marginTop: spacing.xs + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  verified: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },

  section: {
    marginTop: spacing.md + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.sm + 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm + 2,
  },

  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  value: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  divider: {
    marginTop: spacing.md,
    height: 1,
    backgroundColor: colors.border,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  totalValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },

  inlineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  descriptionBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  description: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
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
    backgroundColor: colors.primary,
  },

  inactiveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },

  progressInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  progressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  progressDescription: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textSecondary,
  },

  progressLine: {
    width: 2,
    height: 27,
    marginLeft: 6,
    marginVertical: spacing.xs,
    backgroundColor: colors.borderStrong,
  },

  chatButton: {
    marginTop: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
  },

  chatButtonText: {
    color: colors.primary,
    fontWeight: "800",
  },

  reviewButton: {
    marginTop: spacing.md,
  },

  editButton: {
    marginTop: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
  },

  editButtonText: {
    color: colors.primary,
    fontWeight: "800",
  },

  cancelButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: "center",
  },

  cancelButtonText: {
    color: colors.error,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },
});
