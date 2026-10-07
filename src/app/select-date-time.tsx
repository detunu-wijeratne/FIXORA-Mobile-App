import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BookingProgress from "../components/BookingProgress";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radius, spacing, typography } from "../theme";

export default function SelectDateTimeScreen() {
  const params = useLocalSearchParams();

  const providerId =
    typeof params.providerId === "string" ? params.providerId : "";

  const name =
    typeof params.name === "string" ? params.name : "Service Provider";

  const service =
    typeof params.service === "string" ? params.service : "Home Service";

  const price = typeof params.price === "string" ? params.price : "2500";

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

  const [selectedDate, setSelectedDate] = useState("5");
  const [selectedTime, setSelectedTime] = useState("9:30 AM");

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Book a Service</Text>

        <BookingProgress currentStep={1} />

        <View style={styles.providerCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={26} color={colors.primary} />
          </View>

          <View>
            <Text style={styles.providerName}>{name}</Text>
            <Text style={styles.providerService}>{service}</Text>
            <Text style={styles.price}>
              From Rs. {Number(price).toLocaleString()}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose a date</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {dates.map((item) => {
            const selected = selectedDate === item.date;

            return (
              <TouchableOpacity
                key={item.date}
                style={[styles.dateCard, selected && styles.selectedDateCard]}
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

        <Text style={styles.sectionTitle}>Available times</Text>

        <View style={styles.timeGrid}>
          {timeSlots.map((time) => {
            const selected = selectedTime === time;

            return (
              <TouchableOpacity
                key={time}
                style={[styles.timeCard, selected && styles.selectedTimeCard]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selected && styles.selectedText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your selection</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>October {selectedDate}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{selectedTime}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <PrimaryButton
          title="Continue"
          icon="arrow-forward"
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
        />
      </View>
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
    paddingBottom: 120,
  },

  title: {
    ...typography.pageTitle,
    fontSize: 24,
  },

  providerCard: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  providerName: {
    marginLeft: spacing.md + 2,
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  providerService: {
    marginLeft: spacing.md + 2,
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },

  price: {
    marginLeft: spacing.md + 2,
    marginTop: spacing.xs + 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  sectionTitle: {
    ...typography.sectionHeading,
    marginTop: spacing.xxl,
    marginBottom: spacing.md + 2,
  },

  dateRow: {
    gap: spacing.sm + 2,
  },

  dateCard: {
    width: 62,
    height: 78,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDateCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  dayText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  dateText: {
    marginTop: spacing.xs + 2,
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  selectedText: {
    color: colors.white,
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },

  timeCard: {
    width: "47%",
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },

  selectedTimeCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  summaryCard: {
    marginTop: spacing.xxl,
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm + 2,
  },

  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
});
