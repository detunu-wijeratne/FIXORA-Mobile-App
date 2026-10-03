import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function JobDetailsScreen() {
  const params = useLocalSearchParams();

  const name =
    typeof params.name === "string" ? params.name : "Kamal Perera";

  const service =
    typeof params.service === "string" ? params.service : "Plumber";

  const price =
    typeof params.price === "string" ? params.price : "Rs. 2,500";

  const date =
    typeof params.date === "string" ? params.date : "5";

  const time =
    typeof params.time === "string" ? params.time : "9:30 AM";

  const [description, setDescription] = useState("");

  const handleContinue = () => {
    router.push({
      pathname: "/service-location",
      params: {
        name,
        service,
        price,
        date,
        time,
        description,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Tell us about the job</Text>

        <Text style={styles.subtitle}>
          Describe the issue so the provider knows what to expect.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking details</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Provider</Text>
            <Text style={styles.summaryValue}>{name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{service}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>October {date}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{time}</Text>
          </View>
        </View>

        <Text style={styles.label}>Problem Description</Text>

        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholder="Example: The kitchen sink is leaking under the pipe..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Add Photos</Text>

        <Text style={styles.photoHint}>
          Photos can help the provider understand the issue before arriving.
        </Text>

        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoButton}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoButton}>
            <Text style={styles.photoIcon}>🖼️</Text>
            <Text style={styles.photoText}>Choose Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Tip</Text>
          <Text style={styles.noteText}>
            Include where the issue is located, when it started, and anything
            the provider should bring.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
    padding: 20,
    paddingBottom: 120,
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

  summaryCard: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  summaryLabel: {
    fontSize: 13,
    color: "#64748B",
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },

  label: {
    marginTop: 26,
    marginBottom: 9,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  descriptionInput: {
    minHeight: 140,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#0F172A",
  },

  photoHint: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  photoRow: {
    flexDirection: "row",
    gap: 12,
  },

  photoButton: {
    flex: 1,
    minHeight: 105,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#94A3B8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  photoIcon: {
    fontSize: 26,
  },

  photoText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  noteBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
  },

  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  noteText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 16,
  },

  continueButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});