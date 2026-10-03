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

export default function ProviderJobDetailsScreen() {
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

  const initialStatus =
    typeof params.status === "string"
      ? params.status
      : "Confirmed";

  const [status, setStatus] = useState(initialStatus);

  const startJob = () => {
    setStatus("In Progress");
    Alert.alert("Job Started", "The job status is now In Progress.");
  };

  const completeJob = () => {
    setStatus("Completed");
    Alert.alert(
      "Job Completed",
      "The job has been marked as completed."
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
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text style={styles.statusValue}>{status}</Text>
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

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() =>
                router.push({
                  pathname: "/provider/chat",
                  params: {
                    customer,
                  },
                })
              }
            >
              <Text style={styles.chatText}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>

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
            <Text style={styles.label}>Payout</Text>
            <Text style={styles.priceValue}>{payout}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>

          <View style={styles.locationBox}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem Description</Text>

          <Text style={styles.description}>
            Water is leaking from the pipe under the kitchen sink. Please check
            the connection and repair or replace the damaged section.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Progress</Text>

          <View style={styles.progressItem}>
            <View style={styles.completeDot} />
            <View style={styles.progressContent}>
              <Text style={styles.progressTitle}>Booking Confirmed</Text>
              <Text style={styles.progressText}>
                Customer booking was accepted.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View
              style={
                status === "In Progress" || status === "Completed"
                  ? styles.completeDot
                  : styles.pendingDot
              }
            />
            <View style={styles.progressContent}>
              <Text style={styles.progressTitle}>Job Started</Text>
              <Text style={styles.progressText}>
                {status === "Confirmed"
                  ? "Waiting for provider to start."
                  : "Service work has started."}
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View
              style={
                status === "Completed"
                  ? styles.completeDot
                  : styles.pendingDot
              }
            />
            <View style={styles.progressContent}>
              <Text style={styles.progressTitle}>Job Completed</Text>
              <Text style={styles.progressText}>
                {status === "Completed"
                  ? "Service has been completed."
                  : "Completion is still pending."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {status === "Confirmed" && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={startJob}
          >
            <Text style={styles.primaryButtonText}>Start Job</Text>
          </TouchableOpacity>
        )}

        {status === "In Progress" && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={completeJob}
          >
            <Text style={styles.primaryButtonText}>
              Mark as Completed
            </Text>
          </TouchableOpacity>
        )}

        {status === "Completed" && (
          <View style={styles.completedBox}>
            <Text style={styles.completedText}>✓ Job Completed</Text>
          </View>
        )}
      </View>
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
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  statusValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  payout: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  section: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
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
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "800",
  },

  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  rating: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  chatButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  chatText: {
    fontSize: 19,
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

  progressItem: {
    flexDirection: "row",
    marginTop: 16,
  },

  completeDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#16A34A",
  },

  pendingDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },

  progressLine: {
    width: 2,
    height: 26,
    backgroundColor: "#E2E8F0",
    marginLeft: 8,
  },

  progressContent: {
    flex: 1,
    marginLeft: 12,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  progressText: {
    marginTop: 3,
    fontSize: 12,
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
  },

  primaryButton: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  completeButton: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  completedBox: {
    backgroundColor: "#DCFCE7",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  completedText: {
    color: "#16A34A",
    fontWeight: "800",
  },
});