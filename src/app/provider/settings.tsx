import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProviderSettingsScreen() {
  const [jobNotifications, setJobNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [availabilityAlerts, setAvailabilityAlerts] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>New Job Requests</Text>
              <Text style={styles.settingText}>
                Get notified when a customer sends a booking request.
              </Text>
            </View>

            <Switch
              value={jobNotifications}
              onValueChange={setJobNotifications}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Messages</Text>
              <Text style={styles.settingText}>
                Get notified about customer messages.
              </Text>
            </View>

            <Switch
              value={messageNotifications}
              onValueChange={setMessageNotifications}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Schedule Alerts</Text>
              <Text style={styles.settingText}>
                Receive reminders about upcoming jobs and availability.
              </Text>
            </View>

            <Switch
              value={availabilityAlerts}
              onValueChange={setAvailabilityAlerts}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🌐</Text>
            <Text style={styles.menuText}>Language</Text>
            <Text style={styles.value}>English ›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>💳</Text>
            <Text style={styles.menuText}>Payment Settings</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Privacy & Security</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔑</Text>
            <Text style={styles.menuText}>Change Password</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📄</Text>
            <Text style={styles.menuText}>Terms & Conditions</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },

  sectionTitle: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 18,
  },

  settingRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  settingInfo: {
    flex: 1,
    paddingRight: 15,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  settingText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
  },

  menuItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  menuIcon: {
    width: 32,
    fontSize: 19,
  },

  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 23,
    color: "#94A3B8",
  },

  value: {
    fontSize: 12,
    color: "#64748B",
  },
});