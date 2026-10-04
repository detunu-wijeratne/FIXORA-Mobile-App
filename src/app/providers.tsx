import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../services/firebase";

type Provider = {
  id: string;
  name?: string;
  category?: string;
  district?: string;
  email?: string;
  phone?: string;

  verificationStatus?: string;
  accountStatus?: string;

  rating?: number;
  reviewCount?: number;
  experience?: string;
  price?: number;
};

export default function ProvidersScreen() {
  const { service } = useLocalSearchParams();

  const selectedService =
    typeof service === "string"
      ? service
      : "Service Providers";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const providersQuery = query(
      collection(db, "users"),
      where("role", "==", "provider")
    );

    const unsubscribe = onSnapshot(
      providersQuery,
      (snapshot) => {
        const loadedProviders: Provider[] =
          snapshot.docs
            .map((providerDoc) => ({
              id: providerDoc.id,
              ...providerDoc.data(),
            }))
            .filter(
              (provider: any) =>
                provider.accountStatus !== "disabled"
            ) as Provider[];

        console.log(
          "Providers found:",
          loadedProviders.length
        );

        setProviders(loadedProviders);
        setLoading(false);
      },
      (error) => {
        console.log(
          "Error loading providers:",
          error
        );

        alert(
          error.message ||
            "Unable to load providers."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredProviders = providers.filter(
    (provider) => {
      const searchText = search
        .trim()
        .toLowerCase();

      if (!searchText) {
        return true;
      }

      return (
        provider.name
          ?.toLowerCase()
          .includes(searchText) ||
        provider.category
          ?.toLowerCase()
          .includes(searchText) ||
        provider.district
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text style={styles.title}>
          {selectedService}
        </Text>

        <Text style={styles.subtitle}>
          Find trusted professionals near you.
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>
              🔍
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search providers..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
          >
            <Text style={styles.filterIcon}>
              ⚙️
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text style={styles.loadingText}>
              Loading providers...
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {filteredProviders.length}{" "}
                {filteredProviders.length === 1
                  ? "provider"
                  : "providers"}{" "}
                found
              </Text>

              <TouchableOpacity>
                <Text style={styles.sortText}>
                  Sort ▾
                </Text>
              </TouchableOpacity>
            </View>

            {filteredProviders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>
                  👨‍🔧
                </Text>

                <Text style={styles.emptyTitle}>
                  No providers found
                </Text>

                <Text style={styles.emptyText}>
                  Try another search.
                </Text>
              </View>
            ) : (
              <View style={styles.providerList}>
                {filteredProviders.map(
                  (provider) => {
                    const verified =
                      provider.verificationStatus ===
                      "approved";

                    const rating =
                      provider.rating ?? 0;

                    const reviewCount =
                      provider.reviewCount ?? 0;

                    const experience =
                      provider.experience ||
                      "New provider";

                    const price =
                      provider.price ?? 2500;

                    return (
                      <TouchableOpacity
                        key={provider.id}
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() =>
                          router.push({
                            pathname:
                              "/provider-profile",

                            params: {
                              providerId:
                                provider.id,

                              name:
                                provider.name ||
                                "Service Provider",

                              service:
                                provider.category ||
                                selectedService,

                              category:
                                provider.category ||
                                "",

                              district:
                                provider.district ||
                                "",

                              email:
                                provider.email ||
                                "",

                              phone:
                                provider.phone ||
                                "",

                              rating:
                                String(rating),

                              reviews:
                                String(
                                  reviewCount
                                ),

                              experience,

                              price: String(
                                price
                              ),

                              verified:
                                verified
                                  ? "true"
                                  : "false",
                            },
                          })
                        }
                      >
                        <View
                          style={styles.avatar}
                        >
                          <Text
                            style={
                              styles.avatarText
                            }
                          >
                            👨‍🔧
                          </Text>
                        </View>

                        <View
                          style={
                            styles.providerInfo
                          }
                        >
                          <View
                            style={styles.nameRow}
                          >
                            <Text
                              style={
                                styles.providerName
                              }
                            >
                              {provider.name ||
                                "Service Provider"}
                            </Text>

                            {verified && (
                              <Text
                                style={
                                  styles.verified
                                }
                              >
                                ✓ Verified
                              </Text>
                            )}
                          </View>

                          <Text
                            style={
                              styles.providerService
                            }
                          >
                            {provider.category ||
                              "Service Provider"}
                          </Text>

                          <View
                            style={
                              styles.ratingRow
                            }
                          >
                            <Text
                              style={
                                styles.rating
                              }
                            >
                              ⭐{" "}
                              {rating > 0
                                ? rating.toFixed(
                                    1
                                  )
                                : "New"}
                            </Text>

                            <Text
                              style={
                                styles.reviews
                              }
                            >
                              ({reviewCount}{" "}
                              {reviewCount === 1
                                ? "review"
                                : "reviews"})
                            </Text>
                          </View>

                          <View
                            style={
                              styles.detailsRow
                            }
                          >
                            <Text
                              style={
                                styles.detail
                              }
                            >
                              📍{" "}
                              {provider.district ||
                                "Location not set"}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.detailsRow
                            }
                          >
                            <Text
                              style={
                                styles.detail
                              }
                            >
                              🧰 {experience}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.bottomRow
                            }
                          >
                            <Text
                              style={
                                styles.price
                              }
                            >
                              From Rs.{" "}
                              {Number(
                                price
                              ).toLocaleString()}
                            </Text>

                            <Text
                              style={
                                styles.viewProfile
                              }
                            >
                              View Profile
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            )}
          </>
        )}
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

  loadingContainer: {
    marginTop: 60,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
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
    marginTop: 7,
  },

  detail: {
    flex: 1,
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

  emptyCard: {
    marginTop: 35,
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 38,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    color: "#64748B",
  },
});