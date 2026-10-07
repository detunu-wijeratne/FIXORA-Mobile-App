import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import { db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

type Review = {
  id: string;
  customerEmail?: string;
  rating?: number;
  review?: string;
  service?: string;
};

export default function ProviderProfileScreen() {
  const params = useLocalSearchParams();

  const providerId =
    typeof params.providerId === "string" ? params.providerId : "";

  const name =
    typeof params.name === "string" ? params.name : "Service Provider";

  const service =
    typeof params.service === "string" ? params.service : "Home Service";

  const district =
    typeof params.district === "string" ? params.district : "Location not set";

  const experience =
    typeof params.experience === "string" ? params.experience : "New provider";

  const price = typeof params.price === "string" ? params.price : "2500";

  const verified = params.verified === "true";

  const profileImageUrl =
    typeof params.profileImageUrl === "string" ? params.profileImageUrl : "";

  const initialRating =
    typeof params.rating === "string" ? Number(params.rating) : 0;

  const initialReviews =
    typeof params.reviews === "string" ? Number(params.reviews) : 0;

  const [rating, setRating] = useState(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviews);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!providerId) {
      return;
    }

    const providerRef = doc(db, "users", providerId);

    const unsubscribeProvider = onSnapshot(
      providerRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        const data = snapshot.data();

        setRating(Number(data.rating || 0));
        setReviewCount(Number(data.reviewCount || 0));
      },
      (error) => {
        console.log("Provider profile error:", error);
      }
    );

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("providerId", "==", providerId)
    );

    const unsubscribeReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const loadedReviews: Review[] = snapshot.docs.map((reviewDoc) => ({
          id: reviewDoc.id,
          ...reviewDoc.data(),
        })) as Review[];

        setReviews(loadedReviews);

        // REAL REVIEW COUNT
        setReviewCount(loadedReviews.length);

        // REAL AVERAGE RATING
        if (loadedReviews.length > 0) {
          const totalRating = loadedReviews.reduce(
            (total, item) => total + Number(item.rating || 0),
            0
          );

          const averageRating = totalRating / loadedReviews.length;

          setRating(averageRating);
        } else {
          setRating(0);
        }
      },
      (error) => {
        console.log("Reviews loading error:", error);
      }
    );

    return () => {
      unsubscribeProvider();
      unsubscribeReviews();
    };
  }, [providerId]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={44} color={colors.primary} />
            </View>
          )}

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.service}>{service}</Text>

          {verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
              <Text style={styles.verifiedText}>Verified Provider</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.statValue}>
                  {rating > 0 ? rating.toFixed(1) : "New"}
                </Text>
              </View>

              <Text style={styles.statLabel}>
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue} numberOfLines={1}>
                {experience}
              </Text>

              <Text style={styles.statLabel}>Experience</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue} numberOfLines={2}>
                {district}
              </Text>

              <Text style={styles.statLabel}>District</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <Text style={styles.description}>
            Experienced and reliable professional providing quality home
            services. Available for repairs, installations and general
            service requests.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{service}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Starting price</Text>
              <Text style={styles.detailValue}>
                Rs. {Number(price).toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>District</Text>
              <Text style={styles.detailValue}>{district}</Text>
            </View>

            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={styles.detailLabel}>Availability</Text>

              <View style={styles.availabilityPill}>
                <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                <Text style={styles.available}>Available</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Reviews</Text>

            <Text style={styles.reviewCountText}>
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </Text>
          </View>

          {reviews.length === 0 ? (
            <View style={styles.reviewCard}>
              <Text style={styles.noReviewText}>
                Reviews will appear here after customers complete services.
              </Text>
            </View>
          ) : (
            reviews.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewerName}>Customer</Text>

                    <Text style={styles.reviewerEmail}>
                      {item.customerEmail || "Verified customer"}
                    </Text>
                  </View>

                  <View style={styles.reviewRatingRow}>
                    <Ionicons name="star" size={13} color={colors.warning} />
                    <Text style={styles.reviewRating}>
                      {Number(item.rating || 0).toFixed(1)}
                    </Text>
                  </View>
                </View>

                {item.review ? (
                  <Text style={styles.reviewMessage}>{item.review}</Text>
                ) : (
                  <Text style={styles.noWrittenReview}>No written review.</Text>
                )}

                {item.service && (
                  <Text style={styles.reviewService}>Service: {item.service}</Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Starting from</Text>
          <Text style={styles.bottomPrice}>
            Rs. {Number(price).toLocaleString()}
          </Text>
        </View>

        <PrimaryButton
          title="Book Service"
          style={styles.bookButton}
          onPress={() =>
            router.push({
              pathname: "/select-date-time",
              params: {
                providerId,
                name,
                service,
                price,
              },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  profileSection: {
    backgroundColor: colors.surface,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + 4,
    paddingBottom: spacing.xl,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primarySoft,
  },

  name: {
    marginTop: spacing.md + 2,
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  service: {
    marginTop: spacing.xs,
    fontSize: 15,
    color: colors.textSecondary,
  },

  verifiedBadge: {
    marginTop: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },

  verifiedText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },

  statsRow: {
    marginTop: spacing.xl,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },

  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },

  statLabel: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: colors.border,
  },

  section: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },

  sectionTitle: {
    ...typography.sectionHeading,
  },

  description: {
    marginTop: spacing.sm + 2,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  detailCard: {
    marginTop: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md + 2,
  },

  detailRowLast: {
    marginBottom: 0,
  },

  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  detailValue: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  availabilityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  available: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.success,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewCountText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  reviewCard: {
    marginTop: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    backgroundColor: colors.surface,
  },

  noReviewText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  reviewerEmail: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textMuted,
  },

  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  reviewRating: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  reviewMessage: {
    marginTop: spacing.md,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  noWrittenReview: {
    marginTop: spacing.md,
    fontSize: 12,
    fontStyle: "italic",
    color: colors.textMuted,
  },

  reviewService: {
    marginTop: spacing.sm + 2,
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
  },

  bottomLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  bottomPrice: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  bookButton: {
    paddingHorizontal: spacing.xxl,
    minHeight: 48,
  },
});
