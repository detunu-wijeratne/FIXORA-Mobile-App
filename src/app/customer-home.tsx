import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomerBottomNav from "../components/CustomerBottomNav";

export default function CustomerHomeScreen() {
  const services = [
    { name: "Plumbing", icon: "💧" },
    { name: "Electrical", icon: "⚡" },
    { name: "Cleaning", icon: "🧹" },
    { name: "Painting", icon: "🎨" },
  ];

  const providers = [
    {
      name: "Kamal Perera",
      service: "Plumber",
      rating: "4.9",
      distance: "1.2 km",
    },
    {
      name: "Nimal Fernando",
      service: "Electrician",
      rating: "4.8",
      distance: "2.1 km",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day 👋</Text>
            <Text style={styles.title}>Find a service</Text>
          </View>

          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileText}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>

          <TextInput
            placeholder="Search for a service..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services</Text>

          <TouchableOpacity onPress={() => router.push("/services")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.name}
              style={styles.serviceCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/providers",
                  params: { service: service.name },
                })
              }
            >
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceEmoji}>{service.icon}</Text>
              </View>

              <Text style={styles.serviceName}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Providers</Text>

          <TouchableOpacity onPress={() => router.push("/providers")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.providerList}>
          {providers.map((provider) => (
            <TouchableOpacity
              key={provider.name}
              style={styles.providerCard}
              activeOpacity={0.7}
              onPress={() => router.push("/provider-profile")}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👨‍🔧</Text>
              </View>

              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>

                <Text style={styles.providerService}>
                  {provider.service}
                </Text>

                <View style={styles.providerMeta}>
                  <Text style={styles.rating}>
                    ⭐ {provider.rating}
                  </Text>

                  <Text style={styles.distance}>
                    {provider.distance}
                  </Text>
                </View>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
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
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  greeting: {
    fontSize: 14,
    color: "#64748B",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    fontSize: 21,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 26,
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

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
  },

  seeAll: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  serviceCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceEmoji: {
    fontSize: 22,
  },

  serviceName: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  providerList: {
    gap: 12,
  },

  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 24,
  },

  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  providerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  providerService: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  providerMeta: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
  },

  rating: {
    fontSize: 12,
    color: "#475569",
  },

  distance: {
    fontSize: 12,
    color: "#64748B",
  },

  arrow: {
    fontSize: 28,
    color: "#94A3B8",
  },

});