import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTextInput from "../components/AppTextInput";
import CustomerBottomNav from "../components/CustomerBottomNav";
import ScreenHeader from "../components/ScreenHeader";
import ServiceCard from "../components/ServiceCard";
import { colors, spacing } from "../theme";

const SERVICES = [
  {
    name: "Plumbing",
    description: "Pipes, leaks and repairs",
    image: require("../../assets/images/services/plumbing.png"),
  },
  {
    name: "Electrical",
    description: "Wiring and electrical work",
    image: require("../../assets/images/services/electrical.png"),
  },
  {
    name: "Cleaning",
    description: "Home and deep cleaning",
    image: require("../../assets/images/services/cleaning.png"),
  },
  {
    name: "Painting",
    description: "Interior and exterior painting",
    image: require("../../assets/images/services/painting.png"),
  },
  {
    name: "Carpentry",
    description: "Furniture and wood repairs",
    image: require("../../assets/images/services/carpentry.png"),
  },
  {
    name: "AC Repair",
    description: "Air conditioning services",
    image: require("../../assets/images/services/ac-service.png"),
  },
  {
    name: "Gardening",
    description: "Garden and outdoor care",
    image: require("../../assets/images/services/gardening.png"),
  },
  {
    name: "Appliance Repair",
    description: "Household appliance repairs",
    image: require("../../assets/images/services/appliance-repair.png"),
  },
];

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title="All Services"
          subtitle="Choose a service category to find trusted professionals near you."
        />

        <AppTextInput placeholder="Search services..." />

        <View style={styles.list}>
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.name}
              variant="row"
              name={service.name}
              description={service.description}
              image={service.image}
              onPress={() =>
                router.push({
                  pathname: "/providers",
                  params: { service: service.name },
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      <CustomerBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl + 8,
  },

  list: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
