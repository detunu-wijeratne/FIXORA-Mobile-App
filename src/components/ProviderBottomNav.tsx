import { router, usePathname } from "expo-router";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProviderBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      icon: "🏠",
      route: "/provider/dashboard",
    },
    {
      label: "Jobs",
      icon: "🛠️",
      route: "/provider/jobs",
    },
    {
      label: "Schedule",
      icon: "📅",
      route: "/provider/schedule",
    },
    {
      label: "Earnings",
      icon: "💵",
      route: "/provider/earnings",
    },
    {
      label: "Profile",
      icon: "👤",
      route: "/provider/profile",
    },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const active = pathname === item.route;

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.item}
            onPress={() => router.replace(item.route)}
          >
            <Text style={styles.icon}>{item.icon}</Text>

            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    paddingBottom: 12,
  },

  item: {
    flex: 1,
    alignItems: "center",
  },

  icon: {
    fontSize: 20,
  },

  label: {
    marginTop: 4,
    fontSize: 10,
    color: "#64748B",
  },

  activeLabel: {
    color: "#2563EB",
    fontWeight: "700",
  },
});