import { router, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingConfirmationScreen() {
  const params = useLocalSearchParams();

  const name =
    typeof params.name === "string" ? params.name : "Kamal Perera";

  const service =
    typeof params.service === "string" ? params.service : "Plumber";

  const date =
    typeof params.date === "string" ? params.date : "5";

  const time =
    typeof params.time === "string" ? params.time : "9:30 AM";

  return (
    <View style={styles.container}>
      <View style={styles.successCircle}>
        <Text style={styles.successIcon}>✓</Text>
      </View>

      <Text style={styles.title}>Booking Confirmed!</Text>

      <Text style={styles.subtitle}>
        Your booking request has been successfully submitted.
      </Text>

      <View style={styles.card}>
        <Text style={styles.providerName}>{name}</Text>
        <Text style={styles.service}>{service}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>October {date}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{time}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.status}>Pending Provider Approval</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/my-bookings")}
      >
        <Text style={styles.primaryButtonText}>View My Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace("/customer-home")}
      >
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  successCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  successIcon: {
    fontSize: 42,
    fontWeight: "800",
    color: "#16A34A",
  },

  title: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 310,
  },

  card: {
    marginTop: 30,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 18,
  },

  providerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  service: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
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

  status: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },

  primaryButton: {
    marginTop: 28,
    width: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: 12,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },
});