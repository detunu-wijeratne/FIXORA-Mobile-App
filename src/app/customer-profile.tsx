import * as ImagePicker from "expo-image-picker";

import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { signOut } from "firebase/auth";

import { doc, getDoc, updateDoc } from "firebase/firestore";

import { useEffect, useState } from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomerBottomNav from "../components/CustomerBottomNav";
import LoadingState from "../components/LoadingState";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

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
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const loadCustomerProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/customer-login");
          return;
        }

        const customerDoc = await getDoc(doc(db, "users", user.uid));

        if (!customerDoc.exists()) {
          console.log("Customer profile not found.");
          return;
        }

        const data = customerDoc.data() as CustomerData;

        setCustomer(data);
      } catch (error) {
        console.log("Error loading customer profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerProfile();
  }, []);

  const uploadProfilePhotoToCloudinary = async (uri: string) => {
    const file = new File(uri);

    const formData = new FormData();

    formData.append("file", file as any);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data: any = await response.json();

    console.log("Customer profile Cloudinary response:", data);

    if (!response.ok) {
      throw new Error(data?.error?.message || "Profile photo upload failed.");
    }

    if (!data?.secure_url) {
      throw new Error("Cloudinary did not return an image URL.");
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

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        alert("Please allow photo access to choose a profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const selectedUri = result.assets[0].uri;

      setUploadingPhoto(true);

      const imageUrl = await uploadProfilePhotoToCloudinary(selectedUri);

      await updateDoc(doc(db, "users", user.uid), {
        profileImageUrl: imageUrl,
      });

      setCustomer((current) => ({
        ...(current || {}),
        profileImageUrl: imageUrl,
      }));

      alert("Your profile picture was updated successfully.");
    } catch (error: any) {
      console.log("Customer profile photo error:", error);
      alert(error?.message || "Unable to update your profile picture.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The root protected stack removes account history and opens login.
    } catch (error: any) {
      console.log("Customer logout error:", error);
      alert(error.message || "Unable to log out.");
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={["top"]}>
          <LoadingState label="Loading profile..." />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={chooseProfilePhoto}
            disabled={uploadingPhoto}
            activeOpacity={0.8}
          >
            {customer?.profileImageUrl ? (
              <Image
                source={{ uri: customer.profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={38} color={colors.primary} />
              </View>
            )}

            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={chooseProfilePhoto} disabled={uploadingPhoto}>
            <Text style={styles.changePhotoText}>
              {uploadingPhoto ? "Uploading..." : "Change Profile Photo"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.name}>{customer?.name || "Customer"}</Text>
          <Text style={styles.phone}>
            {customer?.phone || "Phone number not added"}
          </Text>
          <Text style={styles.email}>
            {customer?.email || auth.currentUser?.email || ""}
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/customer-edit-profile")}
          >
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.itemIcon} />
            <Text style={styles.itemText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/saved-locations")}
          >
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.itemIcon} />
            <Text style={styles.itemText}>Saved Locations</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => alert("Favourite Providers can be added later.")}
          >
            <Ionicons name="heart-outline" size={20} color={colors.textSecondary} style={styles.itemIcon} />
            <Text style={styles.itemText}>Favourite Providers</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.item, styles.itemLast]}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} style={styles.itemIcon} />
            <Text style={styles.itemText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item}>
            <Ionicons name="globe-outline" size={20} color={colors.textSecondary} style={styles.itemIcon} />
            <Text style={styles.itemText}>Language</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} style={styles.itemIcon} />
            <Text style={styles.itemText}>Help &amp; Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.item, styles.itemLast]}>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} style={styles.itemIcon} />
            <Text style={styles.itemText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomerBottomNav />
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
    paddingBottom: 30,
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
  },

  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  changePhotoText: {
    marginTop: spacing.sm + 2,
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  name: {
    marginTop: spacing.md + 2,
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  phone: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
  },

  email: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
  },

  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },

  item: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },

  itemLast: {
    borderBottomWidth: 0,
  },

  itemIcon: {
    width: 22,
  },

  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  logoutButton: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg - 1,
    alignItems: "center",
  },

  logoutText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 15,
  },
});
