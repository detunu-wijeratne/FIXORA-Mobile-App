import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, spacing } from "../theme";

export default function CustomerBottomNav() {
  const pathname = usePathname();

  const navItems: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    route: string;
  }[] = [
    {
      label: "Home",
      icon: "home-outline",
      activeIcon: "home",
      route: "/customer-home",
    },
    {
      label: "Services",
      icon: "construct-outline",
      activeIcon: "construct",
      route: "/services",
    },
    {
      label: "Bookings",
      icon: "calendar-outline",
      activeIcon: "calendar",
      route: "/my-bookings",
    },
    {
      label: "Profile",
      icon: "person-outline",
      activeIcon: "person",
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
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={22}
              color={isActive ? colors.primary : colors.textMuted}
            />

            <Text style={[styles.navText, isActive && styles.navActive]}>
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
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.md,
    justifyContent: "space-around",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
  },

  navText: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
  },

  navActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
