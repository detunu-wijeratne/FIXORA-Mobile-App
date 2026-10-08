import { Image } from "expo-image";
import { useSegments } from "expo-router";
import { StyleSheet, View } from "react-native";

const backgrounds: Record<string, number> = {
  jobs: require("../../assets/images/services/carpentry.png"),
  schedule: require("../../assets/images/services/electrical.png"),
  earnings: require("../../assets/images/services/painting.png"),
  requests: require("../../assets/images/services/plumbing.png"),
  "services-pricing": require("../../assets/images/services/appliance-repair.png"),
  "my-reviews": require("../../assets/images/services/gardening.png"),
  "edit-profile": require("../../assets/images/customer-signup-bg.png"),
  settings: require("../../assets/images/services/cleaning.png"),
  "job-details": require("../../assets/images/services/ac-service.png"),
  "request-details": require("../../assets/images/booking-location-hero.png"),
  availability: require("../../assets/images/monsoon-banner.png"),
  "service-form": require("../../assets/images/customer-home-hero.png"),
  verification: require("../../assets/images/role-selection-hero.png"),
  "create-manual-job": require("../../assets/images/customer-login-bg.png"),
};
type Props = { variant?: "hero" | "page" };
export default function ProviderBackdrop({ variant = "hero" }: Props) {
  const segments = useSegments();
  const page = segments[segments.length - 1];
  const source = variant === "page" ? backgrounds[page] ?? require("../../assets/images/fixora-welcome-bg.png") : require("../../assets/images/provider-workspace-hero.png");
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Image source={source} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFill} accessible={false} />
    <View style={[StyleSheet.absoluteFill, { backgroundColor: variant === "page" ? "rgba(9,25,42,0.72)" : "rgba(9,25,42,0.25)" }]} />
  </View>;
}
