// src/app/provider/my-reviews.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { collection, onSnapshot, query, where } from "firebase/firestore";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenHeader from "../../components/ScreenHeader";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

type Review = {
  id: string;
  customerEmail?: string;
  service?: string;
  rating?: number;
  review?: string;
  createdAt?: {
    toDate: () => Date;
  };
};

const formatDate = (review: Review) => {
  const date = review.createdAt?.toDate?.();
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ProviderMyReviewsScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("providerId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const loaded: Review[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as Review[];

        loaded.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.().getTime() ?? 0;
          const timeB = b.createdAt?.toDate?.().getTime() ?? 0;
          return timeB - timeA;
        });

        setReviews(loaded);
        setLoading(false);
      },
      (error) => {
        console.log("Provider reviews loading error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const reviewCount = reviews.length;

  const averageRating = useMemo(() => {
    if (reviewCount === 0) return 0;
    return (
      reviews.reduce((total, item) => total + Number(item.rating || 0), 0) /
      reviewCount
    );
  }, [reviews, reviewCount]);

  const ratingLabel = useMemo(() => {
    if (averageRating >= 4.5) return "Excellent";
    if (averageRating >= 4.0) return "Great";
    if (averageRating >= 3.0) return "Good";
    if (averageRating > 0) return "Needs improvement";
    return "New";
  }, [averageRating]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topTitle} numberOfLines={1}>
          My reviews
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          eyebrow="FIXORA"
          title="Ratings & Reviews"
          subtitle="Your customer feedback helps you build trust and win more jobs."
        />

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.starCircle}>
              <Ionicons name="star" size={18} color="#F59E0B" />
            </View>

            <View>
              <Text style={styles.summaryValue}>
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </Text>
              <Text style={styles.summaryLabel}>{ratingLabel}</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRight}>
            <Text style={styles.summaryValue}>{reviewCount}</Text>
            <Text style={styles.summaryLabel}>
              {reviewCount === 1 ? "Review" : "Reviews"}
            </Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading reviews…</Text>
          </View>
        ) : reviews.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="star-outline" size={22} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyText}>
              Reviews appear here after customers rate a completed job.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {reviews.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewTopRow}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={
                          star <= Number(item.rating || 0)
                            ? "star"
                            : "star-outline"
                        }
                        size={14}
                        color="#F59E0B"
                      />
                    ))}
                  </View>

                  {formatDate(item) ? (
                    <Text style={styles.reviewDate}>{formatDate(item)}</Text>
                  ) : null}
                </View>

                {item.service ? (
                  <View style={styles.servicePill}>
                    <Ionicons name="pricetag-outline" size={13} color={colors.primary} />
                    <Text style={styles.servicePillText}>{item.service}</Text>
                  </View>
                ) : null}

                {item.review?.trim() ? (
                  <Text style={styles.reviewText}>{item.review}</Text>
                ) : (
                  <Text style={styles.noReviewText}>No written review.</Text>
                )}

                <View style={styles.reviewerRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.reviewerText} numberOfLines={1}>
                    {item.customerEmail || "Verified customer"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Tip to get better reviews</Text>
            <Text style={styles.tipText}>
              Confirm arrival time, keep your workspace clean, and explain what you fixed.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
  },

  topBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 24,
  },

  summaryCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  starCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRight: {
    flex: 1,
    alignItems: "center",
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: colors.border,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  summaryLabel: {
    marginTop: 3,
    ...typography.caption,
    color: colors.textSecondary,
  },

  loadingWrap: {
    marginTop: spacing.xl,
    alignItems: "center",
  },

  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  emptyCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
  },

  emptyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  emptyText: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: "center",
  },

  list: {
    marginTop: spacing.md,
    gap: spacing.md,
  },

  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  reviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  starsRow: {
    flexDirection: "row",
    gap: 2,
  },

  reviewDate: {
    ...typography.caption,
    color: colors.textMuted,
  },

  servicePill: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },

  servicePillText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primary,
  },

  reviewText: {
    marginTop: spacing.md,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textPrimary,
  },

  noReviewText: {
    marginTop: spacing.md,
    fontSize: 12,
    fontStyle: "italic",
    color: colors.textMuted,
  },

  reviewerRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  reviewerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },

  tipCard: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  tipText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});