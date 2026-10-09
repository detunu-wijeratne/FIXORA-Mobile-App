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
  Image,
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
import { db } from "../services/firebase";
import { matchesServiceCategory } from "../services/serviceCategories";
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

  const selectedCategory = typeof service === "string" ? service : "";
  const selectedService = selectedCategory || "Service Providers";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [serviceCategories, setServiceCategories] = useState<Record<string, string[]>>({});
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

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
            ...providerDoc.data(),
            id: providerDoc.id,
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

    const unsubscribeServices = onSnapshot(
      collection(db, "provider_services"),
      (snapshot) => {
        const categories: Record<string, string[]> = {};
        snapshot.docs.forEach((serviceDoc) => {
          const data = serviceDoc.data();
          if (typeof data.providerId !== "string" || typeof data.category !== "string") return;
          (categories[data.providerId] ??= []).push(data.category);
        });
        setServiceCategories(categories);
        setServicesError("");
        setServicesLoading(false);
      },
      (error) => {
        console.log("Error loading provider services:", error);
        setServicesError("Unable to load additional provider services. Please try again later.");
        setServicesLoading(false);
      },
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
      unsubscribeServices();
      unsubscribeReviews();
    };
  }, []);

  /*
    FILTER PROVIDERS
  */
  const filteredProviders = providers
    .filter((provider) => matchesServiceCategory(
      selectedCategory, provider.category, serviceCategories[provider.id],
    ))
    .filter((provider) => {
      const searchText = search.trim().toLowerCase();

      if (!searchText) {
        return true;
      }

      return (
        provider.name?.toLowerCase().includes(searchText) ||
        provider.category?.toLowerCase().includes(searchText) ||
        serviceCategories[provider.id]?.some((category) => category.toLowerCase().includes(searchText)) ||
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SERVICE CATEGORY</Text>
            <Text style={styles.title} numberOfLines={1}>
              {selectedService}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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

              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.filterButton} activeOpacity={0.85}>
              <Ionicons name="options-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {loading || servicesLoading ? (
            <LoadingState label="Loading providers..." />
          ) : (
            <>
              {!!servicesError && <Text style={styles.subtitle}>{servicesError}</Text>}
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  <Text style={styles.resultsCount}>{filteredProviders.length}</Text>{" "}
                  {filteredProviders.length === 1 ? "provider" : "providers"} found
                </Text>

                <TouchableOpacity style={styles.sortPill} activeOpacity={0.85}>
                  <Text style={styles.sortText}>Top rated</Text>
                  <Ionicons name="chevron-down" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {filteredProviders.length === 0 ? (
                <EmptyState
                  icon="people-outline"
                  title="No providers found"
                  description={search.trim()
                    ? "Try another search term or clear the search box."
                    : `No providers currently offer ${selectedService}. Try another category.`}
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

                    const openProfile = () =>
                      router.push({
                        pathname: "/provider-profile",
                        params: {
                          providerId: provider.id,
                          name: provider.name || "Service Provider",
                          service: provider.category || selectedService,
                          bookingService: selectedCategory || provider.category || "Home Service",
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
                      });

                    return (
                      <ProviderListCard
                        key={provider.id}
                        name={provider.name || "Service Provider"}
                        category={provider.category || "Service Provider"}
                        district={provider.district || "Location not set"}
                        rating={rating}
                        reviewCount={reviewCount}
                        verified={verified}
                        price={price}
                        avatarUrl={provider.profileImageUrl}
                        onPress={openProfile}
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

/*
  A screen-local, more premium card for this listing specifically
  (bigger avatar, compact rating/review/district row that can't
  overflow, a well-proportioned "View Profile" pill). Kept local to
  this file rather than editing the shared ProviderCard component,
  since that component is also used by customer-home.tsx and this
  task is scoped to the Services/Provider Listing screen only.
*/
function ProviderListCard({
  name,
  category,
  district,
  rating,
  reviewCount,
  verified,
  price,
  avatarUrl,
  onPress,
}: {
  name: string;
  category: string;
  district: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  price: number;
  avatarUrl?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.cardTopRow}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={colors.primary} />
          </View>
        )}

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>

            {verified && (
              <View style={styles.verifiedPill}>
                <Ionicons name="shield-checkmark" size={11} color={colors.primary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={13} color={colors.warning} />
              <Text style={styles.ratingText}>
                {rating > 0 ? rating.toFixed(1) : "New"}
              </Text>
            </View>

            <Text style={styles.reviewText} numberOfLines={1}>
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
              {district}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottomRow}>
        <View>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>Rs. {price.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.viewProfileBtn} onPress={onPress} activeOpacity={0.9}>
          <Text style={styles.viewProfileText}>View Profile</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: colors.primary,
  },

  title: {
    marginTop: 2,
    ...typography.pageTitle,
    fontSize: 22,
  },

  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl + 8,
  },

  subtitle: {
    ...typography.secondary,
  },

  searchRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginTop: spacing.lg,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
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
    borderRadius: radius.lg,
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
    fontSize: 13,
  },

  resultsCount: {
    fontWeight: "800",
    color: colors.textPrimary,
  },

  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },

  sortText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  providerList: {
    gap: spacing.md + 2,
  },

  /* Provider list card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: "#0B1220",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  name: {
    ...typography.cardTitle,
    fontSize: 16,
    flexShrink: 1,
  },

  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },

  verifiedText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
  },

  category: {
    marginTop: 2,
    ...typography.secondary,
    fontSize: 12.5,
  },

  metaRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  reviewText: {
    flexShrink: 1,
    ...typography.caption,
  },

  locationRow: {
    marginTop: spacing.xs + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  locationText: {
    flex: 1,
    ...typography.secondary,
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceLabel: {
    ...typography.caption,
  },

  priceValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 4,
  },

  viewProfileText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
