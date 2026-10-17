import * as ImagePicker from "expo-image-picker";

import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
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
import { colors, radius, spacing, typography } from "../theme";

const CLOUDINARY_CLOUD_NAME = "yuoh84r1";
const CLOUDINARY_UPLOAD_PRESET = "fixora_uploads";

export default function JobDetailsScreen() {
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

  // JOB DESCRIPTION
  // description is stored in local React state as the customer types;
  // it is only sent anywhere once "Continue" is pressed.
  // VALIDATION: there is no required-field check on description
  // here - the customer can continue with an empty description.
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState("");
  const [uploading, setUploading] = useState(false);

  /*
    CLOUDINARY UPLOAD

    Uses Expo's File + expo/fetch instead of
    React Native's old FormData file object.
  */
  // ========================================
  // PHOTO UPLOAD
  // Uploads the selected photo to Cloudinary (an external image-hosting
  // service) and returns the HTTPS URL Cloudinary gives back.
  // This step does NOT touch Firestore - only the returned URL (a
  // plain text string) is later saved into the booking document.
  // ========================================
  const uploadPhotoToCloudinary = async () => {
    if (!photoUri) {
      return "";
    }

    try {
      const file = new File(photoUri);

      const formData = new FormData();

      formData.append("file", file as any);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      console.log("Starting Cloudinary upload...");

      // PHOTO UPLOAD: sends the photo file to Cloudinary's
      // upload API; Cloudinary stores the actual image file.
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data: any = await response.json();

      console.log("Cloudinary response:", data);

      // PHOTO UPLOAD error handling: if Cloudinary responds
      // with a failure, an error is thrown with Cloudinary's own
      // message so the caller (handleContinue) can show it to the user.
      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Cloudinary upload failed."
        );
      }

      if (!data?.secure_url) {
        throw new Error("Cloudinary did not return an image URL.");
      }

      // PHOTO UPLOAD: secure_url is the HTTPS link Cloudinary
      // returns for the uploaded image - this URL (not the image
      // itself) is what eventually gets saved in Firestore.
      return data.secure_url as string;
    } catch (error) {
      console.log("Cloudinary upload error:", error);
      throw error;
    }
  };

  /*
    TAKE PHOTO
  */
  // PHOTO UPLOAD: uses Expo's ImagePicker.launchCameraAsync to
  // let the customer take a new photo with the device camera.
  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to take a photo."
        );

        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];

        setPhotoUri(asset.uri);

        console.log("Camera photo URI:", asset.uri);
      }
    } catch (error) {
      console.log("Camera error:", error);

      Alert.alert("Error", "Unable to take the photo.");
    }
  };

  /*
    CHOOSE PHOTO
  */
  // PHOTO UPLOAD: uses Expo's ImagePicker.launchImageLibraryAsync
  // to let the customer pick an existing photo from their device gallery.
  const choosePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo Permission Required",
          "Please allow photo access to choose an image."
        );

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];

        setPhotoUri(asset.uri);

        console.log("Selected photo URI:", asset.uri);
      }
    } catch (error) {
      console.log("Gallery error:", error);

      Alert.alert("Error", "Unable to choose the photo.");
    }
  };

  /*
    REMOVE PHOTO
  */
  const removePhoto = () => {
    setPhotoUri("");
  };

  /*
    CONTINUE

    If customer selected a photo:
    upload to Cloudinary first.

    Then pass the returned HTTPS URL
    to Service Location.
  */
  // ========================================
  // PHOTO UPLOAD / NAVIGATION
  // If a photo was picked, uploads it to Cloudinary first and waits
  // for the returned URL, then passes description + that image URL
  // forward to service-location.tsx as navigation params.
  // ========================================
  const handleContinue = async () => {
    try {
      setUploading(true);

      let imageUrl = "";

      // PHOTO UPLOAD: only runs the Cloudinary upload if the
      // customer actually attached a photo (photoUri is not empty).
      if (photoUri) {
        imageUrl = await uploadPhotoToCloudinary();

        console.log("Uploaded Cloudinary URL:", imageUrl);
      }

      router.push({
        pathname: "/service-location",
        params: {
          providerId,
          name,
          service,
          price,
          date,
          time,
          description,
          imageUrl,
        },
      });
    } catch (error: any) {
      // error handling: if the Cloudinary upload fails, the
      // customer sees an alert and stays on this screen instead of
      // moving forward with a broken/missing photo URL.
      console.log("Continue / upload error:", error);

      Alert.alert(
        "Photo Upload Failed",
        error?.message ||
          "The photo could not be uploaded. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Tell us about the job</Text>

        <BookingProgress currentStep={2} />

        <Text style={styles.subtitle}>
          Add a few details so your provider knows what to expect.
        </Text>

        {/* BOOKING DETAILS */}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking details</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Provider</Text>
            <Text style={styles.summaryValue}>{name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{service}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>October {date}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{time}</Text>
          </View>
        </View>

        {/* DESCRIPTION */}

        <Text style={styles.label}>Problem Description</Text>

        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholder="Example: The kitchen sink is leaking under the pipe..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
        />

        {/* PHOTO */}

        <Text style={styles.label}>Add Photos</Text>

        <Text style={styles.photoHint}>
          Help your provider understand the issue.
        </Text>

        {!photoUri ? (
          <View style={styles.photoRow}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Ionicons name="camera-outline" size={26} color={colors.textSecondary} />
              <Text style={styles.photoText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={choosePhoto}
              disabled={uploading}
            >
              <Ionicons name="image-outline" size={26} color={colors.textSecondary} />
              <Text style={styles.photoText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoPreviewCard}>
            <Image
              source={{ uri: photoUri }}
              style={styles.photoPreview}
              resizeMode="cover"
              onError={(event) => {
                console.log("Preview image error:", event.nativeEvent.error);
              }}
            />

            <View style={styles.photoSuccess}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.photoSuccessText}>Photo ready to upload</Text>
            </View>

            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={choosePhoto}
                disabled={uploading}
              >
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={removePhoto}
                disabled={uploading}
              >
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TIP */}

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Tip</Text>

          <Text style={styles.noteText}>
            Include where the issue is located, when it started, and
            anything the provider should bring.
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM BUTTON */}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueButton, uploading && styles.disabledButton]}
          onPress={handleContinue}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.continueButtonText}>Uploading Photo...</Text>
            </View>
          ) : (
            <View style={styles.loadingRow}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
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
    padding: spacing.xl,
    paddingBottom: 120,
  },

  title: {
    ...typography.pageTitle,
    fontSize: 24,
  },

  subtitle: {
    ...typography.secondary,
    marginTop: spacing.sm,
  },

  summaryCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm + 2,
  },

  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  summaryValue: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  label: {
    marginTop: spacing.xxl + 2,
    marginBottom: spacing.sm + 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  descriptionInput: {
    minHeight: 140,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    fontSize: 15,
    color: colors.textPrimary,
  },

  photoHint: {
    marginBottom: spacing.md,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  photoRow: {
    flexDirection: "row",
    gap: spacing.md,
  },

  photoButton: {
    flex: 1,
    minHeight: 105,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.textMuted,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  photoText: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  photoPreviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.md,
  },

  photoPreview: {
    width: "100%",
    height: 210,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },

  photoSuccess: {
    marginTop: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },

  photoSuccessText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },

  photoActions: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm + 2,
  },

  changePhotoButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
  },

  changePhotoText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  removePhotoButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.errorLight,
    alignItems: "center",
  },

  removePhotoText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: "700",
  },

  noteBox: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
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
    lineHeight: 20,
    color: colors.textSecondary,
  },

  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },

  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },

  disabledButton: {
    opacity: 0.65,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },

  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
