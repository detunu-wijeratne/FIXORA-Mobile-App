import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import CustomerBottomNav from "../components/CustomerBottomNav";


import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProviderCard from "../components/ProviderCard";
import { db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

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

  profileImageUrl?: string;
};

type ReviewStats = {
  rating: number;
  count: number;
};

export default function ProvidersScreen() {
  const { service } = useLocalSearchParams();

  const selectedService =
    typeof service === "string" ? service : "Service Providers";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /*
      LOAD PROVIDERS
    */
    const providersQuery = query(
      collection(db, "users"),
      where("role", "==", "provider")
    );

    const unsubscribeProviders = onSnapshot(
      providersQuery,
      (snapshot) => {
        const loadedProviders: Provider[] = snapshot.docs
          .map((providerDoc) => ({
            id: providerDoc.id,
            ...providerDoc.data(),
          }))
          .filter(
            (provider: any) => provider.accountStatus !== "disabled"
          ) as Provider[];

        console.log("Providers found:", loadedProviders.length);

        setProviders(loadedProviders);
        setLoading(false);
      },
      (error) => {
        console.log("Error loading providers:", error);
        alert(error.message || "Unable to load providers.");
        setLoading(false);
      }
    );

    /*
      LOAD REAL REVIEWS
    */
    const unsubscribeReviews = onSnapshot(
      collection(db, "reviews"),
      (snapshot) => {
        const totals: Record<string, { total: number; count: number }> = {};

        snapshot.docs.forEach((reviewDoc) => {
          const data = reviewDoc.data();
          const providerId = data.providerId;

          if (!providerId) {
            return;
          }

          if (!totals[providerId]) {
            totals[providerId] = { total: 0, count: 0 };
          }

          totals[providerId].total += Number(data.rating || 0);
          totals[providerId].count += 1;
        });

        const calculatedStats: Record<string, ReviewStats> = {};

        Object.keys(totals).forEach((providerId) => {
          const data = totals[providerId];

          calculatedStats[providerId] = {
            rating: data.count > 0 ? data.total / data.count : 0,
            count: data.count,
          };
        });

        setReviewStats(calculatedStats);
      },
      (error) => {
        console.log("Provider reviews error:", error);
      }
    );

    return () => {
      unsubscribeProviders();
      unsubscribeReviews();
    };
  }, []);

  /*
    FILTER PROVIDERS
  */
  const filteredProviders = providers
    .filter((provider) => {
      const searchText = search.trim().toLowerCase();

      if (!searchText) {
        return true;
      }

      return (
        provider.name?.toLowerCase().includes(searchText) ||
        provider.category?.toLowerCase().includes(searchText) ||
        provider.district?.toLowerCase().includes(searchText)
      );
    })

    /*
      SORT USING REAL RATINGS
    */
    .sort((a, b) => {
      const ratingA = reviewStats[a.id]?.rating ?? a.rating ?? 0;
      const ratingB = reviewStats[b.id]?.rating ?? b.rating ?? 0;
      return ratingB - ratingA;
    });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{selectedService}</Text>

        <Text style={styles.subtitle}>Find trusted professionals near you.</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />

            <TextInput
              style={styles.searchInput}
              placeholder="Search providers..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <LoadingState label="Loading providers..." />
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {filteredProviders.length}{" "}
                {filteredProviders.length === 1 ? "provider" : "providers"} found
              </Text>

              <TouchableOpacity>
                <Text style={styles.sortText}>Sort ▾</Text>
              </TouchableOpacity>
            </View>

            {filteredProviders.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No providers found"
                description="Try another search."
              />
            ) : (
              <View style={styles.providerList}>
                {filteredProviders.map((provider) => {
                  const verified = provider.verificationStatus === "approved";

                  const rating =
                    reviewStats[provider.id]?.rating ?? provider.rating ?? 0;

                  const reviewCount =
                    reviewStats[provider.id]?.count ?? provider.reviewCount ?? 0;

                  const price = provider.price ?? 2500;

                  return (
                    <ProviderCard
                      key={provider.id}
                      name={provider.name || "Service Provider"}
                      category={provider.category || "Service Provider"}
                      district={provider.district || "Location not set"}
                      rating={rating}
                      reviewCount={reviewCount}
                      verified={verified}
                      price={price}
                      avatarUrl={provider.profileImageUrl}
                      onPress={() =>
                        router.push({
                          pathname: "/provider-profile",
                          params: {
                            providerId: provider.id,
                            name: provider.name || "Service Provider",
                            service: provider.category || selectedService,
                            category: provider.category || "",
                            district: provider.district || "",
                            email: provider.email || "",
                            phone: provider.phone || "",
                            rating: String(rating),
                            reviews: String(reviewCount),
                            experience: provider.experience || "New provider",
                            price: String(price),
                            verified: verified ? "true" : "false",
                            profileImageUrl: provider.profileImageUrl || "",
                          },
                        })
                      }
                    />
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <CustomerBottomNav />
      </SafeAreaView>
    </>
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

  title: {
    ...typography.pageTitle,
    fontSize: 26,
  },

  subtitle: {
    ...typography.secondary,
    marginTop: spacing.xs + 2,
  },

  searchRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginTop: spacing.xl,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md + 2,
    gap: spacing.sm,
  },

  searchInput: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },

  filterButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  resultsHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsText: {
    ...typography.secondary,
  },

  sortText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },

  providerList: {
    gap: spacing.md + 2,
  },
});
