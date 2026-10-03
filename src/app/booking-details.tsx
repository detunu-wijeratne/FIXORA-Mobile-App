import { router, useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingDetailsScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.id === "string" ? params.id : "BK001";

  const provider =
    typeof params.provider === "string"
      ? params.provider
      : "Kamal Perera";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Plumbing";

  const date =
    typeof params.date === "string"
      ? params.date
      : "October 5";

  const time =
    typeof params.time === "string"
      ? params.time
      : "9:30 AM";

  const status =
    typeof params.status === "string"
      ? params.status
      : "Pending";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statusCard}>
          <Text style={styles.bookingId}>Booking #{bookingId}</Text>

          <Text style={styles.statusTitle}>{status}</Text>

          <Text style={styles.statusDescription}>
            {status === "Pending"
              ? "Waiting for the service provider to accept your request."
              : status === "Confirmed"
              ? "Your service provider has confirmed the booking."
              : "This booking has been completed."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider</Text>

          <View style={styles.providerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👨‍🔧</Text>
            </View>

            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider}</Text>
              <Text style={styles.providerService}>{service}</Text>
              <Text style={styles.verified}>✓ Verified Provider</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>

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
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>Colombo 03</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Progress</Text>

          <View style={styles.timelineItem}>
            <View style={styles.completedCircle} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Booking Submitted</Text>
              <Text style={styles.timelineText}>
                Your booking request was created.
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View
              style={
                status === "Confirmed" || status === "Completed"
                  ? styles.completedCircle
                  : styles.pendingCircle
              }
            />

            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Provider Confirmation</Text>
              <Text style={styles.timelineText}>
                {status === "Pending"
                  ? "Waiting for provider approval."
                  : "Provider accepted the booking."}
              </Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineItem}>
            <View
              style={
                status === "Completed"
                  ? styles.completedCircle
                  : styles.pendingCircle
              }
            />

            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Service Completed</Text>
              <Text style={styles.timelineText}>
                {status === "Completed"
                  ? "The service has been completed."
                  : "Service completion is still pending."}
              </Text>
            </View>
          </View>
        </View>

        {status !== "Pending" && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              router.push({
                pathname: "/customer-chat",
                params: {
                  provider,
                  bookingId,
                },
              })
            }
          >
            <Text style={styles.chatButtonText}>
              💬 Chat with Provider
            </Text>
          </TouchableOpacity>
        )}

        {status === "Completed" && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() =>
              router.push({
                pathname: "/rate-review",
                params: {
                  provider,
                  service,
                },
              })
            }
          >
            <Text style={styles.reviewButtonText}>
              ⭐ Rate & Review
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  statusCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 18,
  },

  bookingId: {
    fontSize: 12,
    color: "#64748B",
  },

  statusTitle: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  statusDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  section: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  providerRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 26,
  },

  providerInfo: {
    marginLeft: 12,
  },

  providerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  providerService: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },

  verified: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  row: {
    marginTop: 13,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 13,
    color: "#64748B",
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },

  timelineItem: {
    flexDirection: "row",
    marginTop: 18,
  },

  completedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#16A34A",
  },

  pendingCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },

  timelineLine: {
    width: 2,
    height: 26,
    backgroundColor: "#E2E8F0",
    marginLeft: 8,
  },

  timelineContent: {
    marginLeft: 12,
    flex: 1,
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  timelineText: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  chatButton: {
    marginTop: 18,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },

  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  reviewButton: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },

  reviewButtonText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
});