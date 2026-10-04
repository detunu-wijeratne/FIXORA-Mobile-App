import { router, useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProviderProfileScreen() {
  const params = useLocalSearchParams();

  const providerId =
    typeof params.providerId === "string"
      ? params.providerId
      : "";

  const name =
    typeof params.name === "string"
      ? params.name
      : "Service Provider";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Home Service";

  const rating =
    typeof params.rating === "string"
      ? params.rating
      : "0";

  const reviews =
    typeof params.reviews === "string"
      ? params.reviews
      : "0";

  const district =
    typeof params.district === "string"
      ? params.district
      : "Location not set";

  const experience =
    typeof params.experience === "string"
      ? params.experience
      : "New provider";

  const price =
    typeof params.price === "string"
      ? params.price
      : "2500";

  const verified =
    params.verified === "true";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🔧</Text>
          </View>

          <Text style={styles.name}>{name}</Text>

          <Text style={styles.service}>
            {service}
          </Text>

          {verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                ✓ Verified Provider
              </Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ⭐ {rating === "0" ? "New" : rating}
              </Text>

              <Text style={styles.statLabel}>
                {reviews} reviews
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {experience}
              </Text>

              <Text style={styles.statLabel}>
                Experience
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text
                style={styles.statValue}
                numberOfLines={2}
              >
                {district}
              </Text>

              <Text style={styles.statLabel}>
                District
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About
          </Text>

          <Text style={styles.description}>
            Experienced and reliable professional
            providing quality home services.
            Available for repairs, installations
            and general service requests.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Service Details
          </Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Service
              </Text>

              <Text style={styles.detailValue}>
                {service}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Starting price
              </Text>

              <Text style={styles.detailValue}>
                Rs.{" "}
                {Number(price).toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                District
              </Text>

              <Text style={styles.detailValue}>
                {district}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Availability
              </Text>

              <Text style={styles.available}>
                Available
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Reviews
            </Text>

            <TouchableOpacity>
              <Text style={styles.seeAll}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewCard}>
            <Text style={styles.noReviewText}>
              Reviews will appear here after
              customers complete services.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>
            Starting from
          </Text>

          <Text style={styles.bottomPrice}>
            Rs.{" "}
            {Number(price).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/select-date-time",

              params: {
                providerId,
                name,
                service,
                price,
              },
            })
          }
        >
          <Text style={styles.bookButtonText}>
            Book Now
          </Text>
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
    paddingBottom: 120,
  },

  profileSection: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 42,
  },

  name: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  service: {
    marginTop: 4,
    fontSize: 15,
    color: "#64748B",
  },

  verifiedBadge: {
    marginTop: 10,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
  },

  statsRow: {
    marginTop: 24,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },

  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#94A3B8",
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: "#E2E8F0",
  },

  section: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
  },

  detailCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  detailLabel: {
    fontSize: 14,
    color: "#64748B",
  },

  detailValue: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  available: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  seeAll: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },

  reviewCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
  },

  noReviewText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  bottomLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  bottomPrice: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  bookButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 34,
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});