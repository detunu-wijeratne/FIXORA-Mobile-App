import { router, useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProvidersScreen() {
  const { service } = useLocalSearchParams();

  const selectedService =
    typeof service === "string" ? service : "Service Providers";

  const providers = [
    {
      id: 1,
      name: "Kamal Perera",
      service: "Plumber",
      rating: "4.9",
      reviews: "126",
      distance: "1.2 km",
      experience: "8 years",
      price: "Rs. 2,500",
      verified: true,
    },
    {
      id: 2,
      name: "Nimal Fernando",
      service: "Plumber",
      rating: "4.8",
      reviews: "98",
      distance: "2.1 km",
      experience: "6 years",
      price: "Rs. 2,200",
      verified: true,
    },
    {
      id: 3,
      name: "Saman Jayasinghe",
      service: "Plumber",
      rating: "4.6",
      reviews: "74",
      distance: "3.4 km",
      experience: "5 years",
      price: "Rs. 2,000",
      verified: false,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{selectedService}</Text>

        <Text style={styles.subtitle}>
          Find trusted professionals near you.
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search providers..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {providers.length} providers found
          </Text>

          <TouchableOpacity>
            <Text style={styles.sortText}>Sort ▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.providerList}>
          {providers.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/provider-profile",
                  params: {
                    id: provider.id,
                    name: provider.name,
                    service: provider.service,
                    rating: provider.rating,
                    reviews: provider.reviews,
                    distance: provider.distance,
                    experience: provider.experience,
                    price: provider.price,
                    verified: provider.verified ? "true" : "false",
                  },
                })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👨‍🔧</Text>
              </View>

              <View style={styles.providerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.providerName}>{provider.name}</Text>

                  {provider.verified && (
                    <Text style={styles.verified}>✓ Verified</Text>
                  )}
                </View>

                <Text style={styles.providerService}>
                  {provider.service}
                </Text>

                <View style={styles.ratingRow}>
                  <Text style={styles.rating}>
                    ⭐ {provider.rating}
                  </Text>

                  <Text style={styles.reviews}>
                    ({provider.reviews} reviews)
                  </Text>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detail}>
                    📍 {provider.distance}
                  </Text>

                  <Text style={styles.detail}>
                    🧰 {provider.experience}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.price}>
                    From {provider.price}
                  </Text>

                  <Text style={styles.viewProfile}>
                    View Profile
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: 24,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },

  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  searchBox: {
    flex: 1,
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

  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  filterIcon: {
    fontSize: 20,
  },

  resultsHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsText: {
    fontSize: 14,
    color: "#64748B",
  },

  sortText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },

  providerList: {
    gap: 14,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 28,
  },

  providerInfo: {
    flex: 1,
    marginLeft: 13,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  providerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  verified: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "700",
  },

  providerService: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  rating: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },

  reviews: {
    marginLeft: 5,
    fontSize: 12,
    color: "#94A3B8",
  },

  detailsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 7,
  },

  detail: {
    fontSize: 12,
    color: "#64748B",
  },

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  viewProfile: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
});