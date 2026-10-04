import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
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

import { auth, db } from "../../services/firebase";

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

const defaultAvailability: Availability = {
  monday: {
    enabled: true,
    slots: ["09:00 AM - 12:00 PM"],
  },

  tuesday: {
    enabled: true,
    slots: ["09:00 AM - 12:00 PM"],
  },

  wednesday: {
    enabled: true,
    slots: ["09:00 AM - 12:00 PM"],
  },

  thursday: {
    enabled: true,
    slots: ["09:00 AM - 12:00 PM"],
  },

  friday: {
    enabled: true,
    slots: ["09:00 AM - 12:00 PM"],
  },

  saturday: {
    enabled: false,
    slots: [],
  },

  sunday: {
    enabled: false,
    slots: [],
  },
};

export default function ProviderAvailabilityScreen() {
  const [availability, setAvailability] =
    useState<Availability>(defaultAvailability);

  const [newSlot, setNewSlot] = useState("");
  const [selectedDay, setSelectedDay] =
    useState<keyof Availability>("monday");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in again."
      );

      setLoading(false);
      return;
    }

    try {
      const availabilityRef = doc(
        db,
        "providerAvailability",
        user.uid
      );

      const snapshot = await getDoc(
        availabilityRef
      );

      if (snapshot.exists()) {
        const data = snapshot.data();

        if (data.availability) {
          setAvailability(
            data.availability as Availability
          );
        }
      }
    } catch (error: any) {
      console.log(
        "Load availability error:",
        error
      );

      Alert.alert(
        "Error",
        error.message ||
          "Unable to load availability."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in again."
      );
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(
          db,
          "providerAvailability",
          user.uid
        ),
        {
          providerId: user.uid,
          availability,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      Alert.alert(
        "Availability Saved",
        "Your availability has been updated successfully."
      );
    } catch (error: any) {
      console.log(
        "Save availability error:",
        error
      );

      Alert.alert(
        "Error",
        error.message ||
          "Unable to save availability."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (
    day: keyof Availability
  ) => {
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
      Alert.alert(
        "Enter Time Slot",
        "Example: 02:00 PM - 05:00 PM"
      );
      return;
    }

    const existingSlots =
      availability[selectedDay].slots;

    if (existingSlots.includes(slot)) {
      Alert.alert(
        "Duplicate Slot",
        "This time slot already exists."
      );
      return;
    }

    setAvailability((current) => ({
      ...current,

      [selectedDay]: {
        ...current[selectedDay],
        enabled: true,

        slots: [
          ...current[selectedDay].slots,
          slot,
        ],
      },
    }));

    setNewSlot("");
  };

  const deleteSlot = (
    day: keyof Availability,
    slotIndex: number
  ) => {
    setAvailability((current) => ({
      ...current,

      [day]: {
        ...current[day],

        slots: current[day].slots.filter(
          (_, index) =>
            index !== slotIndex
        ),
      },
    }));
  };

  const dayLabels: {
    key: keyof Availability;
    label: string;
  }[] = [
    {
      key: "monday",
      label: "Monday",
    },
    {
      key: "tuesday",
      label: "Tuesday",
    },
    {
      key: "wednesday",
      label: "Wednesday",
    },
    {
      key: "thursday",
      label: "Thursday",
    },
    {
      key: "friday",
      label: "Friday",
    },
    {
      key: "saturday",
      label: "Saturday",
    },
    {
      key: "sunday",
      label: "Sunday",
    },
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>
          Loading availability...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Manage Availability
      </Text>

      <Text style={styles.subtitle}>
        Set the days and time slots when
        customers can book your services.
      </Text>

      <View style={styles.addCard}>
        <Text style={styles.sectionTitle}>
          Add Time Slot
        </Text>

        <Text style={styles.label}>
          Select Day
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
        >
          {dayLabels.map((day) => (
            <TouchableOpacity
              key={day.key}
              style={[
                styles.dayButton,

                selectedDay === day.key &&
                  styles.selectedDayButton,
              ]}
              onPress={() =>
                setSelectedDay(day.key)
              }
            >
              <Text
                style={[
                  styles.dayButtonText,

                  selectedDay === day.key &&
                    styles.selectedDayText,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>
          Time Slot
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: 02:00 PM - 05:00 PM"
          placeholderTextColor="#94A3B8"
          value={newSlot}
          onChangeText={setNewSlot}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={addSlot}
        >
          <Text style={styles.addButtonText}>
            + Add Slot
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.scheduleTitle}>
        Weekly Schedule
      </Text>

      {dayLabels.map((day) => {
        const data =
          availability[day.key];

        return (
          <View
            key={day.key}
            style={styles.dayCard}
          >
            <View style={styles.dayHeader}>
              <View>
                <Text style={styles.dayTitle}>
                  {day.label}
                </Text>

                <Text
                  style={[
                    styles.dayStatus,

                    data.enabled
                      ? styles.availableText
                      : styles.unavailableText,
                  ]}
                >
                  {data.enabled
                    ? "Available"
                    : "Unavailable"}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleButton,

                  data.enabled
                    ? styles.enabledButton
                    : styles.disabledToggleButton,
                ]}
                onPress={() =>
                  toggleDay(day.key)
                }
              >
                <Text
                  style={[
                    styles.toggleText,

                    data.enabled
                      ? styles.enabledText
                      : styles.disabledToggleText,
                  ]}
                >
                  {data.enabled
                    ? "ON"
                    : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>

            {data.enabled ? (
              data.slots.length === 0 ? (
                <Text
                  style={styles.noSlotsText}
                >
                  No time slots added.
                </Text>
              ) : (
                <View style={styles.slots}>
                  {data.slots.map(
                    (slot, index) => (
                      <View
                        key={`${slot}-${index}`}
                        style={styles.slotRow}
                      >
                        <Text
                          style={
                            styles.slotText
                          }
                        >
                          🕒 {slot}
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            deleteSlot(
                              day.key,
                              index
                            )
                          }
                        >
                          <Text
                            style={
                              styles.deleteText
                            }
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )
                  )}
                </View>
              )
            ) : (
              <Text
                style={styles.noSlotsText}
              >
                You are unavailable on this day.
              </Text>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        style={[
          styles.saveButton,
          saving &&
            styles.disabledButton,
        ]}
        disabled={saving}
        onPress={saveAvailability}
      >
        <Text style={styles.saveButtonText}>
          {saving
            ? "Saving..."
            : "Save Availability"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7FC",
  },

  loadingText: {
    color: "#64748B",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  addCard: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  label: {
    marginTop: 15,
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },

  daySelector: {
    marginBottom: 5,
  },

  dayButton: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },

  selectedDayButton: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  dayButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  selectedDayText: {
    color: "#FFFFFF",
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 13,
    color: "#0F172A",
  },

  addButton: {
    marginTop: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
  },

  addButtonText: {
    color: "#2563EB",
    fontWeight: "800",
  },

  scheduleTitle: {
    marginTop: 24,
    marginBottom: 2,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  dayCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dayTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  dayStatus: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
  },

  availableText: {
    color: "#16A34A",
  },

  unavailableText: {
    color: "#DC2626",
  },

  toggleButton: {
    minWidth: 55,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
  },

  enabledButton: {
    backgroundColor: "#DCFCE7",
  },

  disabledToggleButton: {
    backgroundColor: "#FEE2E2",
  },

  toggleText: {
    fontSize: 10,
    fontWeight: "800",
  },

  enabledText: {
    color: "#166534",
  },

  disabledToggleText: {
    color: "#B91C1C",
  },

  slots: {
    marginTop: 14,
    gap: 8,
  },

  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 11,
  },

  slotText: {
    fontSize: 12,
    color: "#334155",
  },

  deleteText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#DC2626",
  },

  noSlotsText: {
    marginTop: 13,
    fontSize: 11,
    color: "#94A3B8",
  },

  saveButton: {
    marginTop: 22,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },
});