import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import { auth, db } from "../../services/firebase";

type Booking = {
  id: string;

  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;

  providerId?: string | null;

  service?: string;
  date?: string;
  time?: string;
  address?: string;
  description?: string;

  servicePrice?: number;
  totalAmount?: number;

  status?: string;
};

export default function ProviderScheduleScreen() {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const scheduleQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      scheduleQuery,
      (snapshot) => {
        const loadedJobs: Booking[] =
          snapshot.docs
            .map((jobDoc) => ({
              id: jobDoc.id,
              ...jobDoc.data(),
            }))
            .filter(
              (job: any) =>
                job.status === "confirmed" ||
                job.status === "in_progress"
            ) as Booking[];

        loadedJobs.sort((a, b) => {
          const dateA = Number(a.date || 0);
          const dateB = Number(b.date || 0);

          if (dateA !== dateB) {
            return dateA - dateB;
          }

          return String(a.time || "").localeCompare(
            String(b.time || "")
          );
        });

        setJobs(loadedJobs);
        setLoading(false);
      },
      (error) => {
        console.log(
          "Schedule loading error:",
          error
        );

        alert(
          error.message ||
            "Unable to load schedule."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const openJobDetails = (job: Booking) => {
    router.push({
      pathname: "/provider/job-details",

      params: {
        bookingId: job.id,

        customer:
          job.customerName ||
          "Customer",

        phone:
          job.customerPhone || "",

        email:
          job.customerEmail || "",

        service:
          job.service ||
          "Home Service",

        date:
          job.date || "",

        time:
          job.time || "",

        location:
          job.address || "",

        description:
          job.description || "",

        price: String(
          job.servicePrice || 0
        ),

        totalAmount: String(
          job.totalAmount || 0
        ),

        status:
          job.status || "confirmed",
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>
          Schedule
        </Text>

        <Text style={styles.subtitle}>
          View your jobs and manage your available time slots.
        </Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Upcoming Jobs
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push("/provider/jobs")
            }
          >
            <Text style={styles.link}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text style={styles.loadingText}>
              Loading schedule...
            </Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              📅
            </Text>

            <Text style={styles.emptyTitle}>
              No scheduled jobs
            </Text>

            <Text style={styles.emptyText}>
              Accepted bookings will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.jobList}>
            {jobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() =>
                  openJobDetails(job)
                }
              >
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>
                    {job.time || "-"}
                  </Text>

                  <Text style={styles.dateText}>
                    Oct {job.date || "-"}
                  </Text>
                </View>

                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>
                    {job.service ||
                      "Home Service"}
                  </Text>

                  <Text style={styles.customer}>
                    {job.customerName ||
                      "Customer"}
                  </Text>

                  <Text style={styles.location}>
                    📍{" "}
                    {job.address ||
                      "Location not provided"}
                  </Text>

                  <Text
                    style={[
                      styles.status,
                      job.status ===
                        "in_progress" &&
                        styles.progressStatus,
                    ]}
                  >
                    {job.status ===
                    "in_progress"
                      ? "In Progress"
                      : "Confirmed"}
                  </Text>
                </View>

                <Text style={styles.arrow}>
                  ›
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Availability
          </Text>
        </View>

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityInfo}>
            <Text
              style={styles.availabilityTitle}
            >
              Manage Availability
            </Text>

            <Text
              style={styles.availabilityText}
            >
              Add, remove or change the time slots customers can book.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.manageButton}
            onPress={() =>
              router.push(
                "/provider/availability"
              )
            }
          >
            <Text
              style={styles.manageButtonText}
            >
              Manage
            </Text>
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

  loadingContainer: {
    marginTop: 30,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 28,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 34,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
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
    width: 74,
    minHeight: 62,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  timeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1D4ED8",
    textAlign: "center",
  },

  dateText: {
    marginTop: 4,
    fontSize: 10,
    color: "#64748B",
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

  status: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
  },

  progressStatus: {
    color: "#1D4ED8",
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