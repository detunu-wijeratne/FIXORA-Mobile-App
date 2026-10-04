import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  const [selectedLocation, setSelectedLocation] =
    useState("home");

  const [address, setAddress] = useState(
    "45, Main Street, Colombo 03"
  );

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
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>
          Where do you need the service?
        </Text>

        <Text style={styles.subtitle}>
          Select a saved location or enter a new address.
        </Text>

        <Text style={styles.sectionTitle}>
          Saved Locations
        </Text>

        <TouchableOpacity
          style={[
            styles.locationCard,
            selectedLocation === "home" &&
              styles.selectedCard,
          ]}
          onPress={() => {
            setSelectedLocation("home");
            setAddress(
              "45, Main Street, Colombo 03"
            );
          }}
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>
              🏠
            </Text>
          </View>

          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>
              Home
            </Text>

            <Text style={styles.locationAddress}>
              45, Main Street, Colombo 03
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedLocation === "home" &&
                styles.radioSelected,
            ]}
          >
            {selectedLocation === "home" && (
              <View style={styles.radioDot} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.locationCard,
            selectedLocation === "work" &&
              styles.selectedCard,
          ]}
          onPress={() => {
            setSelectedLocation("work");
            setAddress(
              "22, Galle Road, Colombo 04"
            );
          }}
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>
              🏢
            </Text>
          </View>

          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>
              Work
            </Text>

            <Text style={styles.locationAddress}>
              22, Galle Road, Colombo 04
            </Text>
          </View>

          <View
            style={[
              styles.radio,
              selectedLocation === "work" &&
                styles.radioSelected,
            ]}
          >
            {selectedLocation === "work" && (
              <View style={styles.radioDot} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={() => {
            setSelectedLocation("current");
            setAddress(
              "Current device location"
            );
          }}
        >
          <Text style={styles.currentLocationIcon}>
            📍
          </Text>

          <View style={styles.currentLocationContent}>
            <Text style={styles.currentLocationTitle}>
              Use Current Location
            </Text>

            <Text style={styles.currentLocationText}>
              Automatically detect your current location
            </Text>
          </View>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

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
            setSelectedLocation("custom");
            setAddress(value);
          }}
        />

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>
            Location privacy
          </Text>

          <Text style={styles.noteText}>
            Your exact location will only be used for this booking.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
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

  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
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

  currentLocationButton: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 15,
  },

  currentLocationIcon: {
    fontSize: 24,
  },

  currentLocationContent: {
    flex: 1,
    marginLeft: 12,
  },

  currentLocationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },

  currentLocationText: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  arrow: {
    fontSize: 28,
    color: "#94A3B8",
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