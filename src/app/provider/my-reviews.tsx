import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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

import { auth, db } from "../../services/firebase";

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
      where("providerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const loadedReviews: Review[] = snapshot.docs.map((reviewDoc) => ({
          id: reviewDoc.id,
          ...reviewDoc.data(),
        })) as Review[];

        /*
          Newest first, when createdAt has resolved.
        */
        loadedReviews.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.().getTime() ?? 0;
          const timeB = b.createdAt?.toDate?.().getTime() ?? 0;
          return timeB - timeA;
        });

        setReviews(loadedReviews);
        setLoading(false);
      },
      (error) => {
        console.log("Provider reviews loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((total, item) => total + Number(item.rating || 0), 0) /
        reviewCount
      : 0;

  const formatDate = (review: Review) => {
    const date = review.createdAt?.toDate?.();

    if (!date) {
      return "";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Reviews</Text>

          <View style={styles.backButtonSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryRatingRow}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.summaryRatingValue}>
                  {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                </Text>
              </View>
              <Text style={styles.summaryLabel}>Average Rating</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryCountValue}>{reviewCount}</Text>
              <Text style={styles.summaryLabel}>
                {reviewCount === 1 ? "Review" : "Reviews"}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : reviews.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="star-outline" size={34} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptyText}>
                Customer reviews will appear here after they rate a completed
                job.
              </Text>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {reviews.map((item) => (
                <View key={item.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeaderRow}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={
                            star <= Number(item.rating || 0)
                              ? "star"
                              : "star-outline"
                          }
                          size={15}
                          color="#F59E0B"
                        />
                      ))}
                    </View>

                    {formatDate(item) ? (
                      <Text style={styles.reviewDate}>{formatDate(item)}</Text>
                    ) : null}
                  </View>

                  {item.service && (
                    <View style={styles.serviceBadge}>
                      <Text style={styles.serviceBadgeText}>
                        {item.service}
                      </Text>
                    </View>
                  )}

                  {item.review ? (
                    <Text style={styles.reviewMessage}>{item.review}</Text>
                  ) : (
                    <Text style={styles.noWrittenReview}>
                      No written review.
                    </Text>
                  )}

                  <View style={styles.reviewerRow}>
                    <Ionicons
                      name="person-circle-outline"
                      size={15}
                      color="#64748B"
                    />
                    <Text style={styles.reviewerText}>
                      {item.customerEmail || "Verified customer"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonSpacer: {
    width: 38,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  summaryRatingValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  summaryCountValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#64748B",
  },

  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
  },

  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
  },

  emptyCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
  },

  reviewList: {
    marginTop: 16,
    gap: 12,
  },

  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },

  reviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  starsRow: {
    flexDirection: "row",
    gap: 2,
  },

  reviewDate: {
    fontSize: 11,
    color: "#94A3B8",
  },

  serviceBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  serviceBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  reviewMessage: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
  },

  noWrittenReview: {
    marginTop: 10,
    fontSize: 12,
    fontStyle: "italic",
    color: "#94A3B8",
  },

  reviewerRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  reviewerText: {
    fontSize: 11,
    color: "#64748B",
  },
});
