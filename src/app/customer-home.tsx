import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import BookingCard from "../components/BookingCard";
import CustomerBottomNav from "../components/CustomerBottomNav";
import ProviderCard from "../components/ProviderCard";
import ServiceCard from "../components/ServiceCard";
import { auth, db } from "../services/firebase";
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

type Booking = {
  id: string;
  providerId?: string;
  providerName?: string;
  service?: string;
  date?: string;
  time?: string;
  status?: string;
};

type ReviewStats = {
  rating: number;
  count: number;
};

const POPULAR_SERVICES = [
  {
    name: "Plumbing",
    description: "Leaks, Taps, Pipe Fitting",
    price: "From LKR 2,500",
    image: require("../../assets/images/services/plumbing.png"),
  },
  {
    name: "Electrical",
    description: "Wiring, Fans, Breakers",
    price: "From LKR 3,000",
    image: require("../../assets/images/services/electrical.png"),
  },
  {
    name: "AC Service",
    description: "Gas Refill, Overhaul",
    price: "From LKR 3,500",
    image: require("../../assets/images/services/ac-service.png"),
  },
  {
    name: "Cleaning",
    description: "Deep, Sofa, Water Tank",
    price: "From LKR 4,500",
    image: require("../../assets/images/services/cleaning.png"),
  },
  {
    name: "Painting",
    description: "Interior, Waterproofing",
    price: "From LKR 2,500",
    image: require("../../assets/images/services/painting.png"),
  },
  {
    name: "Carpentry",
    description: "Repairs, Furniture & More",
    price: "From LKR 2,500",
    image: require("../../assets/images/services/carpentry.png"),
  },
  {
    name: "Appliance Repair",
    description: "Fridges, Washers & More",
    image: require("../../assets/images/services/appliance-repair.png"),
  },
  {
    name: "Gardening",
    description: "Lawns, Trimming & Upkeep",
    image: require("../../assets/images/services/gardening.png"),
  },
];

