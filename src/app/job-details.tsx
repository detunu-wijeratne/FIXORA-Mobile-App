import * as ImagePicker from "expo-image-picker";

import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

import { router, useLocalSearchParams } from "expo-router";
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

const CLOUDINARY_CLOUD_NAME = "yuoh84r1";
const CLOUDINARY_UPLOAD_PRESET = "fixora_uploads";

export default function JobDetailsScreen() {
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

  const [description, setDescription] = useState("");

  const [photoUri, setPhotoUri] = useState("");

  const [uploading, setUploading] = useState(false);

  /*
    CLOUDINARY UPLOAD

    Uses Expo's File + expo/fetch instead of
    React Native's old FormData file object.
  */
  const uploadPhotoToCloudinary = async () => {
    if (!photoUri) {
      return "";
    }

    try {
      const file = new File(photoUri);

      const formData = new FormData();

      formData.append(
        "file",
        file as any
      );

      formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
      );

      console.log(
        "Starting Cloudinary upload..."
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data: any =
        await response.json();

      console.log(
        "Cloudinary response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            "Cloudinary upload failed."
        );
      }

      if (!data?.secure_url) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      return data.secure_url as string;
    } catch (error) {
      console.log(
        "Cloudinary upload error:",
        error
      );

      throw error;
    }
  };

  /*
    TAKE PHOTO
  */
  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to take a photo."
        );

        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        const asset =
          result.assets[0];

        setPhotoUri(
          asset.uri
        );

        console.log(
          "Camera photo URI:",
          asset.uri
        );
      }
    } catch (error) {
      console.log(
        "Camera error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to take the photo."
      );
    }
  };

  /*
    CHOOSE PHOTO
  */
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

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        const asset =
          result.assets[0];

        setPhotoUri(
          asset.uri
        );

        console.log(
          "Selected photo URI:",
          asset.uri
        );
      }
    } catch (error) {
      console.log(
        "Gallery error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to choose the photo."
      );
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
  const handleContinue = async () => {
    try {
      setUploading(true);

      let imageUrl = "";

      if (photoUri) {
        imageUrl =
          await uploadPhotoToCloudinary();

        console.log(
          "Uploaded Cloudinary URL:",
          imageUrl
        );
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
      console.log(
        "Continue / upload error:",
        error
      );

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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text style={styles.title}>
          Tell us about the job
        </Text>

        <Text style={styles.subtitle}>
          Describe the issue so the provider
          knows what to expect.
        </Text>

        {/* BOOKING DETAILS */}

        <View style={styles.summaryCard}>
          <Text
            style={styles.summaryTitle}
          >
            Booking details
          </Text>

          <View style={styles.summaryRow}>
            <Text
              style={styles.summaryLabel}
            >
              Provider
            </Text>

            <Text
              style={styles.summaryValue}
            >
              {name}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text
              style={styles.summaryLabel}
            >
              Service
            </Text>

            <Text
              style={styles.summaryValue}
            >
              {service}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text
              style={styles.summaryLabel}
            >
              Date
            </Text>

            <Text
              style={styles.summaryValue}
            >
              October {date}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text
              style={styles.summaryLabel}
            >
              Time
            </Text>

            <Text
              style={styles.summaryValue}
            >
              {time}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}

        <Text style={styles.label}>
          Problem Description
        </Text>

        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholder="Example: The kitchen sink is leaking under the pipe..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
        />

        {/* PHOTO */}

        <Text style={styles.label}>
          Add Photo
        </Text>

        <Text style={styles.photoHint}>
          Photos can help the provider understand
          the issue before arriving.
        </Text>

        {!photoUri ? (
          <View style={styles.photoRow}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Text style={styles.photoIcon}>
                📷
              </Text>

              <Text style={styles.photoText}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={choosePhoto}
              disabled={uploading}
            >
              <Text style={styles.photoIcon}>
                🖼️
              </Text>

              <Text style={styles.photoText}>
                Choose Photo
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={styles.photoPreviewCard}
          >
            <Image
              source={{
                uri: photoUri,
              }}
              style={styles.photoPreview}
              resizeMode="cover"
              onError={(event) => {
                console.log(
                  "Preview image error:",
                  event.nativeEvent.error
                );
              }}
            />

            <View
              style={styles.photoSuccess}
            >
              <Text
                style={
                  styles.photoSuccessIcon
                }
              >
                ✓
              </Text>

              <Text
                style={
                  styles.photoSuccessText
                }
              >
                Photo ready to upload
              </Text>
            </View>

            <View
              style={styles.photoActions}
            >
              <TouchableOpacity
                style={
                  styles.changePhotoButton
                }
                onPress={choosePhoto}
                disabled={uploading}
              >
                <Text
                  style={
                    styles.changePhotoText
                  }
                >
                  Change Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.removePhotoButton
                }
                onPress={removePhoto}
                disabled={uploading}
              >
                <Text
                  style={
                    styles.removePhotoText
                  }
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TIP */}

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>
            Tip
          </Text>

          <Text style={styles.noteText}>
            Include where the issue is located,
            when it started, and anything the
            provider should bring.
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM BUTTON */}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            uploading &&
              styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.continueButtonText
                }
              >
                Uploading Photo...
              </Text>
            </View>
          ) : (
            <Text
              style={
                styles.continueButtonText
              }
            >
              Continue
            </Text>
          )}
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

  summaryCard: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  summaryLabel: {
    fontSize: 13,
    color: "#64748B",
  },

  summaryValue: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },

  label: {
    marginTop: 26,
    marginBottom: 9,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  descriptionInput: {
    minHeight: 140,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#0F172A",
  },

  photoHint: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  photoRow: {
    flexDirection: "row",
    gap: 12,
  },

  photoButton: {
    flex: 1,
    minHeight: 105,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#94A3B8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  photoIcon: {
    fontSize: 26,
  },

  photoText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  photoPreviewCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 12,
  },

  photoPreview: {
    width: "100%",
    height: 210,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },

  photoSuccess: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  photoSuccessIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    color: "#16A34A",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 11,
    fontWeight: "800",
    marginRight: 7,
  },

  photoSuccessText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },

  photoActions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },

  changePhotoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
  },

  changePhotoText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },

  removePhotoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
  },

  removePhotoText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
  },

  noteBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
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

  continueButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
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
    gap: 10,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});