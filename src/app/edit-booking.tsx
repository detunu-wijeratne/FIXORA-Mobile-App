import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
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
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

/*
  Same date/time options used on select-date-time.tsx,
  reused here rather than inventing a new picker.
*/
const DATES = [
  { day: "Mon", date: "5" },
  { day: "Tue", date: "6" },
  { day: "Wed", date: "7" },
  { day: "Thu", date: "8" },
  { day: "Fri", date: "9" },
  { day: "Sat", date: "10" },
];

const TIME_SLOTS = [
  "8:00 AM",
  "9:30 AM",
  "11:00 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
];

export default function EditBookingScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string" ? params.bookingId : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notEditable, setNotEditable] = useState(false);

  const [selectedDate, setSelectedDate] = useState("5");
  const [selectedTime, setSelectedTime] = useState("9:30 AM");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    if (!bookingId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "bookings", bookingId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setNotEditable(true);
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        /*
          Only the "pending" status (the booking's initial,
          not-yet-accepted state) may be edited. This mirrors
          booking-details.tsx's canCancel check exactly.
        */
        if (data.status !== "pending") {
          setNotEditable(true);
          setLoading(false);
          return;
        }

        setSelectedDate(data.date || "5");
        setSelectedTime(data.time || "9:30 AM");
        setDescription(data.description || "");
        setAddress(data.address || "");

        setLoading(false);
      },
      (error) => {
        console.log("Edit booking load error:", error);
        Alert.alert("Error", error.message || "Unable to load booking.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookingId]);

  const handleSave = async () => {
    if (!address.trim()) {
      Alert.alert("Missing Address", "Please enter a service address.");
      return;
    }

    if (!bookingId) {
      Alert.alert("Error", "Booking ID was not found.");
      return;
    }

    try {
      setSaving(true);

      const bookingRef = doc(db, "bookings", bookingId);

      /*
        Re-check the booking's live status right before saving.
        The provider may have accepted it while this screen was open.
      */
      const latestSnapshot = await getDoc(bookingRef);

      if (!latestSnapshot.exists()) {
        Alert.alert("Booking Not Found", "This booking no longer exists.");
        router.back();
        return;
      }

      const latestData = latestSnapshot.data();

      if (latestData.status !== "pending") {
        Alert.alert(
          "Booking Already Confirmed",
          "This booking has already been confirmed by the provider and can no longer be edited."
        );
        router.back();
        return;
      }

      await updateDoc(bookingRef, {
        date: selectedDate,
        time: selectedTime,
        description: description.trim(),
        address: address.trim(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        "Booking Updated",
        "Your booking details have been updated.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.log("Edit booking save error:", error);
      Alert.alert("Error", error.message || "Unable to update booking.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <Stack.Screen options={{ title: "Edit Booking" }} />
        <LoadingState label="Loading booking..." />
      </SafeAreaView>
    );
  }

  if (notEditable) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <Stack.Screen options={{ title: "Edit Booking" }} />

        <Ionicons name="lock-closed-outline" size={40} color={colors.textMuted} />

        <Text style={styles.notEditableTitle}>
          This booking can no longer be edited
        </Text>

        <Text style={styles.notEditableText}>
          This booking has already been confirmed by the provider and can no
          longer be edited.
        </Text>

        <PrimaryButton
          title="Back to Booking"
          onPress={() => router.back()}
          style={styles.backToBookingButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ title: "Edit Booking" }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit Booking</Text>

        <Text style={styles.subtitle}>
          Update your booking details before the provider confirms your
          request.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date &amp; Time</Text>

          <Text style={styles.label}>Choose a date</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {DATES.map((item) => {
              const selected = selectedDate === item.date;

              return (
                <TouchableOpacity
                  key={item.date}
                  style={[styles.dateCard, selected && styles.selectedCard]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <Text style={[styles.dayText, selected && styles.selectedText]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dateText, selected && styles.selectedText]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, styles.labelSpaced]}>Choose a time</Text>

          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => {
              const selected = selectedTime === time;

              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeCard, selected && styles.selectedCard]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selected && styles.selectedText]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>

          <Text style={styles.label}>Problem Description</Text>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Describe the issue..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>

          <Text style={styles.label}>Service Address</Text>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="Enter the service address"
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={setAddress}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <PrimaryButton
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          loading={saving}
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

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },

  notEditableTitle: {
    marginTop: spacing.md,
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },

  notEditableText: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },

  backToBookingButton: {
    marginTop: spacing.xl,
    width: "100%",
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 120,
  },

  title: {
    ...typography.pageTitle,
    fontSize: 24,
  },

  subtitle: {
    ...typography.secondary,
    marginTop: spacing.sm,
  },

  section: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },

  labelSpaced: {
    marginTop: spacing.lg,
  },

  dateRow: {
    gap: spacing.sm + 2,
  },

  dateCard: {
    width: 60,
    height: 74,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  dayText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  dateText: {
    marginTop: spacing.xs + 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  selectedText: {
    color: colors.white,
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },

  timeCard: {
    width: "47%",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
  },

  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  textArea: {
    minHeight: 100,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    fontSize: 14,
    color: colors.textPrimary,
  },

  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
});
