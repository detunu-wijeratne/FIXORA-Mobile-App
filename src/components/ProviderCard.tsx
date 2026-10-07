import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "../theme";

type Props = {
  name: string;
  category?: string;
  district?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  price?: number | string;
  avatarUrl?: string;
  onPress: () => void;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

export default function ProviderCard({
  name,
  category,
  district,
  rating,
  reviewCount,
  verified,
  price,
  avatarUrl,
  onPress,
  ctaLabel = "View Profile",
  onCtaPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.topRow}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>

            {verified && (
              <View style={styles.verifiedPill}>
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color={colors.primary}
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {category && <Text style={styles.category}>{category}</Text>}

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>
                {rating > 0 ? rating.toFixed(1) : "New"}
              </Text>
              <Text style={styles.reviewText}>
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </Text>
            </View>
          </View>

          {district && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {district}
              </Text>
            </View>
          )}
        </View>
      </View>

      {price !== undefined && (
        <>
          <View style={styles.divider} />

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.priceLabel}>Starting from</Text>
              <Text style={styles.priceValue}>
                Rs. {Number(price).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={onCtaPress || onPress}
            >
              <Text style={styles.ctaText}>{ctaLabel}</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.white} />
            </TouchableOpacity>
          </View>
        </>
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

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },

  info: {
    flex: 1,
    marginLeft: spacing.md,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  name: {
    ...typography.cardTitle,
    flexShrink: 1,
  },

  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },

  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },

  category: {
    ...typography.secondary,
    marginTop: 2,
  },

  metaRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  reviewText: {
    ...typography.caption,
  },

  locationRow: {
    marginTop: spacing.xs + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  locationText: {
    ...typography.secondary,
    fontSize: 12,
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  bottomRow: {
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

  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 3,
  },

  ctaText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
