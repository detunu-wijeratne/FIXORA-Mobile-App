import { router } from "expo-router";
import CustomerBottomNav from "../components/CustomerBottomNav";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ServicesScreen() {
  const services = [
    { name: "Plumbing", icon: "💧", description: "Pipes, leaks and repairs" },
    { name: "Electrical", icon: "⚡", description: "Wiring and electrical work" },
    { name: "Cleaning", icon: "🧹", description: "Home and deep cleaning" },
    {
      name: "Painting",
      icon: "🎨",
      description: "Interior and exterior painting",
    },
    {
      name: "Carpentry",
      icon: "🪚",
      description: "Furniture and wood repairs",
    },
    {
      name: "AC Repair",
      icon: "❄️",
      description: "Air conditioning services",
    },
    {
      name: "Gardening",
      icon: "🌿",
      description: "Garden and outdoor care",
    },
    {
      name: "Appliance Repair",
      icon: "🔧",
      description: "Household appliance repairs",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>What service do you need?</Text>

        <Text style={styles.subtitle}>
          Choose a service category to find trusted professionals near you.
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.list}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.name}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/providers",
                  params: { service: service.name },
                })
              }
            >
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{service.icon}</Text>
              </View>

              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>

                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <CustomerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
  },

  searchBox: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
  },

  list: {
    marginTop: 22,
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 24,
  },

  serviceInfo: {
    flex: 1,
    marginLeft: 14,
  },

  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  serviceDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  arrow: {
    fontSize: 28,
    color: "#94A3B8",
  },
});