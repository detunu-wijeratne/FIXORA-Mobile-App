import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  addDoc,
  collection,
  doc,
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

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title="Rate & Review"
          subtitle={`How was your experience with ${provider}?`}
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
          title={loading ? "Submitting Review..." : "Submit Review"}
          onPress={handleSubmit}
          loading={loading}
          disabled={rating === 0}
          style={styles.submitButton}
        />
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
});
