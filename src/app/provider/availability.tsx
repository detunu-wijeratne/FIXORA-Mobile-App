import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProviderAvailabilityScreen() {
  const [days, setDays] = useState([
    {
      day: "Monday",
      enabled: true,
      slots: ["9:00 AM", "11:00 AM", "2:00 PM"],
    },
    {
      day: "Tuesday",
      enabled: true,
      slots: ["9:30 AM", "1:00 PM", "4:00 PM"],
    },
    {
      day: "Wednesday",
      enabled: true,
      slots: ["10:00 AM", "2:30 PM"],
    },
    {
      day: "Thursday",
      enabled: false,
      slots: [],
    },
    {
      day: "Friday",
      enabled: true,
      slots: ["9:00 AM", "12:00 PM", "3:00 PM"],
    },
  ]);

  const toggleDay = (index: number) => {
    setDays((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, enabled: !item.enabled }
          : item
      )
    );
  };

  const addSlot = (index: number) => {
    setDays((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              slots: [...item.slots, "5:00 PM"],
            }
          : item
      )
    );
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    setDays((current) =>
      current.map((item, i) =>
        i === dayIndex
          ? {
              ...item,
              slots: item.slots.filter(
                (_, index) => index !== slotIndex
              ),
            }
          : item
      )
    );
  };

  const saveChanges = () => {
    Alert.alert(
      "Availability Updated",
      "Your availability changes have been saved."
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Manage Availability</Text>

        <Text style={styles.subtitle}>
          Choose which days and times customers can book you.
        </Text>

        <View style={styles.dayList}>
          {days.map((item, dayIndex) => (
            <View key={item.day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayName}>{item.day}</Text>

                  <Text style={styles.dayStatus}>
                    {item.enabled
                      ? "Available for bookings"
                      : "Unavailable"}
                  </Text>
                </View>

                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleDay(dayIndex)}
                />
              </View>

              {item.enabled && (
                <>
                  <View style={styles.slots}>
                    {item.slots.map((slot, slotIndex) => (
                      <TouchableOpacity
                        key={`${slot}-${slotIndex}`}
                        style={styles.slot}
                        onPress={() =>
                          removeSlot(dayIndex, slotIndex)
                        }
                      >
                        <Text style={styles.slotText}>{slot}</Text>
                        <Text style={styles.remove}>×</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addSlot(dayIndex)}
                  >
                    <Text style={styles.addButtonText}>
                      + Add Time Slot
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveChanges}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 110,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  dayList: {
    marginTop: 20,
    gap: 14,
  },

  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 15,
  },

  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dayName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  dayStatus: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  slots: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  slot: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  slotText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1D4ED8",
  },

  remove: {
    marginLeft: 7,
    fontSize: 16,
    color: "#64748B",
  },

  addButton: {
    marginTop: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },

  addButtonText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 14,
  },

  saveButton: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});