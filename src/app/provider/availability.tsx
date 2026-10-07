// src/app/provider/availability.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

type DayAvailability = {
  enabled: boolean;
  slots: string[];
};

type Availability = {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
};

const DEFAULT_AVAILABILITY: Availability = {
  monday: { enabled: true, slots: ["09:00 AM - 12:00 PM"] },
  tuesday: { enabled: true, slots: ["09:00 AM - 12:00 PM"] },
  wednesday: { enabled: true, slots: ["09:00 AM - 12:00 PM"] },
  thursday: { enabled: true, slots: ["09:00 AM - 12:00 PM"] },
  friday: { enabled: true, slots: ["09:00 AM - 12:00 PM"] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] },
};

const cloneDefault = (): Availability => JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY));

const dayLabels: { key: keyof Availability; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

export default function ProviderAvailabilityScreen() {
  const insets = useSafeAreaInsets();

  const [availability, setAvailability] = useState<Availability>(cloneDefault());
  const [selectedDay, setSelectedDay] = useState<keyof Availability>("monday");
  const [newSlot, setNewSlot] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedDayLabel = useMemo(
    () => dayLabels.find((d) => d.key === selectedDay)?.label || "Day",
    [selectedDay],
  );

  const selectedDayData = availability[selectedDay];

  const loadAvailability = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login Required", "Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const availabilityRef = doc(db, "providerAvailability", user.uid);
      const snapshot = await getDoc(availabilityRef);

      if (snapshot.exists()) {
        const data: any = snapshot.data();
        if (data?.availability) {
          setAvailability(data.availability as Availability);
        }
      }
    } catch (error: any) {
      console.log("Load availability error:", error);
      Alert.alert("Error", error.message || "Unable to load availability.");
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login Required", "Please log in again.");
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, "providerAvailability", user.uid),
        {
          providerId: user.uid,
          availability,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      Alert.alert("Saved", "Your availability has been updated successfully.");
    } catch (error: any) {
      console.log("Save availability error:", error);
      Alert.alert("Error", error.message || "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: keyof Availability) => {
    setAvailability((current) => ({
      ...current,
      [day]: {
        ...current[day],
        enabled: !current[day].enabled,
      },
    }));
  };

  const addSlot = () => {
    const slot = newSlot.trim();

    if (!slot) {
      Alert.alert("Enter a time slot", "Example: 02:00 PM - 05:00 PM");
      return;
    }

    const existingSlots = availability[selectedDay].slots;

    if (existingSlots.includes(slot)) {
      Alert.alert("Duplicate slot", "This time slot already exists.");
      return;
    }

    setAvailability((current) => ({
      ...current,
      [selectedDay]: {
        ...current[selectedDay],
        enabled: true,
        slots: [...current[selectedDay].slots, slot],
      },
    }));

    setNewSlot("");
  };

  const deleteSlot = (day: keyof Availability, slotIndex: number) => {
    setAvailability((current) => ({
      ...current,
      [day]: {
        ...current[day],
        slots: current[day].slots.filter((_, i) => i !== slotIndex),
      },
    }));
  };

  const resetToDefault = () => {
    Alert.alert(
      "Reset availability?",
      "This will reset your weekly schedule to the default template.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => setAvailability(cloneDefault()),
        },
      ],
    );
  };

  const bottomPad = Math.max(insets.bottom, spacing.md);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading availability…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

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
          Availability
        </Text>

        <TouchableOpacity
          style={styles.topBtn}
          onPress={resetToDefault}
          activeOpacity={0.85}
          hitSlop={10}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + bottomPad },
        ]}
      >
        <View style={styles.headerCard}>
          <Text style={styles.pageTitle}>Manage availability</Text>
          <Text style={styles.pageSub}>
            Choose days you work and add the time slots customers can book.
          </Text>

          <View style={styles.tipRow}>
            <Ionicons name="bulb-outline" size={16} color={colors.primary} />
            <Text style={styles.tipText}>
              Tip: Use consistent slot formats like “09:00 AM - 12:00 PM”.
            </Text>
          </View>
        </View>

        {/* Add slot */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Add time slot</Text>
            <View style={styles.dayPill}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text style={styles.dayPillText}>{selectedDayLabel}</Text>
            </View>
          </View>

          <Text style={styles.label}>Select day</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayChipsRow}
          >
            {dayLabels.map((day) => {
              const active = selectedDay === day.key;
              const enabled = availability[day.key].enabled;

              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayChip,
                    active && styles.dayChipActive,
                    !enabled && styles.dayChipOff,
                  ]}
                  onPress={() => setSelectedDay(day.key)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      active && styles.dayChipTextActive,
                      !enabled && styles.dayChipTextOff,
                    ]}
                  >
                    {day.short}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Time slot</Text>
          <View style={styles.slotInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Example: 02:00 PM - 05:00 PM"
              placeholderTextColor={colors.textMuted}
              value={newSlot}
              onChangeText={setNewSlot}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.addBtn,
                !newSlot.trim() && styles.addBtnDisabled,
              ]}
              onPress={addSlot}
              activeOpacity={0.85}
              disabled={!newSlot.trim()}
            >
              <Ionicons name="add" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Quick view of selected day slots */}
          <View style={styles.selectedDaySlots}>
            <View style={styles.selectedDayRow}>
              <Text style={styles.selectedDayTitle}>
                {selectedDayData.enabled ? "Slots" : "Day is OFF"}
              </Text>

              <TouchableOpacity
                onPress={() => toggleDay(selectedDay)}
                activeOpacity={0.85}
                style={[
                  styles.togglePill,
                  selectedDayData.enabled ? styles.toggleOn : styles.toggleOff,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    selectedDayData.enabled ? styles.toggleTextOn : styles.toggleTextOff,
                  ]}
                >
                  {selectedDayData.enabled ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedDayData.enabled ? (
              selectedDayData.slots.length === 0 ? (
                <Text style={styles.mutedText}>No slots added yet.</Text>
              ) : (
                <View style={styles.slotPillsWrap}>
                  {selectedDayData.slots.map((slot, idx) => (
                    <View key={`${slot}-${idx}`} style={styles.slotPill}>
                      <Ionicons name="time-outline" size={14} color={colors.primary} />
                      <Text style={styles.slotPillText}>{slot}</Text>
                      <TouchableOpacity
                        onPress={() => deleteSlot(selectedDay, idx)}
                        activeOpacity={0.85}
                        hitSlop={8}
                      >
                        <Ionicons name="close" size={14} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )
            ) : (
              <Text style={styles.mutedText}>
                Turn this day ON to accept bookings.
              </Text>
            )}
          </View>
        </View>

        {/* Weekly schedule */}
        <Text style={styles.sectionTitle}>Weekly schedule</Text>

        {dayLabels.map((day) => {
          const data = availability[day.key];

          return (
            <View key={day.key} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayTitle}>{day.label}</Text>
                  <Text
                    style={[
                      styles.dayStatus,
                      data.enabled ? styles.statusOn : styles.statusOff,
                    ]}
                  >
                    {data.enabled ? "Available" : "Unavailable"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.togglePill,
                    data.enabled ? styles.toggleOn : styles.toggleOff,
                  ]}
                  onPress={() => toggleDay(day.key)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      data.enabled ? styles.toggleTextOn : styles.toggleTextOff,
                    ]}
                  >
                    {data.enabled ? "ON" : "OFF"}
                  </Text>
                </TouchableOpacity>
              </View>

              {data.enabled ? (
                data.slots.length === 0 ? (
                  <Text style={styles.mutedText}>No time slots added.</Text>
                ) : (
                  <View style={styles.daySlots}>
                    {data.slots.map((slot, index) => (
                      <View key={`${slot}-${index}`} style={styles.daySlotRow}>
                        <View style={styles.daySlotLeft}>
                          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.daySlotText}>{slot}</Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => deleteSlot(day.key, index)}
                          activeOpacity={0.85}
                          style={styles.deleteBtn}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                          <Text style={styles.deleteText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )
              ) : (
                <Text style={styles.mutedText}>You are unavailable on this day.</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
        <View style={styles.bottomRow}>
          <SecondaryButton
            title="Reset"
            onPress={resetToDefault}
            disabled={saving}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            title={saving ? "Saving..." : "Save availability"}
            onPress={saveAvailability}
            loading={saving}
            icon="save-outline"
            style={{ flex: 1 }}
          />
        </View>

        <Text style={styles.bottomHint}>
          Customers will only see slots on days that are ON.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary },

  topBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
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
    padding: spacing.xl,
  },

  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pageTitle: {
    ...typography.sectionHeading,
    fontSize: 18,
    fontWeight: "900",
  },
  pageSub: {
    marginTop: spacing.xs,
    ...typography.secondary,
    fontSize: 13,
  },
  tipRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.sectionHeading,
    fontSize: 15,
    fontWeight: "900",
  },

  dayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  dayPillText: { fontSize: 12, fontWeight: "900", color: colors.primary },

  label: {
    ...typography.label,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  dayChipsRow: {
    paddingRight: spacing.sm,
    gap: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipOff: {
    opacity: 0.55,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  dayChipTextActive: { color: colors.white },
  dayChipTextOff: { color: colors.textMuted },

  slotInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 52,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    opacity: 0.5,
  },

  selectedDaySlots: {
    marginTop: spacing.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  selectedDayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedDayTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  togglePill: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  toggleOn: { backgroundColor: colors.successLight },
  toggleOff: { backgroundColor: colors.errorLight },

  toggleText: { fontSize: 11, fontWeight: "900" },
  toggleTextOn: { color: colors.success },
  toggleTextOff: { color: colors.error },

  mutedText: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textSecondary,
  },

  slotPillsWrap: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },

  slotPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  slotPillText: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    ...typography.sectionHeading,
    fontSize: 15,
    fontWeight: "900",
  },

  dayCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  dayStatus: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
  },
  statusOn: { color: colors.success },
  statusOff: { color: colors.error },

  daySlots: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  daySlotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  daySlotLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  daySlotText: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "700",
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.errorLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.error,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md + 2,
  },
  bottomRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bottomHint: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
    ...typography.caption,
  },
});