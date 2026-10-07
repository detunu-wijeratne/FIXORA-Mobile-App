import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LoadingState from "../components/LoadingState";
import PrimaryButton from "../components/PrimaryButton";
import ScreenHeader from "../components/ScreenHeader";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function RateReviewScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string" ? params.bookingId : "";

  const providerId =
    typeof params.providerId === "string" ? params.providerId : "";

  const provider =
    typeof params.provider === "string" ? params.provider : "Provider";

  const service =
    typeof params.service === "string" ? params.service : "Home Service";

  const reviewId =
    typeof params.reviewId === "string" ? params.reviewId : "";

  const isEditing = Boolean(reviewId);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(isEditing);
  const [blocked, setBlocked] = useState(false);

  /*
    READ (edit mode): load the existing review so the customer
    sees their current rating/text before changing anything.
  */
  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadExistingReview = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/customer-login");
          return;
        }

        const reviewSnapshot = await getDoc(doc(db, "reviews", reviewId));

        if (!reviewSnapshot.exists()) {
          Alert.alert("Review Not Found", "This review no longer exists.");
          setBlocked(true);
          return;
        }

        const data = reviewSnapshot.data();

        if (data.customerId !== user.uid) {
          Alert.alert("Not Allowed", "You can only edit your own review.");
          setBlocked(true);
          return;
        }

        setRating(Number(data.rating || 0));
        setReview(data.review || "");
      } catch (error: any) {
        console.log("Load existing review error:", error);
        Alert.alert("Error", error.message || "Unable to load your review.");
        setBlocked(true);
      } finally {
        setLoadingExisting(false);
      }
    };

    loadExistingReview();
  }, [isEditing, reviewId]);

  /*
    Recalculates the provider's aggregate rating/reviewCount
    from every review currently in the "reviews" collection.
    Works unchanged for create, update and delete since it
    always recomputes from scratch rather than incrementing.
  */
  const updateProviderRating = async () => {
    if (!providerId) {
      return;
    }

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("providerId", "==", providerId)
    );

    const snapshot = await getDocs(reviewsQuery);

    const ratings = snapshot.docs.map((reviewDoc) => {
      const data = reviewDoc.data();
      return Number(data.rating || 0);
    });

    if (ratings.length === 0) {
      await updateDoc(doc(db, "users", providerId), {
        rating: 0,
        reviewCount: 0,
        updatedAt: serverTimestamp(),
      });

      return;
    }

    const totalRating = ratings.reduce((total, value) => total + value, 0);
    const averageRating = totalRating / ratings.length;

    await updateDoc(doc(db, "users", providerId), {
      rating: averageRating,
      reviewCount: ratings.length,
      updatedAt: serverTimestamp(),
    });

    console.log("Provider rating updated:", averageRating, ratings.length);
  };

  /*
    CREATE
  */
  const handleCreate = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login Required", "Please log in before submitting a review.");
      router.replace("/customer-login");
      return;
    }

    if (!bookingId) {
      Alert.alert("Error", "Booking ID was not found.");
      return;
    }

    if (!providerId) {
      Alert.alert("Error", "Provider ID was not found.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }

    try {
      setLoading(true);

      /*
        Defensive duplicate guard: booking-details.tsx only shows
        "Rate & Review" (not "View / Edit Review") when the booking
        hasn't been reviewed yet, but double-check here too so a
        stale screen or re-tap can never create a second review
        for the same booking.
      */
      const existingQuery = query(
        collection(db, "reviews"),
        where("bookingId", "==", bookingId),
        where("customerId", "==", user.uid)
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        Alert.alert(
          "Already Reviewed",
          "You have already submitted a review for this booking."
        );
        router.back();
        return;
      }

      const reviewRef = await addDoc(collection(db, "reviews"), {
        bookingId,

        customerId: user.uid,
        customerEmail: user.email || "",

        providerId,
        providerName: provider,

        service,

        rating,
        review: review.trim(),

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "bookings", bookingId), {
        reviewId: reviewRef.id,
        reviewed: true,
        rating,
        updatedAt: serverTimestamp(),
      });

      /*
        Recalculate provider rating
        after the new review is saved.
      */
      await updateProviderRating();

      Alert.alert(
        "Review Submitted",
        "Thank you for rating your service.",
        [
          {
            text: "Done",
            onPress: () => router.replace("/my-bookings"),
          },
        ]
      );
    } catch (error: any) {
      console.log("Review submission error:", error);
      Alert.alert("Error", error.message || "Unable to submit your review.");
    } finally {
      setLoading(false);
    }
  };

  /*
    UPDATE
  */
  const handleUpdate = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login Required", "Please log in before updating your review.");
      router.replace("/customer-login");
      return;
    }

    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }

    try {
      setLoading(true);

      const reviewRef = doc(db, "reviews", reviewId);

      /*
        Re-check ownership right before saving in case anything
        changed since the review was loaded.
      */
      const latestSnapshot = await getDoc(reviewRef);

      if (!latestSnapshot.exists()) {
        Alert.alert("Review Not Found", "This review no longer exists.");
        router.back();
        return;
      }

      if (latestSnapshot.data().customerId !== user.uid) {
        Alert.alert("Not Allowed", "You can only edit your own review.");
        router.back();
        return;
      }

      await updateDoc(reviewRef, {
        rating,
        review: review.trim(),
        updatedAt: serverTimestamp(),
      });

      if (bookingId) {
        await updateDoc(doc(db, "bookings", bookingId), {
          rating,
          updatedAt: serverTimestamp(),
        });
      }

      /*
        Recalculate provider rating now that this
        review's rating may have changed.
      */
      await updateProviderRating();

      Alert.alert(
        "Review Updated",
        "Your review has been updated.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.log("Review update error:", error);
      Alert.alert("Error", error.message || "Unable to update your review.");
    } finally {
      setLoading(false);
    }
  };

  /*
    DELETE
  */
  const handleDelete = () => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const user = auth.currentUser;

            if (!user) {
              router.replace("/customer-login");
              return;
            }

            try {
              setDeleting(true);

              const reviewRef = doc(db, "reviews", reviewId);
              const latestSnapshot = await getDoc(reviewRef);

              if (!latestSnapshot.exists()) {
                Alert.alert("Already Deleted", "This review no longer exists.");
                router.back();
                return;
              }

              if (latestSnapshot.data().customerId !== user.uid) {
                Alert.alert("Not Allowed", "You can only delete your own review.");
                router.back();
                return;
              }

              await deleteDoc(reviewRef);

              /*
                Let the customer submit a new review again:
                clear the booking's review link and reset
                the reviewed flag so booking-details.tsx goes
                back to showing "Rate & Review".
              */
              if (bookingId) {
                await updateDoc(doc(db, "bookings", bookingId), {
                  reviewId: deleteField(),
                  reviewed: false,
                  rating: deleteField(),
                  updatedAt: serverTimestamp(),
                });
              }

              /*
                Recalculate provider rating now that
                this review no longer exists.
              */
              await updateProviderRating();

              Alert.alert(
                "Review Deleted",
                "Your review has been deleted.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              console.log("Review delete error:", error);
              Alert.alert("Error", error.message || "Unable to delete your review.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loadingExisting) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centerContainer} edges={["top"]}>
          <LoadingState label="Loading your review..." />
        </SafeAreaView>
      </>
    );
  }

  if (blocked) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centerContainer} edges={["top"]}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text style={styles.blockedText}>Unable to open this review.</Text>

          <PrimaryButton
            title="Go Back"
            onPress={() => router.back()}
            style={styles.blockedButton}
          />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title={isEditing ? "Edit Review" : "Rate & Review"}
          subtitle={
            isEditing
              ? `Update your review for ${provider}.`
              : `How was your experience with ${provider}?`
          }
        />

        <View style={styles.serviceCard}>
          <Text style={styles.serviceLabel}>Service</Text>
          <Text style={styles.serviceName}>{service}</Text>
        </View>

        <Text style={styles.ratingTitle}>Your Rating</Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={38}
                color={star <= rating ? colors.warning : colors.borderStrong}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.ratingText}>{RATING_LABELS[rating] || ""}</Text>

        <Text style={styles.label}>Write a Review</Text>

        <TextInput
          style={styles.reviewInput}
          placeholder="Tell us about your experience..."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          value={review}
          onChangeText={setReview}
        />

        <PrimaryButton
          title={
            loading
              ? isEditing
                ? "Saving Changes..."
                : "Submitting Review..."
              : isEditing
              ? "Save Changes"
              : "Submit Review"
          }
          onPress={isEditing ? handleUpdate : handleCreate}
          loading={loading}
          disabled={rating === 0 || deleting}
          style={styles.submitButton}
        />

        {isEditing && (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              (deleting || loading) && styles.disabledButton,
            ]}
            onPress={handleDelete}
            disabled={deleting || loading}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.deleteButtonText}>
              {deleting ? "Deleting..." : "Delete Review"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },

  blockedText: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },

  blockedButton: {
    marginTop: spacing.xl,
    width: "100%",
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  serviceLabel: {
    ...typography.caption,
  },

  serviceName: {
    marginTop: spacing.xs + 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  ratingTitle: {
    marginTop: spacing.xxl,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  stars: {
    marginTop: spacing.lg - 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm + 1,
  },

  ratingText: {
    marginTop: spacing.sm,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    minHeight: 20,
  },

  label: {
    marginTop: spacing.xxl - 2,
    marginBottom: spacing.sm,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  reviewInput: {
    minHeight: 140,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    fontSize: 14,
    color: colors.textPrimary,
  },

  submitButton: {
    marginTop: spacing.xl,
  },

  deleteButton: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
  },

  deleteButtonText: {
    color: colors.error,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },
});
