import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ProviderBottomNav from "../../components/ProviderBottomNav";

export default function ProviderRequestsScreen() {
  const requests = [
    {
      id: "RQ001",
      customer: "Suresh Kumar",
      service: "Leak Repair & Pipe Diagnostics",
      date: "16 Apr 2025",
      time: "10:00 AM",
      location: "Kollupitiya, Colombo 03",
      payout: "Rs. 3,500",
      rating: "4.9",
      reviews: "12",
    },
    {
      id: "RQ002",
      customer: "Nadeesha Silva",
      service: "Kitchen Sink Repair",
      date: "16 Apr 2025",
      time: "1:30 PM",
      location: "Bambalapitiya, Colombo 04",
      payout: "Rs. 2,800",
      rating: "4.8",
      reviews: "8",
    },
    {
      id: "RQ003",
      customer: "Kasun Fernando",
      service: "Bathroom Pipe Inspection",
      date: "17 Apr 2025",
      time: "9:00 AM",
      location: "Colombo 07",
      payout: "Rs. 3,200",
      rating: "4.7",
      reviews: "15",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Incoming Requests</Text>

        <Text style={styles.subtitle}>
          Review new service requests and decide whether to accept them.
        </Text>

        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
            <Text style={styles.activeFilterText}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Tomorrow</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.requestList}>
          {requests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/provider/request-details",
                  params: request,
                })
              }
            >
              <View style={styles.topRow}>
                <View style={styles.serviceArea}>
                  <Text style={styles.service}>{request.service}</Text>
                  <Text style={styles.requestId}>{request.id}</Text>
                </View>

                <View>
                  <Text style={styles.payout}>{request.payout}</Text>
                  <Text style={styles.payoutLabel}>Est. payout</Text>
                </View>
              </View>

              <View style={styles.customerRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>SK</Text>
                </View>

                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>
                    {request.customer}
                  </Text>

                  <Text style={styles.rating}>
                    ⭐ {request.rating} ({request.reviews} reviews)
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.info}>
                  📅 {request.date}
                </Text>

                <Text style={styles.info}>
                  🕐 {request.time}
                </Text>

                <Text style={styles.info}>
                  📍 {request.location}
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.viewText}>View Request</Text>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ProviderBottomNav />
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
    paddingBottom: 30,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  filterRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
  },

  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  activeFilter: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },

  filterText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 12,
  },

  activeFilterText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  requestList: {
    marginTop: 20,
    gap: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  serviceArea: {
    flex: 1,
    paddingRight: 12,
  },

  service: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  requestId: {
    marginTop: 4,
    fontSize: 10,
    color: "#94A3B8",
  },

  payout: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1D4ED8",
    textAlign: "right",
  },

  payoutLabel: {
    marginTop: 2,
    fontSize: 9,
    color: "#94A3B8",
    textAlign: "right",
  },

  customerRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  customerInfo: {
    marginLeft: 10,
  },

  customerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  rating: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
  },

  infoSection: {
    marginTop: 14,
    gap: 6,
  },

  info: {
    fontSize: 12,
    color: "#64748B",
  },

  cardBottom: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  arrow: {
    fontSize: 24,
    color: "#94A3B8",
  },
});