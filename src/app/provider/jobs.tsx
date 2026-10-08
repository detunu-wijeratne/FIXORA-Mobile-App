// src/app/provider/jobs.tsx

import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import ScreenHeader from "../../components/ScreenHeader";
import StatusBadge, {
  StatusType,
} from "../../components/StatusBadge";

import { auth, db } from "../../services/firebase";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../theme";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

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

  source?: string;
};

type TabKey =
  | "all"
  | "upcoming"
  | "completed";

const asMoney = (value: any) =>
  `Rs. ${Number(
    value || 0
  ).toLocaleString()}`;

const formatWhen = (
  date?: string,
  time?: string
) => {
  const d = (date || "").trim();
  const t = (time || "").trim();

  if (!d && !t) {
    return "—";
  }

  const dateLabel =
    /^\d+$/.test(d)
      ? `Day ${d}`
      : d;

  return [dateLabel, t]
    .filter(Boolean)
    .join(" • ");
};

const toStatusType = (
  status?: string
): StatusType => {
  if (status === "pending") {
    return "pending";
  }

  if (status === "confirmed") {
    return "confirmed";
  }

  if (status === "in_progress") {
    return "in_progress";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "declined") {
    return "declined";
  }

  if (status === "cancelled") {
    return "cancelled";
  }

  return "confirmed";
};

