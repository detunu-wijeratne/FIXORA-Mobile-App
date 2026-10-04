import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SelectDateTimeScreen() {
  const params = useLocalSearchParams();

  const providerId =
    typeof params.providerId === "string"
      ? params.providerId
      : "";

  const name =
    typeof params.name === "string"
      ? params.name
      : "Service Provider";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Home Service";

  const price =
    typeof params.price === "string"
      ? params.price
      : "2500";

  const dates = [
    { day: "Mon", date: "5" },
    { day: "Tue", date: "6" },
    { day: "Wed", date: "7" },
    { day: "Thu", date: "8" },
    { day: "Fri", date: "9" },
    { day: "Sat", date: "10" },
  ];

  const timeSlots = [
    "8:00 AM",
    "9:30 AM",
    "11:00 AM",
    "1:00 PM",
    "2:30 PM",
    "4:00 PM",
  ];

  const [selectedDate, setSelectedDate] =
    useState("5");

  const [selectedTime, setSelectedTime] =
    useState("9:30 AM");

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.providerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              👨‍🔧
            </Text>
          </View>

          <View>
            <Text style={styles.providerName}>
              {name}
            </Text>

            <Text style={styles.providerService}>
              {service}
            </Text>

            <Text style={styles.price}>
              From Rs.{" "}
              {Number(price).toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Select a date
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {dates.map((item) => {
            const selected =
              selectedDate === item.date;

            return (
              <TouchableOpacity
                key={item.date}
                style={[
                  styles.dateCard,
                  selected &&
                    styles.selectedDateCard,
                ]}
                onPress={() =>
                  setSelectedDate(item.date)
                }
              >
                <Text
                  style={[
                    styles.dayText,
                    selected &&
                      styles.selectedText,
                  ]}
                >
                  {item.day}
                </Text>

                <Text
                  style={[
                    styles.dateText,
                    selected &&
                      styles.selectedText,
                  ]}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          Available time slots
        </Text>

        <View style={styles.timeGrid}>
          {timeSlots.map((time) => {
            const selected =
              selectedTime === time;

            return (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeCard,
                  selected &&
                    styles.selectedTimeCard,
                ]}
                onPress={() =>
                  setSelectedTime(time)
                }
              >
                <Text
                  style={[
                    styles.timeText,
                    selected &&
                      styles.selectedText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Your selection
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Date
            </Text>

            <Text style={styles.summaryValue}>
              October {selectedDate}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Time
            </Text>

            <Text style={styles.summaryValue}>
              {selectedTime}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() =>
            router.push({
              pathname: "/job-details",
              params: {
                providerId,
                name,
                service,
                price,
                date: selectedDate,
                time: selectedTime,
              },
            })
          }
        >
          <Text style={styles.continueButtonText}>
            Continue
          </Text>
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

  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 28,
  },

  providerName: {
    marginLeft: 14,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  providerService: {
    marginLeft: 14,
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  price: {
    marginLeft: 14,
    marginTop: 5,
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  dateRow: {
    gap: 10,
  },

  dateCard: {
    width: 62,
    height: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDateCard: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  dayText: {
    fontSize: 12,
    color: "#64748B",
  },

  dateText: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  selectedText: {
    color: "#FFFFFF",
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  timeCard: {
    width: "47%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  selectedTimeCard: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  summaryCard: {
    marginTop: 30,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
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