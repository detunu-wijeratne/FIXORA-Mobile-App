import { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme/provider";

export const localDateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

export default function ManualJobDateTimePicker({ kind, value, onChange, onClose }: {
  kind: "date" | "time";
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  const parsed = kind === "date" && value ? new Date(`${value}T12:00:00`) : new Date();
  const now = new Date();
  const initial = Number.isNaN(parsed.getTime()) || localDateKey(parsed) < localDateKey(now) ? now : parsed;
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const parts = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(value);
  const [hour, setHour] = useState(parts?.[1] || "9");
  const [minute, setMinute] = useState(parts?.[2] || "00");
  const [period, setPeriod] = useState(parts?.[3] || "AM");
  const today = localDateKey(new Date());
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const options = (items: string[], selected: string, select: (item: string) => void) => (
    <View style={styles.options}>
      {items.map((item) => (
        <TouchableOpacity key={item} accessibilityRole="radio" accessibilityState={{ checked: item === selected }}
          onPress={() => select(item)} style={[styles.option, item === selected && styles.selected]}>
          <Text style={[styles.text, item === selected && styles.selectedText]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <ScrollView>
            <Text style={styles.title}>{kind === "date" ? "Choose job date" : "Choose job time"}</Text>
            {kind === "date" ? <>
              <View style={styles.monthRow}>
                <TouchableOpacity accessibilityLabel="Previous month" style={styles.option}
                  disabled={month.getFullYear() === new Date().getFullYear() && month.getMonth() === new Date().getMonth()}
                  onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                  <Text style={styles.text}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.text}>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</Text>
                <TouchableOpacity accessibilityLabel="Next month" style={styles.option}
                  onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                  <Text style={styles.text}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calendar}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <View key={day} style={styles.day}><Text style={styles.dayLabel}>{day}</Text></View>)}
                {Array.from({ length: month.getDay() }, (_, index) => <View key={`empty-${index}`} style={styles.day} />)}
                {Array.from({ length: days }, (_, index) => {
                  const day = index + 1;
                  const key = localDateKey(new Date(month.getFullYear(), month.getMonth(), day));
                  const disabled = key < today;
                  return <TouchableOpacity key={key} disabled={disabled} accessibilityLabel={key}
                    accessibilityState={{ disabled, selected: key === value }}
                    style={[styles.day, key === value && styles.selected, disabled && styles.disabled]}
                    onPress={() => { onChange(key); onClose(); }}>
                    <Text style={[styles.text, key === value && styles.selectedText]}>{day}</Text>
                  </TouchableOpacity>;
                })}
              </View>
            </> : <>
              <Text style={styles.label}>Hour</Text>
              {options(Array.from({ length: 12 }, (_, i) => String(i + 1)), hour, setHour)}
              <Text style={styles.label}>Minute</Text>
              <ScrollView style={styles.minutes} nestedScrollEnabled>
                {options(Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), minute, setMinute)}
              </ScrollView>
              <Text style={styles.label}>AM / PM</Text>
              {options(["AM", "PM"], period, setPeriod)}
              <TouchableOpacity style={[styles.option, styles.selected]} onPress={() => { onChange(`${hour}:${minute} ${period}`); onClose(); }}>
                <Text style={styles.selectedText}>Set time: {hour}:{minute} {period}</Text>
              </TouchableOpacity>
            </>}
            <TouchableOpacity style={styles.option} onPress={onClose}><Text style={styles.text}>Cancel</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: spacing.lg },
  dialog: { width: "100%", maxWidth: 440, maxHeight: "90%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: "800", marginBottom: spacing.md },
  text: { color: colors.textPrimary, fontSize: 15 },
  label: { color: colors.textSecondary, marginVertical: spacing.sm },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calendar: { flexDirection: "row", flexWrap: "wrap", marginVertical: spacing.md },
  day: { width: "14.2857%", minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.sm },
  dayLabel: { color: colors.textSecondary, fontSize: 12 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  option: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, marginVertical: 2 },
  selected: { backgroundColor: colors.primary },
  selectedText: { color: colors.white, fontWeight: "700" },
  disabled: { opacity: 0.3 },
  minutes: { maxHeight: 160 },
});
