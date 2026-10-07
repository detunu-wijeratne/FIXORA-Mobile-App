import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BookingCard from "../components/BookingCard";
import CustomerBottomNav from "../components/CustomerBottomNav";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { StatusType } from "../components/StatusBadge";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

type Booking = {
  id: string;

  customerId?: string;
  providerName?: string;

  service?: string;
  date?: string;
  time?: string;
  address?: string;
  description?: string;

  servicePrice?: number;
  totalAmount?: number;

  status?: string;
};

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] =
    useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const loadedBookings: Booking[] = snapshot.docs.map((bookingDoc) => ({
          id: bookingDoc.id,
          ...bookingDoc.data(),
        })) as Booking[];

        setBookings(loadedBookings);
        setLoading(false);
      },
      (error) => {
        console.log("Error loading customer bookings:", error);
        alert(error.message || "Unable to load your bookings.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (selectedTab === "all") {
      return true;
    }

    if (selectedTab === "active") {
      return (
        booking.status === "pending" ||
        booking.status === "confirmed" ||
        booking.status === "in_progress"
      );
    }

    if (selectedTab === "completed") {
      return booking.status === "completed";
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>My Bookings</Text>

        <Text style={styles.subtitle}>
          Track your current and previous service bookings.
        </Text>

        <View style={styles.tabs}>
          {(["all", "active", "completed"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}
              >
                {tab === "all" ? "All" : tab === "active" ? "Active" : "Completed"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <LoadingState label="Loading bookings..." />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon="file-tray-outline"
            title="No bookings found"
            description="Your service bookings will appear here."
          />
        ) : (
          <View style={styles.bookingList}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                service={booking.service || "Home Service"}
                providerName={booking.providerName || "Provider"}
                date={booking.date}
                time={booking.time}
                address={booking.address}
                status={(booking.status || "pending") as StatusType}
                totalAmount={booking.totalAmount}
                onPress={() =>
                  router.push({
                    pathname: "/booking-details",
                    params: {
                      bookingId: booking.id,
                      provider: booking.providerName || "Provider",
                      service: booking.service || "Home Service",
                      date: booking.date || "",
                      time: booking.time || "",
                      location: booking.address || "",
                      description: booking.description || "",
                      price: String(booking.servicePrice || 0),
                      totalAmount: String(booking.totalAmount || 0),
                      status: booking.status || "pending",
                    },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      <CustomerBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 30,
  },

  title: {
    ...typography.pageTitle,
    fontSize: 26,
  },

  subtitle: {
    ...typography.secondary,
    marginTop: spacing.xs + 2,
  },

  tabs: {
    marginTop: spacing.xl,
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.xs,
  },

  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 1,
    alignItems: "center",
    borderRadius: radius.sm + 1,
  },

  activeTab: {
    backgroundColor: colors.surface,
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  activeTabText: {
    color: colors.primary,
  },

  bookingList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
