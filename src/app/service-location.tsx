import { router, useLocalSearchParams } from "expo-router";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";

type SavedLocation = {
  id: string;
  label?: string;
  address?: string;
};

export default function ServiceLocationScreen() {
  const params = useLocalSearchParams();

  const providerId =
    typeof params.providerId === "string"
      ? params.providerId
      : "";

  const name =
    typeof params.name === "string"
      ? params.name
      : "Service Provider";

  const service =
    typeof params.service === "string"
      ? params.service
      : "Home Service";

  const price =
    typeof params.price === "string"
      ? params.price
      : "2500";

  const date =
    typeof params.date === "string"
      ? params.date
      : "5";

  const time =
    typeof params.time === "string"
      ? params.time
      : "9:30 AM";

  const description =
    typeof params.description === "string"
      ? params.description
      : "";

  /*
    Real Cloudinary image URL.
    Example:
    https://res.cloudinary.com/.../image/upload/...
  */
  const imageUrl =
    typeof params.imageUrl === "string"
      ? params.imageUrl
      : "";

  const [savedLocations, setSavedLocations] =
    useState<SavedLocation[]>([]);

  const [selectedLocation, setSelectedLocation] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [loadingLocations, setLoadingLocations] =
    useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    const locationsRef = collection(
      db,
      "users",
      user.uid,
      "locations"
    );

    const unsubscribe = onSnapshot(
      locationsRef,
      (snapshot) => {
        const locations: SavedLocation[] =
          snapshot.docs.map((locationDoc) => ({
            id: locationDoc.id,
            ...locationDoc.data(),
          })) as SavedLocation[];

        setSavedLocations(locations);

        if (
          locations.length > 0 &&
          !selectedLocation
        ) {
          setSelectedLocation(
            locations[0].id
          );

          setAddress(
            locations[0].address || ""
          );
        }

        setLoadingLocations(false);
      },
      (error) => {
        console.log(
          "Saved locations error:",
          error
        );

        setLoadingLocations(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const selectSavedLocation = (
    location: SavedLocation
  ) => {
    setSelectedLocation(location.id);

    setAddress(
      location.address || ""
    );
  };

  const handleContinue = () => {
    if (!address.trim()) {
      alert(
        "Please enter a service address."
      );

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

  const getLocationIcon = (
    label?: string
  ) => {
    const value =
      label?.toLowerCase() || "";

    if (value.includes("work")) {
      return "🏢";
    }

    if (value.includes("home")) {
      return "🏠";
    }

    return "📍";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text style={styles.title}>
          Where do you need the service?
        </Text>

        <Text style={styles.subtitle}>
          Select a saved location or enter a new address.
        </Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Saved Locations
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/saved-locations"
              )
            }
          >
            <Text style={styles.manageLink}>
              Manage
            </Text>
          </TouchableOpacity>
        </View>

        {loadingLocations ? (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <Text
              style={styles.loadingText}
            >
              Loading saved locations...
            </Text>
          </View>
        ) : savedLocations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              📍
            </Text>

            <Text style={styles.emptyTitle}>
              No saved locations
            </Text>

            <Text style={styles.emptyText}>
              You can enter an address below or
              add a saved location.
            </Text>

            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={() =>
                router.push(
                  "/saved-locations"
                )
              }
            >
              <Text
                style={
                  styles.addLocationButtonText
                }
              >
                Add Saved Location
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedLocations.map(
            (location) => {
              const selected =
                selectedLocation ===
                location.id;

              return (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationCard,
                    selected &&
                      styles.selectedCard,
                  ]}
                  onPress={() =>
                    selectSavedLocation(
                      location
                    )
                  }
                >
                  <View
                    style={styles.iconBox}
                  >
                    <Text
                      style={styles.icon}
                    >
                      {getLocationIcon(
                        location.label
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.locationInfo
                    }
                  >
                    <Text
                      style={
                        styles.locationTitle
                      }
                    >
                      {location.label ||
                        "Saved Location"}
                    </Text>

                    <Text
                      style={
                        styles.locationAddress
                      }
                    >
                      {location.address ||
                        "Address not added"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      selected &&
                        styles.radioSelected,
                    ]}
                  >
                    {selected && (
                      <View
                        style={
                          styles.radioDot
                        }
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }
          )
        )}

        <Text style={styles.sectionTitle}>
          Service Address
        </Text>

        <TextInput
          style={styles.addressInput}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Enter the service address"
          placeholderTextColor="#94A3B8"
          value={address}
          onChangeText={(value) => {
            setSelectedLocation(
              "custom"
            );

            setAddress(value);
          }}
        />

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>
            Location privacy
          </Text>

          <Text style={styles.noteText}>
            Your service address will only
            be shared with the assigned
            provider for this booking.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text
            style={
              styles.continueButtonText
            }
          >
            Continue to Summary
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  manageLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 22,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
  },

  addLocationButton: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addLocationButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
  },

  selectedCard: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 22,
  },

  locationInfo: {
    flex: 1,
    marginLeft: 13,
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  locationAddress: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: "#2563EB",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },

  addressInput: {
    minHeight: 110,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#0F172A",
  },

  noteBox: {
    marginTop: 22,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
  },

  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  noteText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 16,
  },

  continueButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});