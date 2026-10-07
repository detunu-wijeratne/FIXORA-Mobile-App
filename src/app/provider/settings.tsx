// src/app/provider/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import ScreenHeader from "../../components/ScreenHeader";
import { colors, radius, spacing, typography } from "../../theme";

export default function ProviderSettingsScreen() {
  const [jobNotifications, setJobNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [availabilityAlerts, setAvailabilityAlerts] = useState(true);

  const allOff = useMemo(
    () => !jobNotifications && !messageNotifications && !availabilityAlerts,
    [jobNotifications, messageNotifications, availabilityAlerts],
  );

  const switchTrackColor = {
    false: Platform.select({ ios: colors.borderStrong, default: colors.borderStrong })!,
    true: colors.primary,
  };

  const switchThumbColor = Platform.select({
    ios: undefined,
    default: colors.white,
  });

  const openComingSoon = (title: string) => {
    Alert.alert("Coming soon", `${title} will be available in the next update.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          eyebrow="FIXORA"
          title="Settings"
          subtitle="Control notifications and account preferences."
        />

        {/* Notification summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name={allOff ? "notifications-off-outline" : "notifications-outline"}
              size={18}
              color={colors.primary}
            />
          </View>

          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.summaryTitle}>
              {allOff ? "Notifications are off" : "Notifications are on"}
            </Text>
            <Text style={styles.summaryText}>
              Manage alerts for new requests, messages, and schedule reminders.
            </Text>
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <SettingToggleRow
            icon="briefcase-outline"
            title="New job requests"
            description="Get notified when a customer sends a booking request."
            value={jobNotifications}
            onValueChange={setJobNotifications}
            trackColor={switchTrackColor}
            thumbColor={switchThumbColor}
          />

          <Divider />

          <SettingToggleRow
            icon="chatbubble-ellipses-outline"
            title="Messages"
            description="Get notified when customers message you."
            value={messageNotifications}
            onValueChange={setMessageNotifications}
            trackColor={switchTrackColor}
            thumbColor={switchThumbColor}
          />

          <Divider />

          <SettingToggleRow
            icon="calendar-outline"
            title="Schedule alerts"
            description="Reminders for upcoming jobs and availability."
            value={availabilityAlerts}
            onValueChange={setAvailabilityAlerts}
            trackColor={switchTrackColor}
            thumbColor={switchThumbColor}
            last
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <SettingNavRow
            icon="language-outline"
            title="Language"
            value="English"
            onPress={() => openComingSoon("Language")}
          />

          <Divider />

          <SettingNavRow
            icon="card-outline"
            title="Payment settings"
            onPress={() => openComingSoon("Payment settings")}
          />

          <Divider />

          <SettingNavRow
            icon="lock-closed-outline"
            title="Privacy & security"
            onPress={() => openComingSoon("Privacy & security")}
            last
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <SettingNavRow
            icon="key-outline"
            title="Change password"
            onPress={() => openComingSoon("Change password")}
          />

          <Divider />

          <SettingNavRow
            icon="document-text-outline"
            title="Terms & conditions"
            onPress={() => openComingSoon("Terms & conditions")}
            last
          />
        </View>

        <View style={styles.footerHint}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.footerHintText}>
            Tip: Keep at least “New job requests” enabled so you don’t miss bookings.
          </Text>
        </View>
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function SettingToggleRow({
  icon,
  title,
  description,
  value,
  onValueChange,
  trackColor,
  thumbColor,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  trackColor: { false: string; true: string };
  thumbColor?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{title}</Text>
          {!!description && <Text style={styles.rowDesc}>{description}</Text>}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={trackColor}
        thumbColor={thumbColor}
        ios_backgroundColor={colors.borderStrong}
      />
    </View>
  );
}

function SettingNavRow({
  icon,
  title,
  value,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, last && styles.rowLast]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{title}</Text>
        </View>

        {value ? <Text style={styles.valueText}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 90,
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  summaryText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    ...typography.sectionHeading,
    fontSize: 15,
    fontWeight: "900",
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },

  rowLast: {
    borderBottomWidth: 0,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  rowTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  rowDesc: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  valueText: {
    marginRight: 4,
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  footerHint: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md + 2,
  },

  footerHintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});