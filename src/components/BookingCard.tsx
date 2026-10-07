import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing, typography } from "../theme";
import StatusBadge, { StatusType } from "./StatusBadge";

type Props = {
  service: string;
  providerName: string;
  date?: string;
  time?: string;
  address?: string;
  status: StatusType;
  totalAmount?: number;
  onPress: () => void;
};

export default function BookingCard({
  service,
  providerName,
  date,
  time,
  address,
  status,
  totalAmount,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Ionicons name="construct-outline" size={20} color={colors.primary} />
        </View>

        <View style={styles.info}>
          <Text style={styles.service} numberOfLines={1}>
            {service}
          </Text>
          <Text style={styles.provider} numberOfLines={1}>
            {providerName}
          </Text>
        </View>

        <StatusBadge status={status} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {date ? `October ${date}` : "-"} {time ? `• ${time}` : ""}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {address || "Location not provided"}
          </Text>
        </View>
      </View>

      {totalAmount !== undefined && (
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.priceLabel}>Estimated Total</Text>
            <Text style={styles.priceValue}>
              Rs. {Number(totalAmount).toLocaleString()}
            </Text>
          </View>

          <View style={styles.viewRow}>
            <Text style={styles.viewText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg - 2,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    marginLeft: spacing.md,
  },

  service: {
    ...typography.cardTitle,
    fontSize: 15,
  },

  provider: {
    ...typography.secondary,
    marginTop: 2,
    fontSize: 12,
  },

  details: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  detailText: {
    ...typography.secondary,
    fontSize: 12,
    flexShrink: 1,
  },

  bottomRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceLabel: {
    ...typography.caption,
  },

  priceValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  viewText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
});
