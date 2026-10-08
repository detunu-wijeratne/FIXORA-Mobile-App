import { router, useFocusEffect, usePathname } from "expo-router";
import { useCallback } from "react";
import { AppState, BackHandler, Platform, ToastAndroid } from "react-native";

const customerPages = ["/customer-home", "/services", "/my-bookings", "/customer-profile"];
const providerPages = ["/provider/dashboard", "/provider/jobs", "/provider/schedule", "/provider/earnings", "/provider/profile"];
const EXIT_INTERVAL_MS = 2000;

export default function useMainNavigationBack(home: "/customer-home" | "/provider/dashboard") {
  const pathname = usePathname();

  useFocusEffect(useCallback(() => {
    const mainPages = home === "/customer-home" ? customerPages : providerPages;
    if (Platform.OS !== "android" || !mainPages.includes(pathname)) return;

    // This timestamp belongs to this screen's current focus session only.
    let lastBackAt: number | null = null;
    const backSubscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (pathname !== home) {
        router.dismissTo(home);
        return true;
      }

      const now = Date.now();
      if (lastBackAt !== null && now - lastBackAt < EXIT_INTERVAL_MS) {
        lastBackAt = null;
        BackHandler.exitApp();
      } else {
        lastBackAt = now;
        ToastAndroid.show("Go back again to exit", ToastAndroid.SHORT);
      }
      return true;
    });
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") lastBackAt = null;
    });

    return () => {
      backSubscription.remove();
      appStateSubscription.remove();
    };
  }, [home, pathname]));
}
