import * as ImagePicker from "expo-image-picker";

import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

import { router } from "expo-router";
import { signOut } from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerBottomNav from "../components/CustomerBottomNav";
import { auth, db } from "../services/firebase";

const CLOUDINARY_CLOUD_NAME = "yuoh84r1";
const CLOUDINARY_UPLOAD_PRESET = "fixora_uploads";

type CustomerData = {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  profileImageUrl?: string;
};

export default function CustomerProfileScreen() {
  const [customer, setCustomer] =
    useState<CustomerData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  useEffect(() => {
    const loadCustomerProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/customer-login");
          return;
        }

        const customerDoc = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!customerDoc.exists()) {
          console.log(
            "Customer profile not found."
          );

          return;
        }

        const data =
          customerDoc.data() as CustomerData;

        setCustomer(data);
      } catch (error) {
        console.log(
          "Error loading customer profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomerProfile();
  }, []);

  const uploadProfilePhotoToCloudinary = async (
    uri: string
  ) => {
    const file = new File(uri);

    const formData = new FormData();

    formData.append(
      "file",
      file as any
    );

    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
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
      "Customer profile Cloudinary response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          "Profile photo upload failed."
      );
    }

    if (!data?.secure_url) {
      throw new Error(
        "Cloudinary did not return an image URL."
      );
    }

    return data.secure_url as string;
  };

  const chooseProfilePhoto = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        router.replace("/customer-login");
        return;
      }

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo Permission Required",
          "Please allow photo access to choose a profile picture."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        result.canceled ||
        result.assets.length === 0
      ) {
        return;
      }

      const selectedUri =
        result.assets[0].uri;

      setUploadingPhoto(true);

      const imageUrl =
        await uploadProfilePhotoToCloudinary(
          selectedUri
        );

      await updateDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          profileImageUrl:
            imageUrl,
        }
      );

      setCustomer(
        (current) => ({
          ...(current || {}),
          profileImageUrl:
            imageUrl,
        })
      );

      Alert.alert(
        "Profile Updated",
        "Your profile picture was updated successfully."
      );
    } catch (error: any) {
      console.log(
        "Customer profile photo error:",
        error
      );

      Alert.alert(
        "Upload Failed",
        error?.message ||
          "Unable to update your profile picture."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      router.replace(
        "/customer-login"
      );
    } catch (error: any) {
      console.log(
        "Customer logout error:",
        error
      );

      alert(
        error.message ||
          "Unable to log out."
      );
    }
  };

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={styles.loadingText}
        >
          Loading profile...
        </Text>
      </View>
    );
  }

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
        <View
          style={styles.profileHeader}
        >
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={chooseProfilePhoto}
            disabled={uploadingPhoto}
            activeOpacity={0.8}
          >
            {customer?.profileImageUrl ? (
              <Image
                source={{
                  uri:
                    customer.profileImageUrl,
                }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatar}>
                <Text
                  style={styles.avatarText}
                >
                  👤
                </Text>
              </View>
            )}

            <View
              style={styles.cameraBadge}
            >
              {uploadingPhoto ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.cameraBadgeText
                  }
                >
                  📷
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={chooseProfilePhoto}
            disabled={uploadingPhoto}
          >
            <Text
              style={styles.changePhotoText}
            >
              {uploadingPhoto
                ? "Uploading..."
                : "Change Profile Photo"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.name}>
            {customer?.name ||
              "Customer"}
          </Text>

          <Text style={styles.phone}>
            {customer?.phone ||
              "Phone number not added"}
          </Text>

          <Text style={styles.email}>
            {customer?.email ||
              auth.currentUser?.email ||
              ""}
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push(
                "/customer-edit-profile"
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              👤
            </Text>

            <Text
              style={styles.itemText}
            >
              Edit Profile
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push(
                "/saved-locations"
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              📍
            </Text>

            <Text
              style={styles.itemText}
            >
              Saved Locations
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              alert(
                "Favourite Providers can be added later."
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              ❤️
            </Text>

            <Text
              style={styles.itemText}
            >
              Favourite Providers
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              🔔
            </Text>

            <Text
              style={styles.itemText}
            >
              Notifications
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              🌐
            </Text>

            <Text
              style={styles.itemText}
            >
              Language
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              ❓
            </Text>

            <Text
              style={styles.itemText}
            >
              Help & Support
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              ⚙️
            </Text>

            <Text
              style={styles.itemText}
            >
              Settings
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text
            style={styles.logoutText}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DBEAFE",
  },

  avatarText: {
    fontSize: 40,
  },

  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    borderWidth: 3,
    borderColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraBadgeText: {
    fontSize: 13,
  },

  changePhotoText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },

  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  phone: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  email: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },

  item: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  itemIcon: {
    fontSize: 20,
    width: 34,
  },

  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 24,
    color: "#94A3B8",
  },

  logoutButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 15,
  },
});