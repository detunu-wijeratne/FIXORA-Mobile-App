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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../services/firebase";

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
    typeof params.providerId === "string"
      ? params.providerId
      : "";

  const name =
    typeof params.name === "string"
      ? params.name
      : "Service Provider";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Home Service";

  const district =
    typeof params.district === "string"
      ? params.district
      : "Location not set";

  const experience =
    typeof params.experience === "string"
      ? params.experience
      : "New provider";

  const price =
    typeof params.price === "string"
      ? params.price
      : "2500";

  const verified =
    params.verified === "true";

  const initialRating =
    typeof params.rating === "string"
      ? Number(params.rating)
      : 0;

  const initialReviews =
    typeof params.reviews === "string"
      ? Number(params.reviews)
      : 0;

  const [rating, setRating] =
    useState(initialRating);

  const [reviewCount, setReviewCount] =
    useState(initialReviews);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  useEffect(() => {
    if (!providerId) {
      return;
    }

    const providerRef = doc(
      db,
      "users",
      providerId
    );

    const unsubscribeProvider =
      onSnapshot(
        providerRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            return;
          }

          const data = snapshot.data();

          setRating(
            Number(data.rating || 0)
          );

          setReviewCount(
            Number(data.reviewCount || 0)
          );
        },
        (error) => {
          console.log(
            "Provider profile error:",
            error
          );
        }
      );

    const reviewsQuery = query(
      collection(db, "reviews"),
      where(
        "providerId",
        "==",
        providerId
      )
    );

    const unsubscribeReviews =
      onSnapshot(
        reviewsQuery,
        (snapshot) => {
          const loadedReviews: Review[] =
            snapshot.docs.map(
              (reviewDoc) => ({
                id: reviewDoc.id,
                ...reviewDoc.data(),
              })
            ) as Review[];

          setReviews(loadedReviews);

          // REAL REVIEW COUNT
          setReviewCount(loadedReviews.length);

          // REAL AVERAGE RATING
          if (loadedReviews.length > 0) {
            const totalRating =
              loadedReviews.reduce(
                (total, item) =>
                  total + Number(item.rating || 0),
                0
              );

            const averageRating =
              totalRating / loadedReviews.length;

            setRating(averageRating);
          } else {
            setRating(0);
          }
        },
        (error) => {
          console.log(
            "Reviews loading error:",
            error
          );
        }
      );

    return () => {
      unsubscribeProvider();
      unsubscribeReviews();
    };
  }, [providerId]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              👨‍🔧
            </Text>
          </View>

          <Text style={styles.name}>
            {name}
          </Text>

          <Text style={styles.service}>
            {service}
          </Text>

          {verified && (
            <View
              style={
                styles.verifiedBadge
              }
            >
              <Text
                style={
                  styles.verifiedText
                }
              >
                ✓ Verified Provider
              </Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                style={styles.statValue}
              >
                ⭐{" "}
                {rating > 0
                  ? rating.toFixed(1)
                  : "New"}
              </Text>

              <Text
                style={styles.statLabel}
              >
                {reviewCount}{" "}
                {reviewCount === 1
                  ? "review"
                  : "reviews"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text
                style={styles.statValue}
              >
                {experience}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Experience
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text
                style={styles.statValue}
                numberOfLines={2}
              >
                {district}
              </Text>

              <Text
                style={styles.statLabel}
              >
                District
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About
          </Text>

          <Text style={styles.description}>
            Experienced and reliable
            professional providing quality
            home services. Available for
            repairs, installations and
            general service requests.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Service Details
          </Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text
                style={styles.detailLabel}
              >
                Service
              </Text>

              <Text
                style={styles.detailValue}
              >
                {service}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text
                style={styles.detailLabel}
              >
                Starting price
              </Text>

              <Text
                style={styles.detailValue}
              >
                Rs.{" "}
                {Number(
                  price
                ).toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text
                style={styles.detailLabel}
              >
                District
              </Text>

              <Text
                style={styles.detailValue}
              >
                {district}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text
                style={styles.detailLabel}
              >
                Availability
              </Text>

              <Text
                style={styles.available}
              >
                Available
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              Reviews
            </Text>

            <Text style={styles.reviewCountText}>
              {reviewCount}{" "}
              {reviewCount === 1
                ? "review"
                : "reviews"}
            </Text>
          </View>

          {reviews.length === 0 ? (
            <View
              style={styles.reviewCard}
            >
              <Text
                style={
                  styles.noReviewText
                }
              >
                Reviews will appear here
                after customers complete
                services.
              </Text>
            </View>
          ) : (
            reviews.map((item) => (
              <View
                key={item.id}
                style={styles.reviewCard}
              >
                <View
                  style={
                    styles.reviewHeader
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.reviewerName
                      }
                    >
                      Customer
                    </Text>

                    <Text
                      style={
                        styles.reviewerEmail
                      }
                    >
                      {item.customerEmail ||
                        "Verified customer"}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.reviewRating
                    }
                  >
                    ⭐{" "}
                    {Number(
                      item.rating || 0
                    ).toFixed(1)}
                  </Text>
                </View>

                {item.review ? (
                  <Text
                    style={
                      styles.reviewMessage
                    }
                  >
                    {item.review}
                  </Text>
                ) : (
                  <Text
                    style={
                      styles.noWrittenReview
                    }
                  >
                    No written review.
                  </Text>
                )}

                {item.service && (
                  <Text
                    style={
                      styles.reviewService
                    }
                  >
                    Service: {item.service}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>
            Starting from
          </Text>

          <Text style={styles.bottomPrice}>
            Rs.{" "}
            {Number(
              price
            ).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname:
                "/select-date-time",

              params: {
                providerId,
                name,
                service,
                price,
              },
            })
          }
        >
          <Text
            style={
              styles.bookButtonText
            }
          >
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingBottom: 120,
  },

  profileSection: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 42,
  },

  name: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  service: {
    marginTop: 4,
    fontSize: 15,
    color: "#64748B",
  },

  verifiedBadge: {
    marginTop: 10,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
  },

  statsRow: {
    marginTop: 24,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },

  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#94A3B8",
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: "#E2E8F0",
  },

  section: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
  },

  detailCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  detailLabel: {
    fontSize: 14,
    color: "#64748B",
  },

  detailValue: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  available: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewCountText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },

  reviewCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },

  noReviewText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  reviewerEmail: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },

  reviewRating: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F59E0B",
  },

  reviewMessage: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  noWrittenReview: {
    marginTop: 12,
    fontSize: 12,
    fontStyle: "italic",
    color: "#94A3B8",
  },

  reviewService: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  bottomLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  bottomPrice: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  bookButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 34,
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});