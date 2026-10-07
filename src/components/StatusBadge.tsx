import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../theme";

export type StatusType =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "declined";

const STATUS_CONFIG: Record<
  StatusType,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    background: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: "time-outline",
    color: colors.warning,
    background: colors.warningLight,
  },
  confirmed: {
    label: "Confirmed",
    icon: "checkmark-circle-outline",
    color: colors.primary,
    background: colors.primarySoft,
  },
  in_progress: {
    label: "In Progress",
    icon: "sync-outline",
    color: colors.primary,
    background: colors.primarySoft,
  },
  completed: {
    label: "Completed",
    icon: "checkmark-done-circle-outline",
    color: colors.success,
    background: colors.successLight,
  },
  cancelled: {
    label: "Cancelled",
    icon: "close-circle-outline",
    color: colors.error,
    background: colors.errorLight,
  },
  declined: {
    label: "Declined",
    icon: "close-circle-outline",
    color: colors.error,
    background: colors.errorLight,
  },
};

type Props = {
  status: StatusType;
};

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Ionicons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
