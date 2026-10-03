import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProviderBottomNav from "../../components/ProviderBottomNav";

export default function ProviderDashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TOP HEADER */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.logo}>FIXORA</Text>
            <Text style={styles.location}>📍 Colombo 07</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Text style={styles.notification}>🔔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallAvatar}
              onPress={() => router.push("/provider/profile")}
            >
              <Text style={styles.avatarEmoji}>👨‍🔧</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PROVIDER GREETING */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTop}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerEmoji}>👨‍🔧</Text>
            </View>

            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeTitle}>Hello, Ahmad 👋</Text>

              <Text style={styles.welcomeSubtitle}>
                Good morning! Ready for dispatch
              </Text>
            </View>

            <View style={styles.availableBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.availableText}>Available</Text>
            </View>
          </View>

          <View style={styles.zoneRow}>
            <Text style={styles.zoneText}>
              △ Zone: Central Colombo
            </Text>

            <TouchableOpacity>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/provider/jobs")}
          >
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Today's Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/provider/requests")}
          >
            <Text style={styles.statIcon}>📋</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.newBadge}>NEW</Text>
            </View>
            <Text style={styles.statLabel}>Pending Action</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/provider/earnings")}
          >
            <Text style={styles.statIcon}>💵</Text>
            <Text style={styles.statValue}>Rs. 8,500</Text>
            <Text style={styles.positiveText}>↗ +12%</Text>
          </TouchableOpacity>
        </View>

        {/* NEW REQUEST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🟠 New Request</Text>

          <TouchableOpacity
            onPress={() => router.push("/provider/requests")}
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.requestCard}>
          <View style={styles.requestTop}>
            <View style={styles.requestTitleArea}>
              <Text style={styles.requestTitle}>
                Leak Repair & Pipe Diagnostics
              </Text>

              <Text style={styles.requestDate}>
                🕐 16 Apr 2025, 10:00 AM
              </Text>
            </View>

            <View>
              <Text style={styles.requestPrice}>Rs. 3,500</Text>
              <Text style={styles.priceLabel}>Est. Payout</Text>
            </View>
          </View>

          <Text style={styles.requestLocation}>
            📍 Kollupitiya, Colombo 03
          </Text>

          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitials}>SK</Text>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>Suresh Kumar</Text>
              <Text style={styles.rating}>
                ⭐ 4.9 (12 reviews)
              </Text>
            </View>

            <View style={styles.paymentBadge}>
              <Text style={styles.paymentText}>Cash / QR</Text>
            </View>
          </View>

          <View style={styles.requestButtons}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                router.push("/provider/request-details")
              }
            >
              <Text style={styles.detailsText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() =>
                router.push("/provider/request-details")
              }
            >
              <Text style={styles.acceptText}>
                ✓ Accept Request
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* UPCOMING JOBS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📅 Upcoming Jobs</Text>

          <TouchableOpacity
            onPress={() => router.push("/provider/jobs")}
          >
            <Text style={styles.viewAll}>See All (4)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.jobCard}
          onPress={() => router.push("/provider/jobs")}
        >
          <View style={styles.jobTop}>
            <Text style={styles.jobTitle}>Pipe Installation</Text>

            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>Confirmed</Text>
            </View>

            <Text style={styles.jobPrice}>Rs. 4,500</Text>
          </View>

          <Text style={styles.jobDate}>
            16 Apr 2025, 2:00 PM
          </Text>

          <View style={styles.jobBottom}>
            <Text style={styles.jobLocation}>
              📍 Bambalapitiya, Colombo 04
            </Text>

            <Text style={styles.jobAction}>📞</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.jobCard}
          onPress={() => router.push("/provider/jobs")}
        >
          <View style={styles.jobTop}>
            <Text style={styles.jobTitle}>
              Bathroom Fitting & Mixer
            </Text>

            <Text style={styles.jobPrice}>Rs. 6,200</Text>
          </View>

          <Text style={styles.jobDate}>
            17 Apr 2025, 11:00 AM
          </Text>

          <View style={styles.jobBottom}>
            <Text style={styles.jobLocation}>
              📍 Cinnamon Gardens, Colombo 07
            </Text>

            <Text style={styles.jobAction}>📞</Text>
          </View>
        </TouchableOpacity>

        {/* PROTECTION BANNER */}
        <View style={styles.protectionCard}>
          <Text style={styles.protectionIcon}>🛡️</Text>

          <View style={styles.protectionContent}>
            <Text style={styles.protectionTitle}>
              Fixora Pro Protection Active
            </Text>

            <Text style={styles.protectionText}>
              Every job insured up to Rs. 100,000
            </Text>
          </View>

          <Text style={styles.protectionArrow}>›</Text>
        </View>
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D47C7",
  },

  location: {
    marginTop: 3,
    fontSize: 12,
    color: "#334155",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  notification: {
    fontSize: 21,
  },

  smallAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarEmoji: {
    fontSize: 20,
  },

  welcomeCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  welcomeTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  providerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  providerEmoji: {
    fontSize: 26,
  },

  welcomeContent: {
    flex: 1,
    marginLeft: 12,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  welcomeSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#059669",
    marginRight: 6,
  },

  availableText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },

  zoneRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  zoneText: {
    fontSize: 12,
    color: "#334155",
  },

  changeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  statsRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
  },

  statIcon: {
    fontSize: 20,
  },

  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  statValue: {
    marginTop: 8,
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#475569",
  },

  newBadge: {
    marginLeft: 5,
    backgroundColor: "#FED7AA",
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 8,
    fontWeight: "700",
    color: "#92400E",
  },

  positiveText: {
    marginTop: 2,
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "600",
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
  },

  requestTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  requestTitleArea: {
    flex: 1,
    paddingRight: 10,
  },

  requestTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  requestDate: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  requestPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  priceLabel: {
    fontSize: 9,
    color: "#64748B",
    textAlign: "right",
  },

  requestLocation: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
  },

  customerRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  customerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  customerInitials: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },

  customerInfo: {
    flex: 1,
    marginLeft: 10,
  },

  customerName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  rating: {
    marginTop: 2,
    fontSize: 10,
    color: "#64748B",
  },

  paymentBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },

  paymentText: {
    fontSize: 9,
    color: "#334155",
  },

  requestButtons: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  detailsText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 13,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: "#1D4ED8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  acceptText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  jobTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  jobTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  confirmedBadge: {
    backgroundColor: "#A7F3D0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  confirmedText: {
    fontSize: 9,
    color: "#065F46",
    fontWeight: "700",
  },

  jobPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  jobDate: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  jobBottom: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  jobLocation: {
    flex: 1,
    fontSize: 11,
    color: "#64748B",
  },

  jobAction: {
    fontSize: 18,
  },

  protectionCard: {
    marginTop: 8,
    backgroundColor: "#0D47C7",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  protectionIcon: {
    fontSize: 22,
  },

  protectionContent: {
    flex: 1,
    marginLeft: 12,
  },

  protectionTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  protectionText: {
    marginTop: 2,
    color: "#BFDBFE",
    fontSize: 11,
  },

  protectionArrow: {
    color: "#FFFFFF",
    fontSize: 24,
  },
});