export default function ProviderJobsScreen() {
  const [jobs, setJobs] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedTab, setSelectedTab] =
    useState<TabKey>("all");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace(
        "/provider/login"
      );

      return;
    }

    const jobsQuery = query(
      collection(
        db,
        "bookings"
      ),
      where(
        "providerId",
        "==",
        user.uid
      )
    );

    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const loadedJobs: Booking[] =
          snapshot.docs
            .map((jobDoc) => ({
              id: jobDoc.id,
              ...(jobDoc.data() as any),
            }))
            .filter(
              (job: any) =>
                [
                  "confirmed",
                  "in_progress",
                  "completed",
                ].includes(
                  job.status
                )
            ) as Booking[];

        loadedJobs.sort(
          (a, b) => {
            const da =
              Number(a.date);

            const dbb =
              Number(b.date);

            if (
              !Number.isNaN(da) &&
              !Number.isNaN(dbb) &&
              da !== dbb
            ) {
              return da - dbb;
            }

            return String(
              a.time || ""
            ).localeCompare(
              String(
                b.time || ""
              )
            );
          }
        );

        setJobs(
          loadedJobs
        );

        setLoading(
          false
        );
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

        setLoading(
          false
        );
      }
    );

    return () =>
      unsubscribe();
  }, []);

  const {
    upcomingCount,
    completedCount,
    filteredJobs,
  } = useMemo(() => {
    const upcoming =
      jobs.filter(
        (job) =>
          job.status ===
            "confirmed" ||
          job.status ===
            "in_progress"
      );

    const completed =
      jobs.filter(
        (job) =>
          job.status ===
          "completed"
      );

    const filtered =
      selectedTab === "all"
        ? jobs
        : selectedTab ===
            "upcoming"
          ? upcoming
          : completed;

    return {
      upcomingCount:
        upcoming.length,

      completedCount:
        completed.length,

      filteredJobs:
        filtered,
    };
  }, [
    jobs,
    selectedTab,
  ]);

  const openJob = (
    job: Booking
  ) => {
    router.push({
      pathname:
        "/provider/job-details",

      params: {
        bookingId:
          job.id,

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
          job.description ||
          "",

        price:
          String(
            job.servicePrice ||
              0
          ),

        totalAmount:
          String(
            job.totalAmount ||
              0
          ),

        status:
          job.status ||
          "confirmed",

        source:
          job.source || "",
      },
    });
  };

  return (
    <SafeAreaView
      style={
        styles.container
      }
      edges={["top"]}
    >
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <ScreenHeader
          eyebrow="FIXORA"
          title="My jobs"
          subtitle="Manage confirmed, ongoing and completed service jobs."
        />

        {/* MANUAL JOB BUTTON */}

        <TouchableOpacity
          style={
            styles.manualJobButton
          }
          activeOpacity={0.85}
          onPress={() =>
            router.push(
              "/provider/create-manual-job"
            )
          }
        >
          <View
            style={
              styles.manualJobIcon
            }
          >
            <Ionicons
              name="add"
              size={22}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.manualJobInfo
            }
          >
            <Text
              style={
                styles.manualJobTitle
              }
            >
              Add Manual Job
            </Text>

            <Text
              style={
                styles.manualJobSubtitle
              }
            >
              Add a phone, WhatsApp or offline service job.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={
              colors.primary
            }
          />
        </TouchableOpacity>

        {/* TABS */}

        <View
          style={styles.tabsCard}
        >
          <TabButton
            label="All"
            active={
              selectedTab ===
              "all"
            }
            onPress={() =>
              setSelectedTab(
                "all"
              )
            }
          />

          <TabButton
            label={`Upcoming (${upcomingCount})`}
            active={
              selectedTab ===
              "upcoming"
            }
            onPress={() =>
              setSelectedTab(
                "upcoming"
              )
            }
          />

          <TabButton
            label={`Completed (${completedCount})`}
            active={
              selectedTab ===
              "completed"
            }
            onPress={() =>
              setSelectedTab(
                "completed"
              )
            }
          />
        </View>

        {/* LIST */}

        {loading ? (
          <View
            style={
              styles.loadingWrap
            }
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading jobs…
            </Text>
          </View>
        ) : filteredJobs.length ===
          0 ? (
          <View
            style={styles.emptyCard}
          >
            <View
              style={
                styles.emptyIconWrap
              }
            >
              <Ionicons
                name={
                  selectedTab ===
                  "completed"
                    ? "checkmark-done-outline"
                    : "briefcase-outline"
                }
                size={22}
                color={
                  colors.textSecondary
                }
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No jobs found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              {selectedTab ===
              "completed"
                ? "Completed jobs will appear here."
                : "Accepted customer requests and manual jobs will appear here."}
            </Text>
          </View>
        ) : (
          <View
            style={styles.list}
          >
            {filteredJobs.map(
              (job) => (
                <TouchableOpacity
                  key={job.id}
                  style={
                    styles.jobCard
                  }
                  onPress={() =>
                    openJob(
                      job
                    )
                  }
                  activeOpacity={
                    0.85
                  }
                >
                  <View
                    style={
                      styles.jobTop
                    }
                  >
                    <View
                      style={
                        styles.iconBox
                      }
                    >
                      <Ionicons
                        name={
                          job.source ===
                          "manual"
                            ? "create-outline"
                            : "construct-outline"
                        }
                        size={18}
                        color={
                          colors.primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.info
                      }
                    >
                      <View
                        style={
                          styles.serviceRow
                        }
                      >
                        <Text
                          style={
                            styles.service
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {job.service ||
                            "Home Service"}
                        </Text>

                        {job.source ===
                          "manual" && (
                          <View
                            style={
                              styles.manualBadge
                            }
                          >
                            <Text
                              style={
                                styles.manualBadgeText
                              }
                            >
                              MANUAL
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={
                          styles.customer
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {job.customerName ||
                          "Customer"}
                      </Text>
                    </View>

                    <StatusBadge
                      status={toStatusType(
                        job.status
                      )}
                    />
                  </View>

                  <View
                    style={
                      styles.meta
                    }
                  >
                    <View
                      style={
                        styles.metaRow
                      }
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={
                          colors.textSecondary
                        }
                      />

                      <Text
                        style={
                          styles.metaText
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {formatWhen(
                          job.date,
                          job.time
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.metaRow
                      }
                    >
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={
                          colors.textSecondary
                        }
                      />

                      <Text
                        style={
                          styles.metaText
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {job.address ||
                          "Location not provided"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.bottom
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.priceLabel
                        }
                      >
                        Estimated service
                      </Text>

                      <Text
                        style={
                          styles.price
                        }
                      >
                        {asMoney(
                          job.servicePrice
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.ctaRow
                      }
                    >
                      <Text
                        style={
                          styles.ctaText
                        }
                      >
                        View
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={
                          colors.primary
                        }
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.tab,
        active &&
          styles.tabActive,
      ]}
    >
      <Text
        style={[
          styles.tabText,
          active &&
            styles.tabTextActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    scrollContent: {
      padding:
        spacing.xl,
      paddingBottom:
        spacing.xxxl +
        90,
    },

    /* MANUAL JOB */

    manualJobButton: {
      marginTop:
        spacing.lg,
      marginBottom:
        spacing.lg,
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.xl,
      padding:
        spacing.md,
    },

    manualJobIcon: {
      width: 46,
      height: 46,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.primary,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    manualJobInfo: {
      flex: 1,
      marginLeft:
        spacing.md,
      marginRight:
        spacing.sm,
    },

    manualJobTitle: {
      fontSize: 14,
      fontWeight:
        "900",
      color:
        colors.textPrimary,
    },

    manualJobSubtitle: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 16,
      color:
        colors.textSecondary,
    },

    tabsCard: {
      flexDirection:
        "row",
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.xl,
      padding: 6,
      gap: 6,
    },

    tab: {
      flex: 1,
      minHeight: 40,
      borderRadius:
        radius.lg,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        spacing.sm,
    },

    tabActive: {
      backgroundColor:
        colors.primarySoft,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    tabText: {
      fontSize: 12,
      fontWeight:
        "800",
      color:
        colors.textSecondary,
    },

    tabTextActive: {
      color:
        colors.primary,
    },

    loadingWrap: {
      marginTop:
        spacing.xl +
        10,
      alignItems:
        "center",
    },

    loadingText: {
      marginTop:
        spacing.md,
      color:
        colors.textSecondary,
    },

    emptyCard: {
      marginTop:
        spacing.lg,
      backgroundColor:
        colors.surface,
      borderRadius:
        radius.xl,
      borderWidth: 1,
      borderColor:
        colors.border,
      padding:
        spacing.xl,
      alignItems:
        "center",
    },

    emptyIconWrap: {
      width: 46,
      height: 46,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.background,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop:
        spacing.md,
      fontSize: 15,
      fontWeight:
        "900",
      color:
        colors.textPrimary,
    },

    emptyText: {
      marginTop:
        spacing.xs,
      fontSize: 12,
      lineHeight: 18,
      color:
        colors.textSecondary,
      textAlign:
        "center",
    },

    list: {
      marginTop:
        spacing.md,
      gap:
        spacing.md,
    },

    jobCard: {
      backgroundColor:
        colors.surface,
      borderRadius:
        radius.xl,
      borderWidth: 1,
      borderColor:
        colors.border,
      padding:
        spacing.lg,
    },

    jobTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        spacing.md,
    },

    iconBox: {
      width: 44,
      height: 44,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.primarySoft,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    info: {
      flex: 1,
    },

    serviceRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },

    service: {
      ...typography.cardTitle,
      fontWeight:
        "900",
      flexShrink: 1,
    },

    manualBadge: {
      backgroundColor:
        "#EFF6FF",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 7,
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
    },

    manualBadgeText: {
      fontSize: 8,
      fontWeight:
        "900",
      color:
        "#2563EB",
      letterSpacing: 0.4,
    },

    customer: {
      marginTop: 3,
      ...typography.secondary,
      fontSize: 12,
    },

    meta: {
      marginTop:
        spacing.md,
      gap:
        spacing.sm,
    },

    metaRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    metaText: {
      flex: 1,
      fontSize: 12,
      color:
        colors.textSecondary,
    },

    bottom: {
      marginTop:
        spacing.lg,
      paddingTop:
        spacing.md,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    priceLabel: {
      ...typography.caption,
      color:
        colors.textSecondary,
    },

    price: {
      marginTop: 3,
      fontSize: 15,
      fontWeight:
        "900",
      color:
        colors.textPrimary,
    },

    ctaRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 2,
    },

    ctaText: {
      fontSize: 12,
      fontWeight:
        "900",
      color:
        colors.primary,
    },
  });