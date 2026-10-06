import { router, useLocalSearchParams } from "expo-router";
import CustomerBottomNav from "../components/CustomerBottomNav";


import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingConfirmationScreen() {
  const params = useLocalSearchParams();

  const name =
    typeof params.name === "string"
      ? params.name
      : "Service Provider";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Home Service";

  const date =
    typeof params.date === "string"
      ? params.date
      : "5";

  const time =
    typeof params.time === "string"
      ? params.time
      : "9:30 AM";

  const imageUrl =
    typeof params.imageUrl === "string"
      ? params.imageUrl
      : "";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.successCircle}>
          <Text style={styles.successIcon}>
            ✓
          </Text>
        </View>

        <Text style={styles.title}>
          Booking Confirmed!
        </Text>

        <Text style={styles.subtitle}>
          Your booking request has been successfully submitted.
        </Text>

        <View style={styles.card}>
          <Text style={styles.providerName}>
            {name}
          </Text>

          <Text style={styles.service}>
            {service}
          </Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>
              Date
            </Text>

            <Text style={styles.value}>
              October {date}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Time
            </Text>

            <Text style={styles.value}>
              {time}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Status
            </Text>

            <Text style={styles.status}>
              Pending Provider Approval
            </Text>
          </View>
        </View>

        {imageUrl && (
          <View style={styles.photoCard}>
            <Text style={styles.photoTitle}>
              Attached Photo
            </Text>

            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.photo}
              resizeMode="cover"
              onLoad={() => {
                console.log(
                  "Confirmation Cloudinary image loaded"
                );
              }}
              onError={(event) => {
                console.log(
                  "Confirmation image error:",
                  event.nativeEvent.error
                );

                console.log(
                  "Confirmation image URL:",
                  imageUrl
                );
              }}
            />

            <View style={styles.photoStatusRow}>
              <View style={styles.photoCheck}>
                <Text style={styles.photoCheckText}>
                  ✓
                </Text>
              </View>

              <Text style={styles.photoStatusText}>
                Photo attached to this booking
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push("/my-bookings")
          }
        >
          <Text style={styles.primaryButtonText}>
            View My Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            router.replace("/customer-home")
          }
        >
          <Text style={styles.secondaryButtonText}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <CustomerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: "center",
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
    textAlign: "center",
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
    gap: 12,
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
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },

  photoCard: {
    marginTop: 18,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
  },

  photoTitle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  photo: {
    width: "100%",
    height: 210,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },

  photoStatusRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  photoCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  photoCheckText: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "800",
  },

  photoStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
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