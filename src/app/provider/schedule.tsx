import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ProviderBottomNav from "../../components/ProviderBottomNav";

export default function ProviderScheduleScreen() {
  const jobs = [
    {
      id: "JB001",
      time: "9:30 AM",
      title: "Leak Repair",
      customer: "Suresh Kumar",
      location: "Colombo 03",
    },
    {
      id: "JB002",
      time: "2:00 PM",
      title: "Pipe Installation",
      customer: "Nadeesha Silva",
      location: "Colombo 04",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Schedule</Text>

        <Text style={styles.subtitle}>
          View your jobs and manage your available time slots.
        </Text>

        <View style={styles.dateRow}>
          {["Mon 14", "Tue 15", "Wed 16", "Thu 17", "Fri 18"].map(
            (item, index) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.dateCard,
                  index === 2 && styles.activeDateCard,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    index === 2 && styles.activeDateText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Jobs</Text>

          <TouchableOpacity
            onPress={() => router.push("/provider/jobs")}
          >
            <Text style={styles.link}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.jobList}>
          {jobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() =>
                router.push({
                  pathname: "/provider/job-details",
                  params: {
                    id: job.id,
                    customer: job.customer,
                    service: job.title,
                    time: job.time,
                    location: job.location,
                    status: "Confirmed",
                  },
                })
              }
            >
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{job.time}</Text>
              </View>

              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.customer}>{job.customer}</Text>
                <Text style={styles.location}>
                  📍 {job.location}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Availability</Text>
        </View>

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityInfo}>
            <Text style={styles.availabilityTitle}>
              Manage Availability
            </Text>

            <Text style={styles.availabilityText}>
              Add, remove or change the time slots customers can book.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={() =>
              router.push("/provider/availability")
            }
          >
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
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

  dateRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 8,
  },

  dateCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  activeDateCard: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },

  dateText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },

  activeDateText: {
    color: "#FFFFFF",
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  link: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  jobList: {
    gap: 12,
  },

  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  timeBox: {
    width: 70,
    minHeight: 58,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  timeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  jobInfo: {
    flex: 1,
    marginLeft: 12,
  },

  jobTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  customer: {
    marginTop: 3,
    fontSize: 12,
    color: "#475569",
  },

  location: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  arrow: {
    fontSize: 24,
    color: "#94A3B8",
  },

  availabilityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  availabilityInfo: {
    flex: 1,
    paddingRight: 12,
  },

  availabilityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  availabilityText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  manageButton: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  manageButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});