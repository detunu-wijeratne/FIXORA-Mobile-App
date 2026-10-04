import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  doc,
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

import { db } from "../../services/firebase";

export default function ProviderRequestDetailsScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string"
      ? params.bookingId
      : "";

  const customer =
    typeof params.customer === "string"
      ? params.customer
      : "Customer";

  const phone =
    typeof params.phone === "string"
      ? params.phone
      : "";

  const email =
    typeof params.email === "string"
      ? params.email
      : "";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Home Service";

  const date =
    typeof params.date === "string"
      ? params.date
      : "";

  const time =
    typeof params.time === "string"
      ? params.time
      : "";

  const location =
    typeof params.location === "string"
      ? params.location
      : "";

  const description =
    typeof params.description === "string"
      ? params.description
      : "No description provided";

  const price =
    typeof params.price === "string"
      ? params.price
      : "0";

  const totalAmount =
    typeof params.totalAmount === "string"
      ? params.totalAmount
      : "0";

  const [status, setStatus] = useState(
    typeof params.status === "string"
      ? params.status
      : "pending"
  );

  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found.");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          status: "confirmed",
          acceptedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      setStatus("confirmed");

      Alert.alert(
        "Booking Accepted",
        "The booking has been accepted successfully.",
        [
          {
            text: "View Jobs",
            onPress: () =>
              router.replace("/provider/jobs"),
          },
        ]
      );
    } catch (error: any) {
      console.log("Accept booking error:", error);

      Alert.alert(
        "Error",
        error.message || "Unable to accept booking."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found.");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          status: "declined",
          declinedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      setStatus("declined");

      Alert.alert(
        "Booking Declined",
        "The booking has been declined.",
        [
          {
            text: "Back to Requests",
            onPress: () =>
              router.replace("/provider/requests"),
          },
        ]
      );
    } catch (error: any) {
      console.log("Decline booking error:", error);

      Alert.alert(
        "Error",
        error.message || "Unable to decline booking."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statusRow}>
          <Text style={styles.requestId}>
            Booking Request
          </Text>

          <View
            style={[
              styles.statusBadge,
              status === "confirmed" &&
                styles.confirmedBadge,
              status === "declined" &&
                styles.declinedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === "confirmed" &&
                  styles.confirmedText,
                status === "declined" &&
                  styles.declinedText,
              ]}
            >
              {status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Service Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{service}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              October {date}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{time}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Estimated Service
            </Text>
            <Text style={styles.value}>
              Rs. {Number(price).toLocaleString()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Customer Total
            </Text>
            <Text style={styles.totalValue}>
              Rs. {Number(totalAmount).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Customer
          </Text>

          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {customer
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {customer}
              </Text>

              {phone ? (
                <Text style={styles.customerDetail}>
                  📞 {phone}
                </Text>
              ) : null}

              {email ? (
                <Text style={styles.customerDetail}>
                  ✉️ {email}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Service Location
          </Text>

          <Text style={styles.description}>
            📍 {location || "Location not provided"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Problem Description
          </Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.description}>
              {description}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Customer Photos
          </Text>

          <View style={styles.photoRow}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>🖼️</Text>
              <Text style={styles.photoText}>
                Photo 1
              </Text>
            </View>

            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>🖼️</Text>
              <Text style={styles.photoText}>
                Photo 2
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {status === "pending" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.declineButton,
              loading && styles.disabledButton,
            ]}
            disabled={loading}
            onPress={handleDecline}
          >
            <Text style={styles.declineText}>
              {loading ? "Please wait..." : "Decline"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              loading && styles.disabledButton,
            ]}
            disabled={loading}
            onPress={handleAccept}
          >
            <Text style={styles.acceptText}>
              {loading ? "Please wait..." : "Accept Request"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "confirmed" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.fullButton}
            onPress={() =>
              router.replace("/provider/jobs")
            }
          >
            <Text style={styles.acceptText}>
              View My Jobs
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "declined" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.fullButton}
            onPress={() =>
              router.replace("/provider/requests")
            }
          >
            <Text style={styles.acceptText}>
              Back to Requests
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 120,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  requestId: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
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

  declinedBadge: {
    backgroundColor: "#FEE2E2",
  },

  declinedText: {
    color: "#B91C1C",
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

  totalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
  },

  customerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  customerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  customerDetail: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
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

  photoRow: {
    flexDirection: "row",
    gap: 10,
  },

  photoPlaceholder: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  photoIcon: {
    fontSize: 25,
  },

  photoText: {
    marginTop: 4,
    fontSize: 10,
    color: "#64748B",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    gap: 10,
  },

  declineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  declineText: {
    color: "#DC2626",
    fontWeight: "800",
  },

  acceptButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  fullButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  acceptText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },
});