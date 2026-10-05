import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

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
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import CustomerBottomNav from "../components/CustomerBottomNav";
import { auth, db } from "../services/firebase";

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

export default function CustomerHomeScreen() {
  const [providers, setProviders] =
    useState<Provider[]>([]);

  const [loadingProviders, setLoadingProviders] =
    useState(true);

  const [reviewStats, setReviewStats] =
    useState<Record<string, ReviewStats>>({});

  const [search, setSearch] = useState("");

  const [customerName, setCustomerName] =
    useState("Customer");

  const [activeBooking, setActiveBooking] =
    useState<Booking | null>(null);

  const services = [
    {
      name: "Plumbing",
      icon: "wrench",
      description: "Leaks, Taps, Pipe Fitting",
      price: "From LKR 2,500",
      iconBackground: "#E0E7FF",
      iconColor: "#2563EB",
    },
    {
      name: "Electrical",
      icon: "flash",
      description: "Wiring, Fans, Breakers",
      price: "From LKR 3,000",
      iconBackground: "#FFEDD5",
      iconColor: "#B45309",
    },
    {
      name: "Cleaning",
      icon: "broom",
      description: "Deep, Sofa, Water Tank",
      price: "From LKR 4,500",
      iconBackground: "#D1FAE5",
      iconColor: "#059669",
    },
    {
      name: "AC Service",
      icon: "fan",
      description: "Gas Refill, Overhaul",
      price: "From LKR 3,500",
      iconBackground: "#DBEAFE",
      iconColor: "#2563EB",
    },
    {
      name: "Painting",
      icon: "format-paint",
      description: "Interior, Waterproofing",
      price: "From LKR 2,500",
      iconBackground: "#EDE9FE",
      iconColor: "#4338CA",
    },
    {
      name: "Carpentry",
      icon: "hammer-wrench",
      description: "Repairs, Furniture & More",
      price: "From LKR 2,500",
      iconBackground: "#E2E8F0",
      iconColor: "#475569",
    },
  ];

  const popular = [
    "Emergency Leak",
    "AC Service",
    "Deep Cleaning",
  ];

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    const loadCustomer = async () => {
      try {
        const customerDoc = await getDoc(
          doc(db, "users", user.uid)
        );

        if (customerDoc.exists()) {
          const data = customerDoc.data();

          setCustomerName(
            data.name || "Customer"
          );
        }
      } catch (error) {
        console.log(
          "Customer profile load error:",
          error
        );
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

    const unsubscribeProviders =
      onSnapshot(
        providersQuery,
        (snapshot) => {
          const loaded: Provider[] =
            snapshot.docs
              .map((providerDoc) => ({
                id: providerDoc.id,
                ...providerDoc.data(),
              }))
              .filter(
                (provider: any) =>
                  provider.accountStatus !==
                  "disabled"
              ) as Provider[];

          setProviders(loaded);
          setLoadingProviders(false);
        },
        (error) => {
          console.log(
            "Providers loading error:",
            error
          );

          setLoadingProviders(false);
        }
      );

    /*
      REAL REVIEWS
      Calculate rating + review count
      directly from reviews collection.
    */

    const unsubscribeReviews =
      onSnapshot(
        collection(db, "reviews"),
        (snapshot) => {
          const totals: Record<
            string,
            {
              total: number;
              count: number;
            }
          > = {};

          snapshot.docs.forEach(
            (reviewDoc) => {
              const data =
                reviewDoc.data();

              const providerId =
                data.providerId;

              if (!providerId) {
                return;
              }

              if (!totals[providerId]) {
                totals[providerId] = {
                  total: 0,
                  count: 0,
                };
              }

              totals[providerId].total +=
                Number(data.rating || 0);

              totals[providerId].count += 1;
            }
          );

          const calculatedStats: Record<
            string,
            ReviewStats
          > = {};

          Object.keys(totals).forEach(
            (providerId) => {
              const providerTotal =
                totals[providerId];

              calculatedStats[
                providerId
              ] = {
                rating:
                  providerTotal.count >
                  0
                    ? providerTotal.total /
                      providerTotal.count
                    : 0,

                count:
                  providerTotal.count,
              };
            }
          );

          setReviewStats(
            calculatedStats
          );
        },
        (error) => {
          console.log(
            "Home reviews loading error:",
            error
          );
        }
      );

    /*
      CUSTOMER ACTIVE BOOKING
    */

    const bookingQuery = query(
      collection(db, "bookings"),
      where(
        "customerId",
        "==",
        user.uid
      )
    );

    const unsubscribeBookings =
      onSnapshot(
        bookingQuery,
        (snapshot) => {
          const bookings: Booking[] =
            snapshot.docs.map(
              (bookingDoc) => ({
                id: bookingDoc.id,
                ...bookingDoc.data(),
              })
            ) as Booking[];

          const current =
            bookings.find(
              (booking) =>
                booking.status ===
                  "confirmed" ||
                booking.status ===
                  "in_progress"
            ) || null;

          setActiveBooking(current);
        },
        (error) => {
          console.log(
            "Home active booking error:",
            error
          );
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

  const openProvider = (
    provider: Provider
  ) => {
    const rating =
      reviewStats[provider.id]
        ?.rating ??
      provider.rating ??
      0;

    const reviews =
      reviewStats[provider.id]
        ?.count ??
      provider.reviewCount ??
      0;

    const price =
      provider.price ?? 2500;

    router.push({
      pathname: "/provider-profile",

      params: {
        providerId: provider.id,

        name:
          provider.name ||
          "Service Provider",

        service:
          provider.category ||
          "Home Service",

        category:
          provider.category || "",

        district:
          provider.district || "",

        email:
          provider.email || "",

        phone:
          provider.phone || "",

        rating: String(rating),

        reviews: String(reviews),

        experience:
          provider.experience ||
          "New provider",

        price: String(price),

        verified:
          provider.verificationStatus ===
          "approved"
            ? "true"
            : "false",
      },
    });
  };

  const handleSearch = () => {
    const value = search.trim();

    router.push({
      pathname: "/providers",

      params: {
        service:
          value ||
          "Service Providers",
      },
    });
  };

  /*
    SORT TOP PROVIDERS USING
    REAL REVIEW RATINGS
  */

  const topProviders = [
    ...providers,
  ]
    .sort((a, b) => {
      const ratingA =
        reviewStats[a.id]?.rating ??
        a.rating ??
        0;

      const ratingB =
        reviewStats[b.id]?.rating ??
        b.rating ??
        0;

      return ratingB - ratingA;
    })
    .slice(0, 2);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View
            style={styles.brandArea}
          >
            <View
              style={styles.logoBox}
            >
              <Text
                style={styles.logoLetter}
              >
                F
              </Text>
            </View>

            <Text
              style={styles.logoText}
            >
              FIXORA
            </Text>

            <View
              style={styles.logoDot}
            />
          </View>

          <View
            style={
              styles.headerLocation
            }
          >
            <View
              style={styles.locationTop}
            >
              <Ionicons
                name="location"
                size={16}
                color="#0D47C7"
              />

              <Text
                style={
                  styles.headerLocationText
                }
              >
                Service Area
              </Text>

              <Ionicons
                name="chevron-down"
                size={14}
                color="#475569"
              />
            </View>

            <Text
              style={styles.activePros}
            >
              ● Pros Active
            </Text>
          </View>

          <View
            style={
              styles.headerActions
            }
          >
            <TouchableOpacity
              style={
                styles.notificationButton
              }
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#0F172A"
              />

              <View
                style={
                  styles.notificationDot
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.profileCircle
              }
              onPress={() =>
                router.push(
                  "/customer-profile"
                )
              }
            >
              <Text
                style={
                  styles.profileEmoji
                }
              >
                👤
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AREA */}

        <View style={styles.areaRow}>
          <TouchableOpacity
            style={
              styles.areaSelector
            }
          >
            <Ionicons
              name="navigate"
              size={17}
              color="#0D47C7"
            />

            <Text
              style={styles.areaText}
            >
              Nearby Service Area
            </Text>

            <Ionicons
              name="chevron-down"
              size={15}
              color="#475569"
            />
          </TouchableOpacity>

          <View
            style={
              styles.dispatchBadge
            }
          >
            <Ionicons
              name="flash"
              size={15}
              color="#065F46"
            />

            <Text
              style={
                styles.dispatchText
              }
            >
              Fast Dispatch
            </Text>
          </View>
        </View>

        {/* SEARCH */}

        <View
          style={styles.searchBox}
        >
          <Ionicons
            name="search"
            size={21}
            color="#64748B"
          />

          <TextInput
            style={
              styles.searchInput
            }
            placeholder="Search plumbing, AC repair, cleaning..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={
              handleSearch
            }
          />

          <Ionicons
            name="mic-outline"
            size={20}
            color="#475569"
          />

          <TouchableOpacity
            style={
              styles.filterButton
            }
            onPress={handleSearch}
          >
            <Ionicons
              name="options"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View
          style={styles.popularRow}
        >
          <Text
            style={
              styles.popularLabel
            }
          >
            Popular:
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >
            {popular.map((item) => (
              <TouchableOpacity
                key={item}
                style={
                  styles.popularChip
                }
                onPress={() =>
                  router.push({
                    pathname:
                      "/providers",

                    params: {
                      service: item,
                    },
                  })
                }
              >
                <Text
                  style={
                    styles.popularChipText
                  }
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ACTIVE BOOKING */}

        {activeBooking && (
          <TouchableOpacity
            style={
              styles.activeBookingCard
            }
            onPress={() =>
              router.push({
                pathname:
                  "/booking-details",

                params: {
                  bookingId:
                    activeBooking.id,
                },
              })
            }
          >
            <View
              style={
                styles.activeBookingIcon
              }
            >
              <Text
                style={
                  styles.activeBookingEmoji
                }
              >
                👨‍🔧
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={
                  styles.bookingMeta
                }
              >
                <View
                  style={
                    styles.confirmedPill
                  }
                >
                  <Text
                    style={
                      styles.confirmedPillText
                    }
                  >
                    {activeBooking.status ===
                    "in_progress"
                      ? "IN PROGRESS"
                      : "CONFIRMED"}
                  </Text>
                </View>

                <Text
                  style={
                    styles.bookingDateText
                  }
                >
                  {activeBooking.date
                    ? `Oct ${activeBooking.date}`
                    : ""}
                </Text>
              </View>

              <Text
                style={
                  styles.activeBookingTitle
                }
              >
                {activeBooking.service ||
                  "Home Service"}
              </Text>

              <Text
                style={
                  styles.activeBookingProvider
                }
              >
                with{" "}
                {activeBooking.providerName ||
                  "your provider"}
              </Text>
            </View>

            <View
              style={
                styles.trackButton
              }
            >
              <Text
                style={
                  styles.trackButtonText
                }
              >
                View
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#0D47C7"
              />
            </View>
          </TouchableOpacity>
        )}

        {/* PROMO */}

        <ImageBackground
          source={require("../../assets/images/monsoon-banner.png")}
          style={styles.promoCard}
          imageStyle={
            styles.promoImage
          }
        >
          <View
            style={
              styles.promoOverlay
            }
          >
            <View
              style={
                styles.promoBadge
              }
            >
              <Ionicons
                name="flash"
                size={14}
                color="#78350F"
              />

              <Text
                style={
                  styles.promoBadgeText
                }
              >
                Monsoon Special
              </Text>
            </View>

            <Text
              style={
                styles.promoTitle
              }
            >
              Monsoon Ready Homes 🌧️
            </Text>

            <Text
              style={
                styles.promoText
              }
            >
              Get professional
              waterproofing, plumbing and
              home maintenance services.
            </Text>

            <View
              style={
                styles.promoBottom
              }
            >
              <View
                style={
                  styles.verifiedPromo
                }
              >
                <Ionicons
                  name="shield-checkmark"
                  size={17}
                  color="#22C55E"
                />

                <Text
                  style={
                    styles.verifiedPromoText
                  }
                >
                  Verified Fixora Pros
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.claimButton
                }
                onPress={() =>
                  router.push(
                    "/services"
                  )
                }
              >
                <Text
                  style={
                    styles.claimButtonText
                  }
                >
                  Explore
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* SERVICES */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Explore Services
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Top-rated pros at upfront
              LKR pricing
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push("/services")
            }
          >
            <Text
              style={styles.viewAll}
            >
              View All ›
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.servicesGrid
          }
        >
          {services.map(
            (service) => (
              <TouchableOpacity
                key={service.name}
                style={
                  styles.serviceCard
                }
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname:
                      "/providers",

                    params: {
                      service:
                        service.name,
                    },
                  })
                }
              >
                <View
                  style={
                    styles.serviceTop
                  }
                >
                  <View
                    style={[
                      styles.serviceIconBox,
                      {
                        backgroundColor:
                          service.iconBackground,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        service.icon as any
                      }
                      size={25}
                      color={
                        service.iconColor
                      }
                    />
                  </View>

                  <Ionicons
                    name="arrow-up-outline"
                    size={17}
                    color="#64748B"
                    style={{
                      transform: [
                        {
                          rotate:
                            "45deg",
                        },
                      ],
                    }}
                  />
                </View>

                <Text
                  style={
                    styles.serviceName
                  }
                >
                  {service.name}
                </Text>

                <Text
                  style={
                    styles.serviceDescription
                  }
                >
                  {service.description}
                </Text>

                <Text
                  style={
                    styles.servicePrice
                  }
                >
                  {service.price}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* TRUST */}

        <View
          style={styles.trustStrip}
        >
          <View
            style={styles.trustItem}
          >
            <Ionicons
              name="shield-checkmark"
              size={16}
              color="#0D47C7"
            />

            <Text
              style={
                styles.trustText
              }
            >
              Vetted
            </Text>
          </View>

          <View
            style={
              styles.trustDivider
            }
          />

          <View
            style={styles.trustItem}
          >
            <Ionicons
              name="flash"
              size={16}
              color="#D97706"
            />

            <Text
              style={
                styles.trustText
              }
            >
              Transparent LKR
            </Text>
          </View>

          <View
            style={
              styles.trustDivider
            }
          />

          <View
            style={styles.trustItem}
          >
            <Ionicons
              name="shield"
              size={16}
              color="#047857"
            />

            <Text
              style={
                styles.trustText
              }
            >
              Secure
            </Text>
          </View>
        </View>

        {/* PROVIDERS */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Top-Rated Pros Nearby
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Available for service
              bookings
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/providers"
              )
            }
          >
            <Text
              style={styles.viewAll}
            >
              Sort & Filter
            </Text>
          </TouchableOpacity>
        </View>

        {loadingProviders ? (
          <View
            style={
              styles.loadingProviders
            }
          >
            <ActivityIndicator
              color="#0D47C7"
            />
          </View>
        ) : (
          <View
            style={
              styles.providerList
            }
          >
            {topProviders.map(
              (provider) => {
                const price =
                  provider.price ??
                  2500;

                const rating =
                  reviewStats[
                    provider.id
                  ]?.rating ??
                  provider.rating ??
                  0;

                const reviews =
                  reviewStats[
                    provider.id
                  ]?.count ??
                  provider.reviewCount ??
                  0;

                return (
                  <TouchableOpacity
                    key={
                      provider.id
                    }
                    style={
                      styles.providerCard
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      openProvider(
                        provider
                      )
                    }
                  >
                    <View
                      style={
                        styles.providerCardTop
                      }
                    >
                      <View
                        style={
                          styles.providerAvatar
                        }
                      >
                        <Text
                          style={
                            styles.providerAvatarText
                          }
                        >
                          👨‍🔧
                        </Text>

                        {provider.verificationStatus ===
                          "approved" && (
                          <View
                            style={
                              styles.providerVerified
                            }
                          >
                            <Ionicons
                              name="checkmark"
                              size={
                                10
                              }
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </View>

                      <View
                        style={
                          styles.providerDetails
                        }
                      >
                        <Text
                          style={
                            styles.providerName
                          }
                        >
                          {provider.name ||
                            "Service Provider"}
                        </Text>

                        <Text
                          style={
                            styles.providerCategory
                          }
                        >
                          {provider.category ||
                            "Home Services"}
                        </Text>

                        <View
                          style={
                            styles.ratingRow
                          }
                        >
                          <View
                            style={
                              styles.ratingBadge
                            }
                          >
                            <Text
                              style={
                                styles.ratingText
                              }
                            >
                              ⭐{" "}
                              {rating >
                              0
                                ? rating.toFixed(
                                    1
                                  )
                                : "New"}
                            </Text>
                          </View>

                          <Text
                            style={
                              styles.reviewText
                            }
                          >
                            (
                            {
                              reviews
                            }{" "}
                            reviews)
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.distanceBadge
                        }
                      >
                        <Text
                          style={
                            styles.distanceText
                          }
                        >
                          Nearby
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.providerDivider
                      }
                    />

                    <View
                      style={
                        styles.providerBottom
                      }
                    >
                      <View>
                        <Text
                          style={
                            styles.rateLabel
                          }
                        >
                          Starting
                          Rate
                        </Text>

                        <Text
                          style={
                            styles.rateValue
                          }
                        >
                          Rs.{" "}
                          {Number(
                            price
                          ).toLocaleString()}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={
                          styles.bookButton
                        }
                        onPress={() =>
                          openProvider(
                            provider
                          )
                        }
                      >
                        <Text
                          style={
                            styles.bookButtonText
                          }
                        >
                          Book Pro
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          size={17}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        )}

        {/* COVERAGE */}

        <View
          style={
            styles.coverageCard
          }
        >
          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.coverageSmall
              }
            >
              FAST DISPATCH NETWORK
            </Text>

            <Text
              style={
                styles.coverageTitle
              }
            >
              Fixora Service Network
            </Text>

            <Text
              style={
                styles.coverageText
              }
            >
              Find verified service
              providers and book trusted
              professionals through
              Fixora.
            </Text>
          </View>

          <View
            style={
              styles.coverageIconBox
            }
          >
            <Ionicons
              name="map-outline"
              size={34}
              color="#0D47C7"
            />
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
    backgroundColor: "#F8F9FF",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandArea: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#0D47C7",
    alignItems: "center",
    justifyContent: "center",
  },

  logoLetter: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  logoText: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },

  logoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 4,
    backgroundColor: "#2563EB",
  },

  headerLocation: {
    flex: 1,
    marginLeft: 20,
  },

  locationTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  headerLocationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  activePros: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
    color: "#047857",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  notificationButton: {
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    right: -1,
    top: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#DC2626",
  },

  profileCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  profileEmoji: {
    fontSize: 20,
  },

  areaRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
  },

  areaSelector: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "#F1F5FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 7,
  },

  areaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },

  dispatchBadge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#A7F3D0",
  },

  dispatchText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#065F46",
  },

  searchBox: {
    marginTop: 20,
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 14,
    fontSize: 13,
    color: "#0F172A",
  },

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#0D47C7",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },

  popularRow: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  popularLabel: {
    marginRight: 7,
    fontSize: 10,
    color: "#64748B",
  },

  popularChip: {
    marginRight: 7,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  popularChipText: {
    fontSize: 9,
    color: "#334155",
  },

  activeBookingCard: {
    marginTop: 18,
    padding: 15,
    borderRadius: 19,
    backgroundColor: "#1253D8",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0D47C7",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  activeBookingIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  activeBookingEmoji: {
    fontSize: 27,
  },

  bookingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  confirmedPill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  confirmedPillText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  bookingDateText: {
    fontSize: 9,
    color: "#DBEAFE",
  },

  activeBookingTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  activeBookingProvider: {
    marginTop: 2,
    fontSize: 11,
    color: "#DBEAFE",
  },

  trackButton: {
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  trackButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0D47C7",
  },

  promoCard: {
    marginTop: 18,
    height: 190,
    borderRadius: 11,
    overflow: "hidden",
  },

  promoImage: {
    borderRadius: 11,
  },

  promoOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(8, 18, 45, 0.38)",
  },

  promoBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#FBBF24",
  },

  promoBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#78350F",
  },

  promoTitle: {
    marginTop: 15,
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  promoText: {
    marginTop: 5,
    maxWidth: "90%",
    fontSize: 12,
    lineHeight: 18,
    color: "#CBD5E1",
  },

  promoBottom: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  verifiedPromo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  verifiedPromoText: {
    fontSize: 10,
    color: "#E2E8F0",
  },

  claimButton: {
    backgroundColor: "#0D47C7",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },

  claimButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#172033",
  },

  sectionSubtitle: {
    marginTop: 1,
    fontSize: 10,
    color: "#64748B",
  },

  viewAll: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D47C7",
  },

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  serviceCard: {
    width: "48.5%",
    minHeight: 145,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 1,
  },

  serviceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  serviceIconBox: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  serviceName: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "800",
    color: "#172033",
  },

  serviceDescription: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
  },

  servicePrice: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "800",
    color: "#0D47C7",
  },

  trustStrip: {
    marginTop: 15,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5FF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  trustText: {
    fontSize: 9,
    color: "#334155",
  },

  trustDivider: {
    height: 18,
    width: 1,
    backgroundColor: "#CBD5E1",
  },

  loadingProviders: {
    paddingVertical: 25,
  },

  providerList: {
    gap: 12,
  },

  providerCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  providerCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  providerAvatarText: {
    fontSize: 26,
  },

  providerVerified: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#059669",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  providerDetails: {
    flex: 1,
    marginLeft: 12,
  },

  providerName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#172033",
  },

  providerCategory: {
    marginTop: 2,
    fontSize: 10,
    color: "#64748B",
  },

  ratingRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  ratingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },

  ratingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400E",
  },

  reviewText: {
    fontSize: 9,
    color: "#64748B",
  },

  distanceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  distanceText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  providerDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },

  providerBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rateLabel: {
    fontSize: 9,
    color: "#64748B",
  },

  rateValue: {
    marginTop: 1,
    fontSize: 16,
    fontWeight: "900",
    color: "#172033",
  },

  bookButton: {
    minWidth: 105,
    backgroundColor: "#0D47C7",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  bookButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  coverageCard: {
    marginTop: 24,
    marginBottom: 5,
    minHeight: 150,
    borderRadius: 18,
    padding: 18,
    backgroundColor: "#E8EDFF",
    flexDirection: "row",
    alignItems: "center",
  },

  coverageSmall: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0D47C7",
  },

  coverageTitle: {
    marginTop: 5,
    maxWidth: 190,
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "800",
    color: "#172033",
  },

  coverageText: {
    marginTop: 6,
    maxWidth: 210,
    fontSize: 10,
    lineHeight: 15,
    color: "#64748B",
  },

  coverageIconBox: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#D5DEFF",
    alignItems: "center",
    justifyContent: "center",
  },
});