export default function CustomerHomeScreen() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("Customer");
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const popular = ["Emergency Leak", "AC Service", "Deep Cleaning"];

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    const loadCustomer = async () => {
      try {
        const customerDoc = await getDoc(doc(db, "users", user.uid));

        if (customerDoc.exists()) {
          const data = customerDoc.data();
          setCustomerName(data.name || "Customer");
        }
      } catch (error) {
        console.log("Customer profile load error:", error);
      }
    };

    loadCustomer();

    /*
      PROVIDERS
    */
    const providersQuery = query(
      collection(db, "users"),
      where("role", "==", "provider")
    );

    const unsubscribeProviders = onSnapshot(
      providersQuery,
      (snapshot) => {
        const loaded: Provider[] = snapshot.docs
          .map((providerDoc) => ({
            ...providerDoc.data(),
            id: providerDoc.id,
          }))
          .filter(
            (provider: any) => provider.accountStatus !== "disabled"
          ) as Provider[];

        setProviders(loaded);
        setLoadingProviders(false);
      },
      (error) => {
        console.log("Providers loading error:", error);
        setLoadingProviders(false);
      }
    );

    /*
      REAL REVIEWS
      Calculate rating + review count directly from reviews collection.
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
          const providerTotal = totals[providerId];

          calculatedStats[providerId] = {
            rating:
              providerTotal.count > 0
                ? providerTotal.total / providerTotal.count
                : 0,
            count: providerTotal.count,
          };
        });

        setReviewStats(calculatedStats);
      },
      (error) => {
        console.log("Home reviews loading error:", error);
      }
    );

    /*
      CUSTOMER ACTIVE BOOKING
    */
    const bookingQuery = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid)
    );

    const unsubscribeBookings = onSnapshot(
      bookingQuery,
      (snapshot) => {
        const bookings: Booking[] = snapshot.docs.map((bookingDoc) => ({
          id: bookingDoc.id,
          ...bookingDoc.data(),
        })) as Booking[];

        const current =
          bookings.find(
            (booking) =>
              booking.status === "confirmed" ||
              booking.status === "in_progress"
          ) || null;

        setActiveBooking(current);
      },
      (error) => {
        console.log("Home active booking error:", error);
      }
    );

    return () => {
      unsubscribeProviders();
      unsubscribeReviews();
      unsubscribeBookings();
    };
  }, []);

  /*
    OPEN PROVIDER
  */
  const openProvider = (provider: Provider) => {
    const rating = reviewStats[provider.id]?.rating ?? provider.rating ?? 0;
    const reviews = reviewStats[provider.id]?.count ?? provider.reviewCount ?? 0;
    const price = provider.price ?? 2500;

    router.push({
      pathname: "/provider-profile",
      params: {
        providerId: provider.id,
        name: provider.name || "Service Provider",
        service: provider.category || "Home Service",
        category: provider.category || "",
        district: provider.district || "",
        email: provider.email || "",
        phone: provider.phone || "",
        rating: String(rating),
        reviews: String(reviews),
        experience: provider.experience || "New provider",
        price: String(price),
        verified:
          provider.verificationStatus === "approved" ? "true" : "false",
        profileImageUrl: provider.profileImageUrl || "",
      },
    });
  };

  const handleSearch = () => {
    const value = search.trim();

    router.push({
      pathname: "/providers",
      params: {
        service: value || "Service Providers",
      },
    });
  };

  /*
    SORT TOP PROVIDERS USING REAL REVIEW RATINGS
  */
  const topProviders = [...providers]
    .sort((a, b) => {
      const ratingA = reviewStats[a.id]?.rating ?? a.rating ?? 0;
      const ratingB = reviewStats[b.id]?.rating ?? b.rating ?? 0;
      return ratingB - ratingA;
    })
    .slice(0, 2);

  const greetingName =
    customerName && customerName !== "Customer" ? customerName : "there";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO */}

        <ImageBackground
          source={require("../../assets/images/customer-home-hero.png")}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />

          <View style={styles.heroTopRow}>
            <View style={styles.locationPill}>
              <Ionicons name="location" size={14} color={colors.white} />
              <Text style={styles.locationText}>Colombo</Text>
              <Ionicons name="chevron-down" size={13} color={colors.white} />
            </View>

            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={20} color={colors.white} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileCircle}
                onPress={() => router.push("/customer-profile")}
              >
                <Ionicons name="person" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroTextBlock}>
            <Text style={styles.greeting}>Hi {greetingName},</Text>
            <Text style={styles.heroHeading}>
              What do you need help with today?
            </Text>
          </View>
        </ImageBackground>

        {/* SEARCH */}

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search for a service..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />

          <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
            <Ionicons name="options" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.popularRow}>
          <Text style={styles.popularLabel}>Popular:</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popular.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.popularChip}
                onPress={() =>
                  router.push({
                    pathname: "/providers",
                    params: { service: item },
                  })
                }
              >
                <Text style={styles.popularChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ACTIVE BOOKING */}

        {activeBooking && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Your active booking</Text>

            <BookingCard
              service={activeBooking.service || "Home Service"}
              providerName={activeBooking.providerName || "your provider"}
              date={activeBooking.date}
              status={
                activeBooking.status === "in_progress"
                  ? "in_progress"
                  : "confirmed"
              }
              onPress={() =>
                router.push({
                  pathname: "/booking-details",
                  params: { bookingId: activeBooking.id },
                })
              }
            />
          </View>
        )}

        {/* PROMO */}

        <ImageBackground
          source={require("../../assets/images/monsoon-banner.png")}
          style={styles.promoCard}
          imageStyle={styles.promoImage}
        >
          <View style={styles.promoOverlay}>
            <Text style={styles.promoTitle}>
              Reliable home services{"\n"}for a better tomorrow.
            </Text>

            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => router.push("/services")}
            >
              <Text style={styles.claimButtonText}>Book a Service</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.white} />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* SERVICES */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular services</Text>

          <TouchableOpacity onPress={() => router.push("/services")}>
            <Text style={styles.viewAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {POPULAR_SERVICES.map((service) => (
            <ServiceCard
              key={service.name}
              variant="grid"
              name={service.name}
              description={service.description}
              price={service.price}
              image={service.image}
              style={styles.serviceCardWidth}
              onPress={() =>
                router.push({
                  pathname: "/providers",
                  params: { service: service.name },
                })
              }
            />
          ))}
        </View>

        {/* TRUST */}

        <View style={styles.trustStrip}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.trustText}>Vetted</Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustItem}>
            <Ionicons name="flash" size={16} color={colors.warning} />
            <Text style={styles.trustText}>Transparent LKR</Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustItem}>
            <Ionicons name="shield" size={16} color={colors.success} />
            <Text style={styles.trustText}>Secure</Text>
          </View>
        </View>

        {/* PROVIDERS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Top-Rated Pros Nearby</Text>
            <Text style={styles.sectionSubtitle}>
              Available for service bookings
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/providers")}>
            <Text style={styles.viewAll}>Sort & Filter</Text>
          </TouchableOpacity>
        </View>

        {loadingProviders ? (
          <View style={styles.loadingProviders}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={styles.providerList}>
            {topProviders.map((provider) => {
              const price = provider.price ?? 2500;
              const rating = reviewStats[provider.id]?.rating ?? provider.rating ?? 0;
              const reviews =
                reviewStats[provider.id]?.count ?? provider.reviewCount ?? 0;

              return (
                <ProviderCard
                  key={provider.id}
                  name={provider.name || "Service Provider"}
                  category={provider.category || "Home Services"}
                  district={provider.district}
                  rating={rating}
                  reviewCount={reviews}
                  verified={provider.verificationStatus === "approved"}
                  price={price}
                  avatarUrl={provider.profileImageUrl}
                  ctaLabel="Book Pro"
                  onPress={() => openProvider(provider)}
                />
              );
            })}
          </View>
        )}

        {/* COVERAGE */}

        <View style={styles.coverageCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.coverageSmall}>FAST DISPATCH NETWORK</Text>

            <Text style={styles.coverageTitle}>Fixora Service Network</Text>

            <Text style={styles.coverageText}>
              Find verified service providers and book trusted professionals
              through Fixora.
            </Text>
          </View>

          <View style={styles.coverageIconBox}>
            <Ionicons name="map-outline" size={34} color={colors.primary} />
          </View>
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
    paddingBottom: 120,
  },

  hero: {
    height: 220,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },

  heroImage: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },

  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.42)",
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },

  locationText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },

  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },

  notificationButton: {
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    right: -1,
    top: -1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.error,
  },

  profileCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroTextBlock: {
    marginTop: spacing.xxl,
  },

  greeting: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },

  heroHeading: {
    marginTop: spacing.xs,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: colors.white,
    maxWidth: "88%",
  },

  searchBox: {
    marginTop: -26,
    marginHorizontal: spacing.xl,
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing.lg - 1,
    paddingRight: spacing.sm,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    marginLeft: spacing.sm + 1,
    paddingVertical: spacing.md + 2,
    fontSize: 14,
    color: colors.textPrimary,
  },

  filterButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  popularRow: {
    marginTop: spacing.md,
    marginHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
  },

  popularLabel: {
    marginRight: spacing.sm,
    fontSize: 11,
    color: colors.textSecondary,
  },

  popularChip: {
    marginRight: spacing.sm,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },

  popularChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },

  sectionBlock: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
  },

  promoCard: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    height: 150,
    borderRadius: radius.lg,
    overflow: "hidden",
  },

  promoImage: {
    borderRadius: radius.lg,
  },

  promoOverlay: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
    backgroundColor: "rgba(8, 18, 45, 0.45)",
  },

  promoTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
    color: colors.white,
  },

  claimButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 3,
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
  },

  claimButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
  },

  sectionHeader: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionTitle: {
    ...typography.sectionHeading,
    fontSize: 19,
  },

  sectionSubtitle: {
    ...typography.caption,
    marginTop: 1,
  },

  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  servicesGrid: {
    marginHorizontal: spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },

  serviceCardWidth: {
    width: "48.5%",
  },

  trustStrip: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  trustText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: "600",
  },

  trustDivider: {
    height: 18,
    width: 1,
    backgroundColor: colors.borderStrong,
  },

  loadingProviders: {
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },

  providerList: {
    marginHorizontal: spacing.xl,
    gap: spacing.md,
  },

  coverageCard: {
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xl,
    minHeight: 140,
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "center",
  },

  coverageSmall: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
  },

  coverageTitle: {
    marginTop: spacing.xs + 1,
    maxWidth: 190,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  coverageText: {
    marginTop: spacing.xs + 2,
    maxWidth: 210,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  coverageIconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
