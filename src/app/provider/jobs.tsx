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

  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;

  providerId?: string | null;
  providerName?: string;

  service?: string;
  date?: string;
  time?: string;
  description?: string;
  address?: string;

  servicePrice?: number;
  platformFee?: number;
  totalAmount?: number;

  status?: string;
};

export default function ProviderJobsScreen() {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] =
    useState<"all" | "upcoming" | "completed">("all");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    console.log(
      "Logged provider UID:",
      user.uid
    );

    /*
      Load only bookings assigned to this provider.

      Then we filter the relevant job statuses locally.
      This avoids needing a Firestore composite index.
    */
    const jobsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      jobsQuery,

      (snapshot) => {
        const loadedJobs: Booking[] =
          snapshot.docs
            .map((jobDoc) => ({
              id: jobDoc.id,
              ...jobDoc.data(),
            }))
            .filter((job: any) =>
              [
                "confirmed",
                "in_progress",
                "completed",
              ].includes(job.status)
            ) as Booking[];

        console.log(
          "Provider jobs found:",
          loadedJobs.length
        );

        setJobs(loadedJobs);
        setLoading(false);
      },

      (error) => {
        console.log(
          "Error loading provider jobs:",
          error
        );

        alert(
          error.message ||
            "Unable to load provider jobs."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (selectedTab === "all") {
      return true;
    }

    if (selectedTab === "upcoming") {
      return (
        job.status === "confirmed" ||
        job.status === "in_progress"
      );
    }

    if (selectedTab === "completed") {
      return job.status === "completed";
    }

    return true;
  });

  const getStatusLabel = (status?: string) => {
    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "completed") {
      return "Completed";
    }

    return "Confirmed";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>
          My Jobs
        </Text>

        <Text style={styles.subtitle}>
          Manage confirmed and ongoing service jobs.
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "all" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setSelectedTab("all")
            }
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "all" &&
                  styles.activeTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "upcoming" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setSelectedTab("upcoming")
            }
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "upcoming" &&
                  styles.activeTabText,
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "completed" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setSelectedTab("completed")
            }
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "completed" &&
                  styles.activeTabText,
              ]}
            >
              Completed
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
              Loading jobs...
            </Text>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🧰
            </Text>

            <Text style={styles.emptyTitle}>
              No jobs found
            </Text>

            <Text style={styles.emptyText}>
              Accepted customer requests will
              appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.jobList}>
            {filteredJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() =>
                  router.push({
                    pathname:
                      "/provider/job-details",

                    params: {
                      bookingId: job.id,

                      customer:
                        job.customerName ||
                        "Customer",

                      phone:
                        job.customerPhone ||
                        "",

                      email:
                        job.customerEmail ||
                        "",

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
                        job.status ||
                        "confirmed",
                    },
                  })
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconBox}>
                    <Text style={styles.icon}>
                      🔧
                    </Text>
                  </View>

                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>
                      {job.service ||
                        "Home Service"}
                    </Text>

                    <Text style={styles.customerName}>
                      {job.customerName ||
                        "Customer"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,

                      job.status ===
                        "in_progress" &&
                        styles.progressBadge,

                      job.status ===
                        "completed" &&
                        styles.completedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,

                        job.status ===
                          "in_progress" &&
                          styles.progressText,

                        job.status ===
                          "completed" &&
                          styles.completedText,
                      ]}
                    >
                      {getStatusLabel(
                        job.status
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <Text style={styles.detailText}>
                    📅 October{" "}
                    {job.date || "-"} •{" "}
                    {job.time || "-"}
                  </Text>

                  <Text style={styles.detailText}>
                    📍{" "}
                    {job.address ||
                      "Location not provided"}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <View>
                    <Text style={styles.priceLabel}>
                      Estimated Service
                    </Text>

                    <Text style={styles.price}>
                      Rs.{" "}
                      {Number(
                        job.servicePrice || 0
                      ).toLocaleString()}
                    </Text>
                  </View>

                  <Text style={styles.viewDetails}>
                    View Job →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    color: "#64748B",
  },

  tabs: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 9,
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
    color: "#2563EB",
  },

  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },

  emptyCard: {
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  emptyIcon: {
    fontSize: 38,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },

  jobList: {
    marginTop: 16,
    gap: 12,
  },

  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 21,
  },

  jobInfo: {
    flex: 1,
    marginLeft: 11,
  },

  jobTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  customerName: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#166534",
  },

  progressBadge: {
    backgroundColor: "#DBEAFE",
  },

  progressText: {
    color: "#1D4ED8",
  },

  completedBadge: {
    backgroundColor: "#E2E8F0",
  },

  completedText: {
    color: "#475569",
  },

  details: {
    marginTop: 14,
    gap: 6,
  },

  detailText: {
    fontSize: 12,
    color: "#475569",
  },

  bottomRow: {
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceLabel: {
    fontSize: 10,
    color: "#64748B",
  },

  price: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  viewDetails: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
});