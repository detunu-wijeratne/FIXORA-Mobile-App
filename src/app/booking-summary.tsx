import { router, useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingSummaryScreen() {
  const params = useLocalSearchParams();

  const name =
    typeof params.name === "string" ? params.name : "Kamal Perera";

  const service =
    typeof params.service === "string" ? params.service : "Plumber";

  const price =
    typeof params.price === "string" ? params.price : "Rs. 2,500";

  const date =
    typeof params.date === "string" ? params.date : "5";

  const time =
    typeof params.time === "string" ? params.time : "9:30 AM";

  const description =
    typeof params.description === "string"
      ? params.description
      : "No description provided";

  const address =
    typeof params.address === "string"
      ? params.address
      : "45, Main Street, Colombo 03";

  const handleConfirm = () => {
    router.push({
      pathname: "/booking-confirmation",
      params: {
        name,
        service,
        price,
        date,
        time,
        description,
        address,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Review your booking</Text>

        <Text style={styles.subtitle}>
          Check the details below before confirming your service.
        </Text>

        <View style={styles.providerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🔧</Text>
          </View>

          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{name}</Text>
            <Text style={styles.providerService}>{service}</Text>
            <Text style={styles.verified}>✓ Verified Provider</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{service}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>October {date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{time}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Starting Price</Text>
            <Text style={styles.value}>{price}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problem Description</Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Estimated service charge</Text>
            <Text style={styles.value}>{price}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Platform fee</Text>
            <Text style={styles.value}>Rs. 250</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>
              Rs. {Number(price.replace(/\D/g, "")) + 250}
            </Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Note</Text>
          <Text style={styles.noteText}>
            The final service price may change depending on the actual work
            required. The provider can confirm the final amount before work
            begins.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  providerCard: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 28,
  },

  providerInfo: {
    marginLeft: 14,
  },

  providerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  providerService: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  verified: {
    marginTop: 5,
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
  },

  section: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
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

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  descriptionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
  },

  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 16,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },

  noteBox: {
    marginTop: 18,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 15,
  },

  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  noteText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 16,
  },

  confirmButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});