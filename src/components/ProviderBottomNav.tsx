// src/components/ProviderBottomNav.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useMainNavigationBack from "../hooks/useMainNavigationBack";

import { colors, radius, spacing } from "../theme";

type NavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

export default function ProviderBottomNav() {
  useMainNavigationBack("/provider/dashboard");
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navItems: NavItem[] = [
    { label: "Home", icon: "home-outline", route: "/provider/dashboard" },
    { label: "Jobs", icon: "briefcase-outline", route: "/provider/jobs" },
    { label: "Schedule", icon: "calendar-outline", route: "/provider/schedule" },
    { label: "Earnings", icon: "cash-outline", route: "/provider/earnings" },
    { label: "Profile", icon: "person-outline", route: "/provider/profile" },
  ];

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {navItems.map((item) => {
        const active = pathname === item.route;

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.item}
            onPress={() => router.replace(item.route)}
            activeOpacity={0.85}
            hitSlop={10}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? colors.primary : colors.textMuted}
              />
            </View>

            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>

            <View style={[styles.activeDot, active && styles.activeDotOn]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,

    // subtle shadow
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
  },

  item: {
    flex: 1,
    alignItems: "center",
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },

  label: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },

  labelActive: {
    color: colors.primary,
    fontWeight: "800",
  },

  activeDot: {
    marginTop: 5,
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
  },

  activeDotOn: {
    backgroundColor: colors.primary,
  },
});