import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import { auth, db } from "../../services/firebase";

type Booking = {
  id: string;

  customerName?: string;
  service?: string;

  providerId?: string | null;

  servicePrice?: number;
  totalAmount?: number;

  status?: string;

  completedAt?: Timestamp | null;
};

export default function ProviderEarningsScreen() {
  const [completedJobs, setCompletedJobs] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const earningsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      earningsQuery,

      (snapshot) => {
        const jobs: Booking[] =
          snapshot.docs
            .map((bookingDoc) => ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            }))
            .filter(
              (booking: any) =>
                booking.status === "completed"
            ) as Booking[];

        /*
          Newest completed jobs first.
        */
        jobs.sort((a, b) => {
          const first =
            a.completedAt?.toMillis?.() || 0;

          const second =
            b.completedAt?.toMillis?.() || 0;

          return second - first;
        });

        console.log(
          "Completed jobs for earnings:",
          jobs.length
        );

        setCompletedJobs(jobs);
        setLoading(false);
      },

      (error) => {
        console.log(
          "Earnings loading error:",
          error
        );

        alert(
          error.message ||
            "Unable to load earnings."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
    TOTAL EARNINGS
  */
  const totalEarnings =
    completedJobs.reduce(
      (total, job) =>
        total +
        Number(job.servicePrice || 0),
      0
    );

  /*
    CURRENT DATE RANGES
  */
  const now = new Date();

  const startOfWeek = new Date(now);

  const day = now.getDay();

  const difference =
    day === 0 ? 6 : day - 1;

  startOfWeek.setDate(
    now.getDate() - difference
  );

  startOfWeek.setHours(
    0,
    0,
    0,
    0
  );

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  /*
    THIS WEEK
  */
  const thisWeekEarnings =
    completedJobs.reduce(
      (total, job) => {
        if (!job.completedAt) {
          return total;
        }

        const completedDate =
          job.completedAt.toDate();

        if (
          completedDate >= startOfWeek
        ) {
          return (
            total +
            Number(
              job.servicePrice || 0
            )
          );
        }

        return total;
      },
      0
    );

  /*
    THIS MONTH
  */
  const thisMonthEarnings =
    completedJobs.reduce(
      (total, job) => {
        if (!job.completedAt) {
          return total;
        }

        const completedDate =
          job.completedAt.toDate();

        if (
          completedDate >=
          startOfMonth
        ) {
          return (
            total +
            Number(
              job.servicePrice || 0
            )
          );
        }

        return total;
      },
      0
    );

  /*
    LAST 7 DAYS GRAPH
  */
  const graphDays = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();

      date.setDate(
        now.getDate() -
          (6 - index)
      );

      date.setHours(
        0,
        0,
        0,
        0
      );

      const nextDay =
        new Date(date);

      nextDay.setDate(
        date.getDate() + 1
      );

      const amount =
        completedJobs.reduce(
          (total, job) => {
            if (!job.completedAt) {
              return total;
            }

            const completedDate =
              job.completedAt.toDate();

            if (
              completedDate >= date &&
              completedDate < nextDay
            ) {
              return (
                total +
                Number(
                  job.servicePrice || 0
                )
              );
            }

            return total;
          },
          0
        );

      return {
        label:
          date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),
        amount,
      };
    }
  );

  const maxGraphAmount =
    Math.max(
      ...graphDays.map(
        (item) => item.amount
      ),
      1
    );

  const formatTransactionDate = (
    timestamp?: Timestamp | null
  ) => {
    if (!timestamp) {
      return "Completed";
    }

    return timestamp
      .toDate()
      .toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
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
          Loading earnings...
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
        <Text style={styles.title}>
          Earnings
        </Text>

        <Text
          style={styles.subtitle}
        >
          Track your income and recent service payments.
        </Text>

        <View
          style={styles.balanceCard}
        >
          <Text
            style={
              styles.balanceLabel
            }
          >
            Total Earnings
          </Text>

          <Text
            style={
              styles.balanceValue
            }
          >
            Rs.{" "}
            {totalEarnings.toLocaleString()}
          </Text>

          <Text
            style={
              styles.balanceGrowth
            }
          >
            {completedJobs.length}{" "}
            completed{" "}
            {completedJobs.length === 1
              ? "job"
              : "jobs"}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text
              style={styles.statLabel}
            >
              This Week
            </Text>

            <Text
              style={styles.statValue}
            >
              Rs.{" "}
              {thisWeekEarnings.toLocaleString()}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text
              style={styles.statLabel}
            >
              This Month
            </Text>

            <Text
              style={styles.statValue}
            >
              Rs.{" "}
              {thisMonthEarnings.toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            Earnings Overview
          </Text>

          <Text
            style={styles.filter}
          >
            Last 7 Days
          </Text>
        </View>

        <View
          style={styles.chartCard}
        >
          <View
            style={styles.chartBars}
          >
            {graphDays.map(
              (item, index) => {
                const height =
                  item.amount === 0
                    ? 6
                    : Math.max(
                        15,
                        (item.amount /
                          maxGraphAmount) *
                          120
                      );

                return (
                  <View
                    key={`${item.label}-${index}`}
                    style={
                      styles.barColumn
                    }
                  >
                    <Text
                      style={
                        styles.barAmount
                      }
                    >
                      {item.amount > 0
                        ? `${Math.round(
                            item.amount /
                              1000
                          )}k`
                        : ""}
                    </Text>

                    <View
                      style={[
                        styles.bar,
                        {
                          height,
                        },
                      ]}
                    />

                    <Text
                      style={
                        styles.dayLabel
                      }
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
        </View>

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            Recent Transactions
          </Text>

          <Text
            style={styles.filter}
          >
            {completedJobs.length} Total
          </Text>
        </View>

        {completedJobs.length ===
        0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyIcon}
            >
              💰
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No earnings yet
            </Text>

            <Text
              style={styles.emptyText}
            >
              Completed jobs will appear
              here as transactions.
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.transactionList
            }
          >
            {completedJobs.map(
              (transaction) => (
                <View
                  key={transaction.id}
                  style={
                    styles.transactionCard
                  }
                >
                  <View
                    style={
                      styles.transactionIcon
                    }
                  >
                    <Text
                      style={
                        styles.transactionEmoji
                      }
                    >
                      💰
                    </Text>
                  </View>

                  <View
                    style={
                      styles.transactionInfo
                    }
                  >
                    <Text
                      style={
                        styles.transactionService
                      }
                    >
                      {transaction.service ||
                        "Home Service"}
                    </Text>

                    <Text
                      style={
                        styles.transactionCustomer
                      }
                    >
                      {transaction.customerName ||
                        "Customer"}
                    </Text>

                    <Text
                      style={
                        styles.transactionDate
                      }
                    >
                      {formatTransactionDate(
                        transaction.completedAt
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.amountArea
                    }
                  >
                    <Text
                      style={
                        styles.amount
                      }
                    >
                      Rs.{" "}
                      {Number(
                        transaction.servicePrice ||
                          0
                      ).toLocaleString()}
                    </Text>

                    <Text
                      style={styles.paid}
                    >
                      ✓ Earned
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>

      <ProviderBottomNav />
    </View>
  );
}

const styles =
  StyleSheet.create({
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
      color: "#64748B",
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

    balanceCard: {
      marginTop: 20,
      borderRadius: 18,
      padding: 20,
      backgroundColor: "#1D4ED8",
    },

    balanceLabel: {
      fontSize: 12,
      color: "#BFDBFE",
    },

    balanceValue: {
      marginTop: 6,
      fontSize: 30,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    balanceGrowth: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: "600",
      color: "#BBF7D0",
    },

    statsRow: {
      marginTop: 14,
      flexDirection: "row",
      gap: 12,
    },

    statCard: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    statLabel: {
      fontSize: 11,
      color: "#64748B",
    },

    statValue: {
      marginTop: 5,
      fontSize: 17,
      fontWeight: "800",
      color: "#0F172A",
    },

    sectionHeader: {
      marginTop: 24,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: "#0F172A",
    },

    filter: {
      fontSize: 12,
      fontWeight: "700",
      color: "#1D4ED8",
    },

    chartCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      padding: 16,
    },

    chartBars: {
      height: 180,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "flex-end",
    },

    barColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
    },

    bar: {
      width: 20,
      borderRadius: 5,
      backgroundColor: "#2563EB",
    },

    barAmount: {
      marginBottom: 4,
      minHeight: 12,
      fontSize: 8,
      fontWeight: "700",
      color: "#475569",
    },

    dayLabel: {
      marginTop: 7,
      fontSize: 9,
      color: "#64748B",
    },

    transactionList: {
      gap: 10,
    },

    transactionCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
    },

    transactionIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: "#DCFCE7",
      alignItems: "center",
      justifyContent: "center",
    },

    transactionEmoji: {
      fontSize: 20,
    },

    transactionInfo: {
      flex: 1,
      marginLeft: 11,
    },

    transactionService: {
      fontSize: 13,
      fontWeight: "700",
      color: "#0F172A",
    },

    transactionCustomer: {
      marginTop: 2,
      fontSize: 11,
      color: "#475569",
    },

    transactionDate: {
      marginTop: 2,
      fontSize: 10,
      color: "#94A3B8",
    },

    amountArea: {
      alignItems: "flex-end",
    },

    amount: {
      fontSize: 14,
      fontWeight: "800",
      color: "#0F172A",
    },

    paid: {
      marginTop: 3,
      fontSize: 10,
      fontWeight: "700",
      color: "#16A34A",
    },

    emptyCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      padding: 30,
      alignItems: "center",
    },

    emptyIcon: {
      fontSize: 36,
    },

    emptyTitle: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: "800",
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      color: "#64748B",
    },
  });