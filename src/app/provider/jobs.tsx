import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ProviderBottomNav from "../../components/ProviderBottomNav";

export default function ProviderJobsScreen() {
  const jobs = [
    {
      id: "JB001",
      customer: "Suresh Kumar",
      service: "Leak Repair & Pipe Diagnostics",
      date: "16 Apr 2025",
      time: "10:00 AM",
      location: "Kollupitiya, Colombo 03",
      payout: "Rs. 3,500",
      status: "Confirmed",
      statusColor: "#2563EB",
      statusBg: "#DBEAFE",
    },
    {
      id: "JB002",
      customer: "Nadeesha Silva",
      service: "Pipe Installation",
      date: "16 Apr 2025",
      time: "2:00 PM",
      location: "Bambalapitiya, Colombo 04",
      payout: "Rs. 4,500",
      status: "In Progress",
      statusColor: "#D97706",
      statusBg: "#FEF3C7",
    },
    {
      id: "JB003",
      customer: "Kasun Fernando",
      service: "Bathroom Fitting",
      date: "15 Apr 2025",
      time: "11:00 AM",
      location: "Colombo 07",
      payout: "Rs. 6,200",
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
        <Text style={styles.title}>My Jobs</Text>

        <Text style={styles.subtitle}>
          View and manage your accepted service jobs.
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

        <View style={styles.jobList}>
          {jobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/provider/job-details",
                  params: job,
                })
              }
            >
              <View style={styles.cardTop}>
                <View style={styles.serviceArea}>
                  <Text style={styles.service}>{job.service}</Text>
                  <Text style={styles.jobId}>{job.id}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: job.statusBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: job.statusColor },
                    ]}
                  >
                    {job.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.customerName}>{job.customer}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.info}>📅 {job.date}</Text>
                <Text style={styles.info}>🕐 {job.time}</Text>
              </View>

              <Text style={styles.location}>📍 {job.location}</Text>

              <View style={styles.bottomRow}>
                <Text style={styles.payout}>{job.payout}</Text>
                <Text style={styles.viewText}>View Job ›</Text>
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

  tabs: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 4,
    borderRadius: 14,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 10,
  },

  activeTab: {
    backgroundColor: "#FFFFFF",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  activeTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },

  jobList: {
    marginTop: 20,
    gap: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 15,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  serviceArea: {
    flex: 1,
    paddingRight: 10,
  },

  service: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  jobId: {
    marginTop: 4,
    fontSize: 10,
    color: "#94A3B8",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  customerName: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  infoRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 16,
  },

  info: {
    fontSize: 11,
    color: "#64748B",
  },

  location: {
    marginTop: 8,
    fontSize: 11,
    color: "#64748B",
  },

  bottomRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  payout: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  viewText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
});