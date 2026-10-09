import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  where,
} from "firebase/firestore";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import { auth, db } from "../services/firebase";
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
  const insets = useSafeAreaInsets();

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
  const [reviewsError, setReviewsError] = useState("");

  /*
    Favourite Providers (Ranmith). isFavourite reflects whether
    users/{customerUid}/favourites/{providerId} currently exists.
    checkingFavourite covers the initial read; togglingFavourite
    guards the add/remove action itself against double-taps.
  */
  const [isFavourite, setIsFavourite] = useState(false);
  const [checkingFavourite, setCheckingFavourite] = useState(true);
  const [togglingFavourite, setTogglingFavourite] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user || !providerId) {
      setCheckingFavourite(false);
      return;
    }

    let active = true;

    getDoc(doc(db, "users", user.uid, "favourites", providerId))
      .then((snapshot) => {
        if (active) {
          setIsFavourite(snapshot.exists());
        }
      })
      .catch((error) => {
        console.log("Check favourite error:", error);
      })
      .finally(() => {
        if (active) {
          setCheckingFavourite(false);
        }
      });

    return () => {
      active = false;
    };
  }, [providerId]);

  const handleToggleFavourite = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login Required", "Please log in to save favourite providers.");
      router.replace("/customer-login");
      return;
    }

    if (!providerId || togglingFavourite) {
      return;
    }

    const favouriteRef = doc(db, "users", user.uid, "favourites", providerId);

    if (isFavourite) {
      Alert.alert(
        "Remove Favourite",
        "Remove this provider from your favourites?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                setTogglingFavourite(true);
                await deleteDoc(favouriteRef);
                setIsFavourite(false);
              } catch (error: any) {
                console.log("Remove favourite error:", error);
                Alert.alert("Error", error.message || "Unable to remove favourite.");
              } finally {
                setTogglingFavourite(false);
              }
            },
          },
        ]
      );
      return;
    }

    try {
      setTogglingFavourite(true);

      /*
        Validate the provider actually exists and is still a real
        provider account before saving anything.
      */
      const providerSnapshot = await getDoc(doc(db, "users", providerId));

      if (!providerSnapshot.exists() || providerSnapshot.data()?.role !== "provider") {
        Alert.alert("Unable to Save", "This provider could not be found.");
        return;
      }

      /*
        Guard against duplicates / re-creating an existing favourite:
        if the document already exists (e.g. a stale local isFavourite
        state), do nothing rather than overwriting createdAt or note.
      */
      const existingSnapshot = await getDoc(favouriteRef);

      if (existingSnapshot.exists()) {
        setIsFavourite(true);
        return;
      }

      await setDoc(favouriteRef, {
        providerId,
        note: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setIsFavourite(true);
    } catch (error: any) {
      console.log("Add favourite error:", error);
      Alert.alert("Error", error.message || "Unable to save this provider.");
    } finally {
      setTogglingFavourite(false);
    }
  };

  useEffect(() => {
    if (!providerId) {
      return;
    }

    setReviewsError("");
    setReviews([]);
    setReviewCount(0);
    setRating(0);

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("providerId", "==", providerId)
    );

    const unsubscribeReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        setReviewsError("");
        const loadedReviews: Review[] = snapshot.docs.map((reviewDoc) => ({
          ...reviewDoc.data(),
          id: reviewDoc.id,
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
        setReviewsError("Your reviews could not be loaded. Please try again later.");
      }
    );

    return () => {
      unsubscribeReviews();
    };
  }, [providerId]);

  const bottomPad = Math.max(insets.bottom, spacing.md);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top"]}>
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
            Provider Profile
          </Text>

          <TouchableOpacity
            style={styles.topBtn}
            onPress={handleToggleFavourite}
            activeOpacity={0.85}
            hitSlop={10}
            disabled={checkingFavourite || togglingFavourite}
          >
            {checkingFavourite || togglingFavourite ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name={isFavourite ? "heart" : "heart-outline"}
                size={20}
                color={isFavourite ? colors.error : colors.textPrimary}
              />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + bottomPad },
          ]}
        >
          {/* Header */}
          <View style={styles.headerCard}>
            <View style={styles.headerTint} pointerEvents="none" />

            <View style={styles.profileSection}>
              {profileImageUrl ? (
                <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={46} color={colors.primary} />
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

              {/* Rating + Experience as compact chips, District as its own
                  full-width row so a long district name never has to
                  squeeze into a cramped third column. */}
              <View style={styles.statChipsRow}>
                <View style={styles.statChip}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={styles.statChipValue}>
                    {rating > 0 ? rating.toFixed(1) : "New"}
                  </Text>
                  <Text style={styles.statChipLabel}>
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </Text>
                </View>

                <View style={styles.statChip}>
                  <Ionicons name="ribbon-outline" size={14} color={colors.primary} />
                  <Text style={styles.statChipValue} numberOfLines={1}>
                    {experience}
                  </Text>
                </View>
              </View>

              <View style={styles.districtRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.districtText} numberOfLines={2}>
                  {district}
                </Text>
              </View>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>

            <Text style={styles.description}>
              Experienced and reliable professional providing quality home
              services. Available for repairs, installations and general
              service requests.
            </Text>
          </View>

          {/* Service details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>

            <View style={styles.detailCard}>
              <DetailRow
                icon="construct-outline"
                label="Service"
                value={service}
              />
              <DetailRow
                icon="pricetag-outline"
                label="Starting price"
                value={`Rs. ${Number(price).toLocaleString()}`}
              />
              <DetailRow
                icon="location-outline"
                label="District"
                value={district}
                valueNumberOfLines={2}
              />

              <View style={styles.detailRowLast}>
                <View style={styles.detailLabelRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>Availability</Text>
                </View>

                <View style={styles.availabilityPill}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                  <Text style={styles.available}>Available</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Reviews</Text>

              <Text style={styles.reviewCountText}>
                {reviewsError ? "Unavailable" : `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`}
              </Text>
            </View>

            {reviewsError ? (
              <View style={styles.reviewCard}>
                <Text style={styles.noReviewText}>{reviewsError}</Text>
              </View>
            ) : reviews.length === 0 ? (
              <View style={styles.reviewCard}>
                <Text style={styles.noReviewText}>
                  Reviews will appear here after customers complete services.
                </Text>
              </View>
            ) : (
              reviews.map((item) => (
                <View key={item.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={{ flex: 1, marginRight: spacing.sm }}>
                      <Text style={styles.reviewerName}>Customer</Text>

                      <Text style={styles.reviewerEmail} numberOfLines={1}>
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

        {/* Sticky Book Service bar */}
        <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
          <View>
            <Text style={styles.bottomLabel}>Starting from</Text>
            <Text style={styles.bottomPrice}>
              Rs. {Number(price).toLocaleString()}
            </Text>
          </View>

          <PrimaryButton
            title="Book Service"
            icon="calendar-outline"
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
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueNumberOfLines,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueNumberOfLines?: number;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelRow}>
        <Ionicons name={icon} size={16} color={colors.textSecondary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>

      <Text
        style={styles.detailValue}
        numberOfLines={valueNumberOfLines}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  topBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },

  headerCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerTint: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: colors.primarySoft,
  },

  profileSection: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B1220",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    borderWidth: 3,
    borderColor: colors.surface,
  },

  name: {
    marginTop: spacing.md + 2,
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
    textAlign: "center",
  },

  service: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },

  verifiedBadge: {
    marginTop: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },

  verifiedText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "800",
  },

  statChipsRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },

  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    maxWidth: "48%",
  },

  statChipValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
    flexShrink: 1,
  },

  statChipLabel: {
    fontSize: 11,
    color: colors.textMuted,
    flexShrink: 1,
  },

  districtRow: {
    marginTop: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    maxWidth: "88%",
  },

  districtText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: "center",
  },

  section: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },

  sectionTitle: {
    ...typography.sectionHeading,
    fontWeight: "900",
  },

  description: {
    marginTop: spacing.sm + 2,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  detailCard: {
    marginTop: spacing.md + 2,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  detailRowLast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },

  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },

  detailValue: {
    maxWidth: "52%",
    textAlign: "right",
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  availabilityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.successLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },

  available: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.success,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  reviewCard: {
    marginTop: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    backgroundColor: colors.background,
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
    paddingTop: spacing.md + 2,
    shadowColor: "#0B1220",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },

  bottomLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  bottomPrice: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  bookButton: {
    paddingHorizontal: spacing.xl,
    minHeight: 50,
  },
});
