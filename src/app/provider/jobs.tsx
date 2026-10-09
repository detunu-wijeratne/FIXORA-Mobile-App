import ProviderIllustration from "../../components/ProviderIllustration";
// src/app/provider/jobs.tsx

import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import ScreenHeader from "../../components/ProviderPageHeader";
import StatusBadge, {
  StatusType,
} from "../../components/StatusBadge";

import { auth, db } from "../../services/firebase";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../theme/provider";

import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
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
  | "completed"
  | "manual";

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
  const [jobToDelete, setJobToDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const deleteManualJob = async () => {
    const user = auth.currentUser;
    if (!user || !jobToDelete || deleting) return;

    setDeleting(true);
    setDeleteError("");
    try {
      const jobRef = doc(db, "bookings", jobToDelete.id);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(jobRef);
        if (!snapshot.exists()) return;
        const job = snapshot.data();
        if (job.providerId !== user.uid || job.source !== "manual") {
          throw new Error("You can only delete your own manual jobs.");
        }
        transaction.delete(jobRef);
      });
      setJobToDelete(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete the manual job. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

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
    manualCount,
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

    const manual = jobs.filter((job) => job.source === "manual");

    const filtered =
      selectedTab === "all"
        ? jobs
        : selectedTab === "manual"
          ? manual
        : selectedTab ===
            "upcoming"
          ? upcoming
          : completed;

    return {
      manualCount: manual.length,
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
          <TabButton
            label={`Manual (${manualCount})`}
            active={selectedTab === "manual"}
            onPress={() => setSelectedTab("manual")}
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
                : selectedTab === "manual"
                  ? "Jobs you create manually will appear here."
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

                    <View style={styles.jobActions}>
                      {job.source === "manual" && (
                        <TouchableOpacity accessibilityRole="button"
                          accessibilityLabel={`Edit manual job for ${job.customerName || "Customer"}`}
                          style={styles.ctaRow}
                          onPress={(event) => {
                            event.stopPropagation();
                            router.push({ pathname: "/provider/create-manual-job", params: { jobId: job.id } });
                          }}>
                          <Ionicons name="create-outline" size={16} color={colors.primary} />
                          <Text style={styles.ctaText}>Edit</Text>
                        </TouchableOpacity>
                      )}
                      {job.source === "manual" && (
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel={`Delete manual job for ${job.customerName || "Customer"}`}
                          style={styles.deleteButton}
                          onPress={(event) => {
                            event.stopPropagation();
                            setDeleteError("");
                            setJobToDelete(job);
                          }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#B91C1C" />
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    <View style={styles.ctaRow}>
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
                  </View>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={jobToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => { if (!deleting) setJobToDelete(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.emptyTitle}>Delete manual job?</Text>
            <Text style={styles.emptyText}>
              Delete {jobToDelete?.service || "this job"} for {jobToDelete?.customerName || "Customer"}? This cannot be undone.
            </Text>
            {!!deleteError && <Text style={styles.deleteText}>{deleteError}</Text>}
            <View style={styles.jobActions}>
              <TouchableOpacity style={styles.deleteButton} disabled={deleting} onPress={() => setJobToDelete(null)}>
                <Text style={styles.ctaText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} disabled={deleting} onPress={deleteManualJob}>
                {deleting ? <ActivityIndicator color="#B91C1C" /> : <Text style={styles.deleteText}>Delete job</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    jobActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 12,
      flexWrap: "wrap",
    },
    deleteButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal: 8,
    },
    deleteText: { color: "#B91C1C", fontSize: 12, fontWeight: "800" },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    modalCard: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      gap: spacing.md,
    },
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
      flexWrap: "wrap",
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
      flexGrow: 1,
      flexBasis: "45%",
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
