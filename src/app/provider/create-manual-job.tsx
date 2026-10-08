import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";

import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "../../services/firebase";
import {
    colors,
    radius,
    spacing,
} from "../../theme/provider";

export default function CreateManualJobScreen() {
  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [service, setService] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleCreateJob = async () => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    if (!customerName.trim()) {
      Alert.alert(
        "Missing Customer",
        "Please enter the customer name."
      );
      return;
    }

    if (!service.trim()) {
      Alert.alert(
        "Missing Service",
        "Please enter the service type."
      );
      return;
    }

    if (!date.trim()) {
      Alert.alert(
        "Missing Date",
        "Please enter the job date."
      );
      return;
    }

    if (!time.trim()) {
      Alert.alert(
        "Missing Time",
        "Please enter the job time."
      );
      return;
    }

    const numericPrice =
      Number(
        price.replace(/\D/g, "")
      ) || 0;

    try {
      setLoading(true);

      const providerDoc =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );

      const providerData =
        providerDoc.exists()
          ? providerDoc.data()
          : {};

      const providerName =
        providerData.name ||
        "Service Provider";

      const jobRef =
        await addDoc(
          collection(
            db,
            "bookings"
          ),
          {
            /*
              PROVIDER
            */
            providerId:
              user.uid,

            providerName,

            /*
              CUSTOMER
              Manual jobs may not have
              a FIXORA customer account.
            */
            customerId:
              null,

            customerName:
              customerName.trim(),

            customerPhone:
              customerPhone.trim(),

            customerEmail:
              customerEmail.trim(),

            /*
              JOB
            */
            service:
              service.trim(),

            date:
              date.trim(),

            time:
              time.trim(),

            address:
              address.trim(),

            description:
              description.trim(),

            /*
              PRICE
              No FIXORA platform fee
              for manually entered jobs.
            */
            servicePrice:
              numericPrice,

            platformFee:
              0,

            totalAmount:
              numericPrice,

            /*
              JOB MANAGEMENT
            */
            status:
              "confirmed",

            source:
              "manual",

            createdBy:
              "provider",

            hasPhotoAttachment:
              false,

            imageUrl:
              "",

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

      console.log(
        "Manual job created:",
        jobRef.id
      );

      Alert.alert(
        "Manual Job Added",
        "The job has been added to My Jobs.",
        [
          {
            text: "View Jobs",
            onPress: () =>
              router.replace(
                "/provider/jobs"
              ),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "Create manual job error:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "Unable to create the manual job."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={styles.headerRow}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={
                colors.textPrimary
              }
            />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.eyebrow}>
              FIXORA
            </Text>

            <Text style={styles.title}>
              Add Manual Job
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Add a phone, WhatsApp, walk-in or
          offline service job to your job list.
        </Text>

        {/* CUSTOMER */}

        <View style={styles.section}>
          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={styles.iconBox}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Customer Details
            </Text>
          </View>

          <Text style={styles.label}>
            Customer Name *
          </Text>

          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={
              setCustomerName
            }
            placeholder="Enter customer name"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            style={styles.input}
            value={customerPhone}
            onChangeText={
              setCustomerPhone
            }
            placeholder="07X XXX XXXX"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            value={customerEmail}
            onChangeText={
              setCustomerEmail
            }
            placeholder="customer@email.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* JOB DETAILS */}

        <View style={styles.section}>
          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={styles.iconBox}
            >
              <Ionicons
                name="construct-outline"
                size={18}
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Job Details
            </Text>
          </View>

          <Text style={styles.label}>
            Service *
          </Text>

          <TextInput
            style={styles.input}
            value={service}
            onChangeText={
              setService
            }
            placeholder="Example: Plumbing"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Date *
          </Text>

          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Example: 12 October 2026"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Time *
          </Text>

          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="Example: 10:30 AM"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Service Address
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            value={address}
            onChangeText={
              setAddress
            }
            placeholder="Enter service location"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>
            Problem Description
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            value={description}
            onChangeText={
              setDescription
            }
            placeholder="Describe the work required"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>
            Service Price
          </Text>

          <View
            style={styles.priceInput}
          >
            <Text
              style={
                styles.currencyText
              }
            >
              Rs.
            </Text>

            <TextInput
              style={
                styles.priceTextInput
              }
              value={price}
              onChangeText={setPrice}
              placeholder="2500"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* INFO */}

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />

          <Text style={styles.infoText}>
            Manual jobs are added directly to
            your My Jobs list with a Confirmed
            status. They are marked as MANUAL
            so you can distinguish them from
            customer bookings.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            loading &&
              styles.disabledButton,
          ]}
          onPress={handleCreateJob}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="add-circle-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                Create Manual Job
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom:
      spacing.xxxl,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerInfo: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: colors.primary,
  },

  title: {
    marginTop: 3,
    fontSize: 25,
    fontWeight: "900",
    color:
      colors.textPrimary,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color:
      colors.textSecondary,
  },

  section: {
    marginTop: 20,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.xl,
    padding: spacing.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor:
      colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color:
      colors.textPrimary,
  },

  label: {
    marginTop: 12,
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "800",
    color:
      colors.textPrimary,
  },

  input: {
    minHeight: 50,
    backgroundColor:
      colors.background,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.lg,
    paddingHorizontal: 14,
    fontSize: 14,
    color:
      colors.textPrimary,
  },

  multilineInput: {
    minHeight: 95,
    paddingTop: 13,
    paddingBottom: 13,
  },

  priceInput: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      colors.background,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.lg,
    paddingHorizontal: 14,
  },

  currencyText: {
    fontSize: 14,
    fontWeight: "800",
    color:
      colors.textSecondary,
    marginRight: 8,
  },

  priceTextInput: {
    flex: 1,
    fontSize: 14,
    color:
      colors.textPrimary,
  },

  infoBox: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      colors.primarySoft,
    borderRadius:
      radius.lg,
    padding: 14,
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color:
      colors.textSecondary,
  },

  createButton: {
    marginTop: 20,
    minHeight: 54,
    backgroundColor:
      colors.primary,
    borderRadius:
      radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },
});