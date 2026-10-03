import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RateReviewScreen() {
  const params = useLocalSearchParams();

  const provider =
    typeof params.provider === "string"
      ? params.provider
      : "Kamal Perera";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Plumbing";

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const submitReview = () => {
    if (rating === 0) {
      return;
    }

    router.replace("/my-bookings");
  };

  return (
    <View style={styles.container}>
      <View style={styles.providerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👨‍🔧</Text>
        </View>

        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider}</Text>
          <Text style={styles.service}>{service}</Text>
        </View>
      </View>

      <Text style={styles.title}>How was your service?</Text>

      <Text style={styles.subtitle}>
        Your feedback helps other customers choose trusted providers.
      </Text>

      <Text style={styles.label}>Your Rating</Text>

      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
          >
            <Text
              style={[
                styles.star,
                star <= rating
                  ? styles.selectedStar
                  : styles.unselectedStar,
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {rating > 0 && (
        <Text style={styles.ratingText}>
          You selected {rating} out of 5
        </Text>
      )}

      <Text style={styles.label}>Write a Review</Text>

      <TextInput
        style={styles.reviewInput}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        placeholder="Tell us about your experience..."
        placeholderTextColor="#94A3B8"
        value={review}
        onChangeText={setReview}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          rating === 0 && styles.disabledButton,
        ]}
        disabled={rating === 0}
        onPress={submitReview}
      >
        <Text style={styles.submitButtonText}>
          Submit Review
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.back()}
      >
        <Text style={styles.skipText}>Maybe Later</Text>
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

  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 26,
  },

  providerInfo: {
    marginLeft: 13,
  },

  providerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  service: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  title: {
    marginTop: 30,
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },

  label: {
    marginTop: 30,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  starRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  star: {
    fontSize: 42,
  },

  selectedStar: {
    color: "#F59E0B",
  },

  unselectedStar: {
    color: "#CBD5E1",
  },

  ratingText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
  },

  reviewInput: {
    marginTop: 10,
    minHeight: 140,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#0F172A",
  },

  submitButton: {
    marginTop: 26,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabledButton: {
    backgroundColor: "#94A3B8",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  skipButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  skipText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});