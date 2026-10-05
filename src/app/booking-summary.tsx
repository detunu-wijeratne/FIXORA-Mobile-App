import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";

export default function BookingSummaryScreen() {
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

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
      : "No description provided";

  const address =
    typeof params.address === "string"
      ? params.address
      : "Address not provided";

  /*
    Real Cloudinary HTTPS image URL
  */
  const imageUrl =
    typeof params.imageUrl === "string"
      ? params.imageUrl
      : "";

  const numericPrice =
    Number(price.replace(/\D/g, "")) || 0;

  const platformFee = 250;

  const totalAmount =
    numericPrice + platformFee;

  const handleConfirm = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert(
        "Please log in as a customer before booking."
      );

      router.replace(
        "/customer-login"
      );

      return;
    }

    try {
      setLoading(true);

      /*
        Get customer details
      */

      const customerDoc =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );

      let customerName =
        "Customer";

      let customerPhone = "";

      if (customerDoc.exists()) {
        const customerData =
          customerDoc.data();

        customerName =
          customerData.name ||
          "Customer";

        customerPhone =
          customerData.phone ||
          "";
      }

      /*
        Create real booking in Firestore.

        imageUrl is now a real Cloudinary
        HTTPS URL, so it is safe to save
        in Firestore and can be used from
        another device.
      */

      const bookingRef =
        await addDoc(
          collection(
            db,
            "bookings"
          ),
          {
            customerId:
              user.uid,

            customerName,

            customerPhone,

            customerEmail:
              user.email || "",

            providerId:
              providerId || null,

            providerName:
              name,

            service,

            date,

            time,

            description,

            address,

            servicePrice:
              numericPrice,

            platformFee,

            totalAmount,

            /*
              Real cloud image URL
            */
            imageUrl:
              imageUrl || "",

            hasPhotoAttachment:
              Boolean(imageUrl),

            status:
              "pending",

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

      console.log(
        "Booking created:",
        bookingRef.id
      );

      console.log(
        "Booking image URL:",
        imageUrl
      );

      /*
        Pass image URL to confirmation too.
      */

      router.replace({
        pathname:
          "/booking-confirmation",

        params: {
          bookingId:
            bookingRef.id,

          name,

          service,

          price,

          date,

          time,

          description,

          address,

          imageUrl,
        },
      });
    } catch (error: any) {
      console.log(
        "Booking creation error:",
        error
      );

      alert(
        error.message ||
          "Unable to create booking."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text style={styles.title}>
          Review your booking
        </Text>

        <Text style={styles.subtitle}>
          Check the details below before
          confirming your service.
        </Text>

        {/* PROVIDER */}

        <View
          style={styles.providerCard}
        >
          <View style={styles.avatar}>
            <Text
              style={styles.avatarText}
            >
              👨‍🔧
            </Text>
          </View>

          <View
            style={styles.providerInfo}
          >
            <Text
              style={styles.providerName}
            >
              {name}
            </Text>

            <Text
              style={styles.providerService}
            >
              {service}
            </Text>

            <Text
              style={styles.verified}
            >
              ✓ Verified Provider
            </Text>
          </View>
        </View>

        {/* BOOKING DETAILS */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Booking Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Service
            </Text>

            <Text style={styles.value}>
              {service}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Date
            </Text>

            <Text style={styles.value}>
              October {date}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Time
            </Text>

            <Text style={styles.value}>
              {time}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Starting Price
            </Text>

            <Text style={styles.value}>
              Rs.{" "}
              {numericPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* LOCATION */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Service Location
          </Text>

          <View style={styles.infoBox}>
            <Text
              style={styles.infoIcon}
            >
              📍
            </Text>

            <Text
              style={styles.infoText}
            >
              {address}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Problem Description
          </Text>

          <View
            style={styles.descriptionBox}
          >
            <Text
              style={
                styles.descriptionText
              }
            >
              {description ||
                "No description provided."}
            </Text>
          </View>
        </View>

        {/* PHOTO */}

        {imageUrl && (
          <View style={styles.section}>
            <Text
              style={styles.sectionTitle}
            >
              Attached Photo
            </Text>

            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.jobPhoto}
              resizeMode="cover"
              onLoad={() => {
                console.log(
                  "Cloudinary image loaded"
                );
              }}
              onError={(event) => {
                console.log(
                  "Cloudinary image error:",
                  event.nativeEvent.error
                );
              }}
            />

            <View
              style={styles.photoStatus}
            >
              <Text
                style={
                  styles.photoStatusIcon
                }
              >
                ✓
              </Text>

              <Text
                style={
                  styles.photoStatusText
                }
              >
                Photo uploaded successfully
              </Text>
            </View>
          </View>
        )}

        {/* PRICE */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Price Summary
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Estimated service charge
            </Text>

            <Text style={styles.value}>
              Rs.{" "}
              {numericPrice.toLocaleString()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Platform fee
            </Text>

            <Text style={styles.value}>
              Rs. 250
            </Text>
          </View>

          <View
            style={styles.divider}
          />

          <View style={styles.row}>
            <Text
              style={styles.totalLabel}
            >
              Estimated Total
            </Text>

            <Text
              style={styles.totalValue}
            >
              Rs.{" "}
              {totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* NOTE */}

        <View style={styles.noteBox}>
          <Text
            style={styles.noteTitle}
          >
            Note
          </Text>

          <Text
            style={styles.noteText}
          >
            The final service price may
            change depending on the actual
            work required. The provider can
            confirm the final amount before
            work begins.
          </Text>
        </View>
      </ScrollView>

      {/* CONFIRM BUTTON */}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            loading &&
              styles.disabledButton,
          ]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text
            style={
              styles.confirmButtonText
            }
          >
            {loading
              ? "Creating Booking..."
              : "Confirm Booking"}
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

  providerCard: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 28,
  },

  providerInfo: {
    marginLeft: 14,
  },

  providerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  providerService: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  verified: {
    marginTop: 5,
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
  },

  section: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  label: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
  },

  value: {
    maxWidth: "55%",
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  descriptionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
  },

  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  jobPhoto: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
  },

  photoStatus: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  photoStatusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: "center",
    lineHeight: 20,
    backgroundColor: "#DCFCE7",
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 7,
  },

  photoStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginTop: 16,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },

  noteBox: {
    marginTop: 18,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 15,
  },

  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  noteText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
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

  confirmButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});