import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RequestDetailsScreen() {
  const params = useLocalSearchParams();

  const customer =
    typeof params.customer === "string"
      ? params.customer
      : "Suresh Kumar";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Leak Repair & Pipe Diagnostics";

  const date =
    typeof params.date === "string"
      ? params.date
      : "16 Apr 2025";

  const time =
    typeof params.time === "string"
      ? params.time
      : "10:00 AM";

  const location =
    typeof params.location === "string"
      ? params.location
      : "Kollupitiya, Colombo 03";

  const payout =
    typeof params.payout === "string"
      ? params.payout
      : "Rs. 3,500";

  const [status, setStatus] = useState<"pending" | "accepted" | "declined">(
    "pending"
  );

  const acceptRequest = () => {
    setStatus("accepted");

    Alert.alert(
      "Request Accepted",
      "This booking has been added to your jobs.",
      [
        {
          text: "View Jobs",
          onPress: () => router.replace("/provider/jobs"),
        },
      ]
    );
  };

  const declineRequest = () => {
    setStatus("declined");

    Alert.alert(
      "Request Declined",
      "The booking request has been declined.",
      [
        {
          text: "Back to Requests",
          onPress: () => router.replace("/provider/requests"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLabel}>Request Status</Text>

            <Text
              style={[
                styles.statusValue,
                status === "accepted" && styles.acceptedStatus,
                status === "declined" && styles.declinedStatus,
              ]}
            >
              {status === "pending"
                ? "Awaiting Response"
                : status === "accepted"
                ? "Accepted"
                : "Declined"}
            </Text>
          </View>

          <Text style={styles.payout}>{payout}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>

          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SK</Text>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer}</Text>
              <Text style={styles.rating}>⭐ 4.9 · 12 reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{service}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{time}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Estimated Payout</Text>
            <Text style={styles.priceValue}>{payout}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.locationBox}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Description</Text>

          <Text style={styles.description}>
            There is a water leak under the kitchen sink. Water starts dripping
            when the tap is used. Please inspect the pipe connection and repair
            it if possible.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>

          <View style={styles.photoRow}>
            <View style={styles.photoBox}>
              <Text style={styles.photoEmoji}>🚰</Text>
              <Text style={styles.photoText}>Leak photo</Text>
            </View>

            <View style={styles.photoBox}>
              <Text style={styles.photoEmoji}>🔧</Text>
              <Text style={styles.photoText}>Pipe photo</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {status === "pending" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={declineRequest}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={acceptRequest}
          >
            <Text style={styles.acceptText}>Accept Request</Text>
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

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  statusValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: "#D97706",
  },

  acceptedStatus: {
    color: "#16A34A",
  },

  declinedStatus: {
    color: "#DC2626",
  },

  payout: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  section: {
    marginTop: 14,
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
  },

  customerRow: {
    marginTop: 14,
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
    fontSize: 12,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  customerInfo: {
    marginLeft: 12,
  },

  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  rating: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  row: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 13,
    color: "#64748B",
  },

  value: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },

  priceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  locationBox: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  locationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  description: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 21,
    color: "#475569",
  },

  photoRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  photoBox: {
    flex: 1,
    height: 100,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  photoEmoji: {
    fontSize: 28,
  },

  photoText: {
    marginTop: 5,
    fontSize: 11,
    color: "#64748B",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },

  declineButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DC2626",
    alignItems: "center",
  },

  declineText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },

  acceptButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
  },

  acceptText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});