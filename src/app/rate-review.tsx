import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";

export default function RateReviewScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string"
      ? params.bookingId
      : "";

  const providerId =
    typeof params.providerId === "string"
      ? params.providerId
      : "";

  const provider =
    typeof params.provider === "string"
      ? params.provider
      : "Provider";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Home Service";

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in before submitting a review."
      );

      router.replace("/customer-login");
      return;
    }

    if (!bookingId) {
      Alert.alert(
        "Error",
        "Booking ID was not found."
      );
      return;
    }

    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please select a star rating."
      );
      return;
    }

    try {
      setLoading(true);

      const reviewRef = await addDoc(
        collection(db, "reviews"),
        {
          bookingId,

          customerId: user.uid,
          customerEmail: user.email || "",

          providerId: providerId || null,
          providerName: provider,

          service,

          rating,
          review: review.trim(),

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, "bookings", bookingId),
        {
          reviewId: reviewRef.id,
          reviewed: true,
          rating,
          updatedAt: serverTimestamp(),
        }
      );

      Alert.alert(
        "Review Submitted",
        "Thank you for rating your service.",
        [
          {
            text: "Done",
            onPress: () =>
              router.replace("/my-bookings"),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "Review submission error:",
        error
      );

      Alert.alert(
        "Error",
        error.message ||
          "Unable to submit your review."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Rate & Review
      </Text>

      <Text style={styles.subtitle}>
        How was your experience with {provider}?
      </Text>

      <View style={styles.serviceCard}>
        <Text style={styles.serviceLabel}>
          Service
        </Text>

        <Text style={styles.serviceName}>
          {service}
        </Text>
      </View>

      <Text style={styles.ratingTitle}>
        Your Rating
      </Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
          >
            <Text
              style={[
                styles.star,
                star <= rating &&
                  styles.selectedStar,
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.ratingText}>
        {rating === 1 && "Poor"}
        {rating === 2 && "Fair"}
        {rating === 3 && "Good"}
        {rating === 4 && "Very Good"}
        {rating === 5 && "Excellent"}
      </Text>

      <Text style={styles.label}>
        Write a Review
      </Text>

      <TextInput
        style={styles.reviewInput}
        placeholder="Tell us about your experience..."
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
        value={review}
        onChangeText={setReview}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          (rating === 0 || loading) &&
            styles.disabledButton,
        ]}
        disabled={rating === 0 || loading}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>
          {loading
            ? "Submitting Review..."
            : "Submit Review"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  serviceCard: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },

  serviceLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  serviceName: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  ratingTitle: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  stars: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
    gap: 9,
  },

  star: {
    fontSize: 38,
    color: "#CBD5E1",
  },

  selectedStar: {
    color: "#F59E0B",
  },

  ratingText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    minHeight: 20,
  },

  label: {
    marginTop: 26,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  reviewInput: {
    minHeight: 140,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
  },

  submitButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});