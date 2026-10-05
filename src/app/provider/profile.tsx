import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

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

type ProviderData = {
  name?: string;
  category?: string;
  district?: string;
  phone?: string;
  email?: string;
  verificationStatus?: string;
};

type Review = {
  rating?: number;
  providerId?: string | null;
};

type Booking = {
  status?: string;
  providerId?: string | null;
};

export default function ProviderProfileScreen() {
  const [provider, setProvider] =
    useState<ProviderData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [reviewCount, setReviewCount] =
    useState(0);

  const [averageRating, setAverageRating] =
    useState(0);

  const [completedJobs, setCompletedJobs] =
    useState(0);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const loadProvider = async () => {
      try {
        const providerDoc = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!providerDoc.exists()) {
          console.log(
            "Provider profile not found."
          );

          setLoading(false);
          return;
        }

        setProvider(
          providerDoc.data() as ProviderData
        );
      } catch (error) {
        console.log(
          "Error loading provider profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProvider();

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("providerId", "==", user.uid)
    );

    const unsubscribeReviews =
      onSnapshot(
        reviewsQuery,
        (snapshot) => {
          const reviews =
            snapshot.docs.map(
              (reviewDoc) =>
                reviewDoc.data() as Review
            );

          setReviewCount(
            reviews.length
          );

          if (reviews.length === 0) {
            setAverageRating(0);
            return;
          }

          const totalRating =
            reviews.reduce(
              (total, review) =>
                total +
                Number(
                  review.rating || 0
                ),
              0
            );

          setAverageRating(
            totalRating /
              reviews.length
          );
        },
        (error) => {
          console.log(
            "Review loading error:",
            error
          );
        }
      );

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid)
    );

    const unsubscribeBookings =
      onSnapshot(
        bookingsQuery,
        (snapshot) => {
          const jobs =
            snapshot.docs
              .map(
                (bookingDoc) =>
                  bookingDoc.data() as Booking
              )
              .filter(
                (booking) =>
                  booking.status ===
                  "completed"
              );

          setCompletedJobs(
            jobs.length
          );
        },
        (error) => {
          console.log(
            "Completed jobs loading error:",
            error
          );
        }
      );

    return () => {
      unsubscribeReviews();
      unsubscribeBookings();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      router.replace(
        "/provider/login"
      );
    } catch (error: any) {
      console.log(
        "Logout error:",
        error
      );

      alert(
        error.message ||
          "Unable to log out."
      );
    }
  };

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={styles.loadingText}
        >
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={styles.profileHeader}
        >
          <View style={styles.avatar}>
            <Text
              style={styles.avatarText}
            >
              👨‍🔧
            </Text>
          </View>

          <Text style={styles.name}>
            {provider?.name ||
              "Provider"}
          </Text>

          <Text style={styles.service}>
            {provider?.category ||
              "Service Provider"}
          </Text>

          <Text
            style={styles.district}
          >
            📍{" "}
            {provider?.district ||
              "Service area not set"}
          </Text>

          <View
            style={[
              styles.verifiedBadge,
              provider?.verificationStatus !==
                "approved" &&
                styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.verifiedText,
                provider?.verificationStatus !==
                  "approved" &&
                  styles.pendingText,
              ]}
            >
              {provider?.verificationStatus ===
              "approved"
                ? "✓ Verified Provider"
                : "Verification Pending"}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                style={styles.statValue}
              >
                {averageRating > 0
                  ? averageRating.toFixed(
                      1
                    )
                  : "0.0"}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Rating
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text
                style={styles.statValue}
              >
                {reviewCount}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Reviews
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text
                style={styles.statValue}
              >
                {completedJobs}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Jobs
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push("/provider/edit-profile")
            }
          >
            <Text
              style={styles.itemIcon}
            >
              👤
            </Text>

            <Text
              style={styles.itemText}
            >
              Edit Profile
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push(
                "/provider/availability"
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              📅
            </Text>

            <Text
              style={styles.itemText}
            >
              Manage Availability
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push(
                "/provider/services-pricing"
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              🛠️
            </Text>

            <Text
              style={styles.itemText}
            >
              Services & Pricing
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push(
                "/provider/verification"
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              📄
            </Text>

            <Text
              style={styles.itemText}
            >
              Verification Documents
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push(
                "/provider/settings"
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              ⚙️
            </Text>

            <Text
              style={styles.itemText}
            >
              Settings
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              🔔
            </Text>

            <Text
              style={styles.itemText}
            >
              Notifications
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              ❓
            </Text>

            <Text
              style={styles.itemText}
            >
              Help & Support
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text
            style={styles.logoutText}
          >
            Log Out
          </Text>
        </TouchableOpacity>
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

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F7FC",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },

  profileHeader: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 42,
  },

  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  service: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },

  district: {
    marginTop: 6,
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },

  verifiedBadge: {
    marginTop: 10,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedText: {
    fontSize: 11,
    color: "#1D4ED8",
    fontWeight: "700",
  },

  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },

  pendingText: {
    color: "#92400E",
  },

  statsRow: {
    marginTop: 22,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
  },

  divider: {
    width: 1,
    height: 34,
    backgroundColor: "#E2E8F0",
  },

  section: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  item: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  itemIcon: {
    width: 34,
    fontSize: 20,
  },

  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 24,
    color: "#94A3B8",
  },

  logoutButton: {
    marginTop: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
  },
});