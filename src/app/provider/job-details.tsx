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

export default function ProviderJobDetailsScreen() {
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
      : "confirmed"
  );

  const [loading, setLoading] = useState(false);

  const handleStartJob = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found.");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          status: "in_progress",
          startedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      setStatus("in_progress");

      Alert.alert(
        "Job Started",
        "The job status is now In Progress."
      );
    } catch (error: any) {
      console.log("Start job error:", error);

      Alert.alert(
        "Error",
        error.message || "Unable to start job."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found.");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          status: "completed",
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      setStatus("completed");

      Alert.alert(
        "Job Completed",
        "The job has been marked as completed."
      );
    } catch (error: any) {
      console.log("Complete job error:", error);

      Alert.alert(
        "Error",
        error.message || "Unable to complete job."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = () => {
    if (status === "in_progress") {
      return "IN PROGRESS";
    }

    if (status === "completed") {
      return "COMPLETED";
    }

    return "CONFIRMED";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Job Details</Text>

          <View
            style={[
              styles.statusBadge,
              status === "in_progress" &&
                styles.progressBadge,
              status === "completed" &&
                styles.completedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === "in_progress" &&
                  styles.progressText,
                status === "completed" &&
                  styles.completedText,
              ]}
            >
              {getStatusLabel()}
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
              Service Price
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

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              router.push({
                pathname: "/provider/chat",
                params: {
                  bookingId,
                  customer,
                },
              })
            }
          >
            <Text style={styles.chatButtonText}>
              💬 Chat with Customer
            </Text>
          </TouchableOpacity>
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
            Job Progress
          </Text>

          <View style={styles.progressItem}>
            <View style={styles.progressDotActive} />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Booking Confirmed
              </Text>

              <Text style={styles.progressDescription}>
                Provider accepted the customer request.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View
              style={
                status === "in_progress" ||
                status === "completed"
                  ? styles.progressDotActive
                  : styles.progressDot
              }
            />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Job In Progress
              </Text>

              <Text style={styles.progressDescription}>
                Service work has started.
              </Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressItem}>
            <View
              style={
                status === "completed"
                  ? styles.progressDotActive
                  : styles.progressDot
              }
            />

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Job Completed
              </Text>

              <Text style={styles.progressDescription}>
                Service work has been completed.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {status === "confirmed" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
            disabled={loading}
            onPress={handleStartJob}
          >
            <Text style={styles.primaryButtonText}>
              {loading
                ? "Starting Job..."
                : "Start Job"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "in_progress" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
            disabled={loading}
            onPress={handleCompleteJob}
          >
            <Text style={styles.primaryButtonText}>
              {loading
                ? "Completing Job..."
                : "Mark as Completed"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "completed" && (
        <View style={styles.bottomBar}>
          <View style={styles.completedBox}>
            <Text style={styles.completedBoxText}>
              ✓ Job Completed
            </Text>
          </View>
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
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
    fontSize: 12,
    textAlign: "right",
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

  chatButton: {
    marginTop: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },

  chatButtonText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
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

  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    marginTop: 2,
  },

  progressDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2563EB",
    marginTop: 2,
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
    height: 28,
    backgroundColor: "#CBD5E1",
    marginLeft: 6,
    marginVertical: 4,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 14,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  completedBox: {
    backgroundColor: "#DCFCE7",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  completedBoxText: {
    color: "#166534",
    fontWeight: "800",
  },
});