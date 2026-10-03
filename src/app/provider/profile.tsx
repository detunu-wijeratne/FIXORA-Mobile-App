import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ProviderBottomNav from "../../components/ProviderBottomNav";

export default function ProviderProfileScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🔧</Text>
          </View>

          <Text style={styles.name}>Ahmad Perera</Text>
          <Text style={styles.service}>Plumber</Text>

          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified Provider</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>126</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemIcon}>👤</Text>
            <Text style={styles.itemText}>Edit Profile</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/provider/availability")}
          >
            <Text style={styles.itemIcon}>📅</Text>
            <Text style={styles.itemText}>Manage Availability</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemIcon}>🛠️</Text>
            <Text style={styles.itemText}>Services & Pricing</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemIcon}>📄</Text>
            <Text style={styles.itemText}>Verification Documents</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/provider/settings")}
          >
            <Text style={styles.itemIcon}>⚙️</Text>
            <Text style={styles.itemText}>Settings</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemIcon}>🔔</Text>
            <Text style={styles.itemText}>Notifications</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemIcon}>❓</Text>
            <Text style={styles.itemText}>Help & Support</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace("/provider/login")}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProviderBottomNav />
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
    paddingBottom: 30,
  },

  profileHeader: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 42,
  },

  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  service: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  verifiedBadge: {
    marginTop: 10,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedText: {
    fontSize: 11,
    color: "#1D4ED8",
    fontWeight: "700",
  },

  statsRow: {
    marginTop: 22,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
  },

  divider: {
    width: 1,
    height: 34,
    backgroundColor: "#E2E8F0",
  },

  section: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  item: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  itemIcon: {
    width: 34,
    fontSize: 20,
  },

  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 24,
    color: "#94A3B8",
  },

  logoutButton: {
    marginTop: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
  },
});