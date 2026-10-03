import { router } from "expo-router";
import CustomerBottomNav from "../components/CustomerBottomNav";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyBookingsScreen() {
  const bookings = [
    {
      id: "BK001",
      provider: "Kamal Perera",
      service: "Plumbing",
      date: "October 5",
      time: "9:30 AM",
      status: "Pending",
      statusColor: "#D97706",
      statusBg: "#FEF3C7",
    },
    {
      id: "BK002",
      provider: "Nimal Fernando",
      service: "Electrical",
      date: "September 28",
      time: "2:30 PM",
      status: "Confirmed",
      statusColor: "#2563EB",
      statusBg: "#DBEAFE",
    },
    {
      id: "BK003",
      provider: "Saman Jayasinghe",
      service: "Cleaning",
      date: "September 20",
      time: "11:00 AM",
      status: "Completed",
      statusColor: "#16A34A",
      statusBg: "#DCFCE7",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>My Bookings</Text>

        <Text style={styles.subtitle}>
          View and manage your service bookings.
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={styles.activeTabText}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Completed</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bookingList}>
          {bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/booking-details",
                  params: booking,
                })
              }
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.bookingId}>{booking.id}</Text>
                  <Text style={styles.service}>{booking.service}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: booking.statusBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: booking.statusColor },
                    ]}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>

              <View style={styles.providerRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>👨‍🔧</Text>
                </View>

                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>
                    {booking.provider}
                  </Text>

                  <Text style={styles.bookingDate}>
                    📅 {booking.date} · {booking.time}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.viewDetails}>View Details</Text>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },

  tabs: {
    marginTop: 24,
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#FFFFFF",
  },

  tabText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  activeTabText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "700",
  },

  bookingList: {
    marginTop: 22,
    gap: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  bookingId: {
    fontSize: 12,
    color: "#94A3B8",
  },

  service: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  providerRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 22,
  },

  providerInfo: {
    marginLeft: 12,
  },

  providerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  bookingDate: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },

  cardBottom: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewDetails: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "700",
  },

  arrow: {
    fontSize: 24,
    color: "#94A3B8",
  },
});