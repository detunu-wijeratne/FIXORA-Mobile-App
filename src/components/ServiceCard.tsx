import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "../theme";

type Props = {
  name: string;
  image: ImageSourcePropType;
  description?: string;
  price?: string;
  onPress: () => void;
  variant?: "grid" | "row";
  style?: ViewStyle;
};

export default function ServiceCard({
  name,
  image,
  description,
  price,
  onPress,
  variant = "grid",
  style,
}: Props) {
  if (variant === "row") {
    return (
      <TouchableOpacity
        style={[styles.rowCard, style]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Image source={image} style={styles.rowImage} resizeMode="cover" />

        <View style={styles.rowInfo}>
          <Text style={styles.name}>{name}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.gridCard, style]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Image source={image} style={styles.gridImage} resizeMode="cover" />

      <View style={styles.gridInfo}>
        <Text style={styles.name}>{name}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
        {price && <Text style={styles.price}>{price}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  gridImage: {
    width: "100%",
    height: 84,
    backgroundColor: colors.background,
  },

  gridInfo: {
    padding: spacing.md,
  },

  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  rowImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  rowInfo: {
    flex: 1,
    marginLeft: spacing.md + 2,
  },

  name: {
    ...typography.cardTitle,
    fontSize: 15,
  },

  description: {
    ...typography.caption,
    marginTop: spacing.xs,
  },

  price: {
    marginTop: spacing.xs + 2,
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
});
