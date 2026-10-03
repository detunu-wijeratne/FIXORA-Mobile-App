import { router, usePathname } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomerBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      icon: "🏠",
      route: "/customer-home",
    },
    {
      label: "Services",
      icon: "🛠️",
      route: "/services",
    },
    {
      label: "Bookings",
      icon: "📅",
      route: "/my-bookings",
    },
    {
      label: "Profile",
      icon: "👤",
      route: "/customer-profile",
    },
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = pathname === item.route;

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => router.replace(item.route)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>

            <Text
              style={[
                styles.navText,
                isActive && styles.navActive,
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
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    paddingBottom: 12,
    justifyContent: "space-around",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
  },

  navIcon: {
    fontSize: 20,
  },

  navText: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  navActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
});