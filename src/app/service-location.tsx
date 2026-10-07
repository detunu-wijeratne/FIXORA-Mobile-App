import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { collection, onSnapshot } from "firebase/firestore";

import { useEffect, useState } from "react";

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

import BookingProgress from "../components/BookingProgress";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import PrimaryButton from "../components/PrimaryButton";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

type SavedLocation = {
  id: string;
  label?: string;
  address?: string;
};

export default function ServiceLocationScreen() {
  const params = useLocalSearchParams();

  const providerId =
    typeof params.providerId === "string" ? params.providerId : "";

  const name =
    typeof params.name === "string" ? params.name : "Service Provider";

  const service =
    typeof params.service === "string" ? params.service : "Home Service";

  const price = typeof params.price === "string" ? params.price : "2500";

  const date = typeof params.date === "string" ? params.date : "5";

  const time = typeof params.time === "string" ? params.time : "9:30 AM";

  const description =
    typeof params.description === "string" ? params.description : "";

  /*
    Real Cloudinary image URL.
    Example:
    https://res.cloudinary.com/.../image/upload/...
  */
  const imageUrl =
    typeof params.imageUrl === "string" ? params.imageUrl : "";

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [address, setAddress] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    const locationsRef = collection(db, "users", user.uid, "locations");

    const unsubscribe = onSnapshot(
      locationsRef,
      (snapshot) => {
        const locations: SavedLocation[] = snapshot.docs.map(
          (locationDoc) => ({
            id: locationDoc.id,
            ...locationDoc.data(),
          })
        ) as SavedLocation[];

        setSavedLocations(locations);

        if (locations.length > 0 && !selectedLocation) {
          setSelectedLocation(locations[0].id);
          setAddress(locations[0].address || "");
        }

        setLoadingLocations(false);
      },
      (error) => {
        console.log("Saved locations error:", error);
        setLoadingLocations(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const selectSavedLocation = (location: SavedLocation) => {
    setSelectedLocation(location.id);
    setAddress(location.address || "");
  };

  const handleContinue = () => {
    if (!address.trim()) {
      alert("Please enter a service address.");
      return;
    }

    router.push({
      pathname: "/booking-summary",
      params: {
        providerId,
        name,
        service,
        price,
        date,
        time,
        description,
        address: address.trim(),

        /*
          Pass Cloudinary URL forward.
        */
        imageUrl,
      },
    });
  };

  const getLocationIcon = (label?: string) => {
    const value = label?.toLowerCase() || "";

    if (value.includes("work")) {
      return "business-outline" as const;
    }

    if (value.includes("home")) {
      return "home-outline" as const;
    }

    return "location-outline" as const;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BookingProgress currentStep={3} />

        <Image
          source={require("../../assets/images/booking-location-hero.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.title}>Where do you need the service?</Text>

        <Text style={styles.subtitle}>
          We'll match your booking with the selected location.
        </Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Locations</Text>

          <TouchableOpacity onPress={() => router.push("/saved-locations")}>
            <Text style={styles.manageLink}>Manage</Text>
          </TouchableOpacity>
        </View>

        {loadingLocations ? (
          <LoadingState label="Loading saved locations..." />
        ) : savedLocations.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <EmptyState
              icon="location-outline"
              title="No saved locations"
              description="You can enter an address below or add a saved location."
            />

            <PrimaryButton
              title="Add Saved Location"
              onPress={() => router.push("/saved-locations")}
              style={styles.addLocationButton}
            />
          </View>
        ) : (
          savedLocations.map((location) => {
            const selected = selectedLocation === location.id;

            return (
              <TouchableOpacity
                key={location.id}
                style={[styles.locationCard, selected && styles.selectedCard]}
                onPress={() => selectSavedLocation(location)}
              >
                <View style={styles.iconBox}>
                  <Ionicons
                    name={getLocationIcon(location.label)}
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.locationInfo}>
                  <Text style={styles.locationTitle}>
                    {location.label || "Saved Location"}
                  </Text>

                  <Text style={styles.locationAddress}>
                    {location.address || "Address not added"}
                  </Text>
                </View>

                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                ) : (
                  <View style={styles.radio} />
                )}
              </TouchableOpacity>
            );
          })
        )}

        <Text style={styles.sectionTitle}>Service Address</Text>

        <TextInput
          style={styles.addressInput}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Enter the service address"
          placeholderTextColor={colors.textMuted}
          value={address}
          onChangeText={(value) => {
            setSelectedLocation("custom");
            setAddress(value);
          }}
        />

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Location privacy</Text>

          <Text style={styles.noteText}>
            Your service address will only be shared with the assigned
            provider for this booking.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <PrimaryButton
          title="Continue"
          icon="arrow-forward"
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 120,
  },

  heroImage: {
    width: "100%",
    height: 110,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },

  title: {
    ...typography.pageTitle,
    fontSize: 24,
    marginTop: spacing.lg,
  },

  subtitle: {
    ...typography.secondary,
    marginTop: spacing.sm,
  },

  sectionHeader: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    ...typography.sectionHeading,
    fontSize: 17,
    marginTop: spacing.xxl,
  },

  manageLink: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  emptyWrapper: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  addLocationButton: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md + 3,
    marginBottom: spacing.md,
  },

  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  locationInfo: {
    flex: 1,
    marginLeft: spacing.md + 1,
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  locationAddress: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },

  addressInput: {
    minHeight: 110,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },

  noteBox: {
    marginTop: spacing.xl,
    padding: spacing.lg - 1,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  noteText: {
    marginTop: spacing.xs + 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
});
