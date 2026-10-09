import ProviderBackdrop from "../../components/ProviderBackdrop";
// src/app/provider/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { fetch } from "expo/fetch";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import ProviderBottomNav from "../../components/ProviderBottomNav";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme/provider";

const CLOUDINARY_CLOUD_NAME = "yuoh84r1";
const CLOUDINARY_UPLOAD_PRESET = "fixora_uploads";

type ProviderData = {
  name?: string;
  category?: string;
  district?: string;
  phone?: string;
  email?: string;
  verificationStatus?: "not_submitted" | "pending" | "approved" | string;
  profileImageUrl?: string;
};

type Review = {
  rating?: number;
  providerId?: string | null;
};

type Booking = {
  status?: string;
  providerId?: string | null;
};

function getInitials(name?: string) {
  if (!name) return "PR";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProviderProfileScreen() {
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    const loadProvider = async () => {
      try {
        const providerDoc = await getDoc(doc(db, "users", user.uid));
        if (!providerDoc.exists()) {
          setLoading(false);
          return;
        }
        setProvider(providerDoc.data() as ProviderData);
      } catch (error) {
        console.log("Error loading provider profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProvider();

    const reviewsQuery = query(
      collection(db, "reviews"),
      where("providerId", "==", user.uid),
    );

    const unsubscribeReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const reviews = snapshot.docs.map((r) => r.data() as Review);
        setReviewCount(reviews.length);

        if (reviews.length === 0) {
          setAverageRating(0);
          return;
        }

        const totalRating = reviews.reduce(
          (total, r) => total + Number(r.rating || 0),
          0,
        );
        setAverageRating(totalRating / reviews.length);
      },
      (error) => {
        console.log("Review loading error:", error);
        Alert.alert("Unable to load reviews", "Your reviews could not be loaded. Please try again later.");
      },
    );

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid),
    );

    const unsubscribeBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const completed = snapshot.docs
          .map((b) => b.data() as Booking)
          .filter((b) => b.status === "completed");

        setCompletedJobs(completed.length);
      },
      (error) => console.log("Completed jobs loading error:", error),
    );

    return () => {
      unsubscribeReviews();
      unsubscribeBookings();
    };
  }, []);

  const verificationUI = useMemo(() => {
    const status = provider?.verificationStatus;

    if (status === "approved") {
      return {
        label: "Verified provider",
        icon: "shield-checkmark-outline" as const,
        bg: colors.successLight,
        fg: colors.success,
        hint: "Your account is verified.",
      };
    }

    if (status === "pending") {
      return {
        label: "Verification pending",
        icon: "time-outline" as const,
        bg: colors.warningLight,
        fg: colors.warning,
        hint: "We’re reviewing your documents.",
      };
    }

    return {
      label: "Not verified",
      icon: "alert-circle-outline" as const,
      bg: colors.primarySoft,
      fg: colors.primary,
      hint: "Submit documents to get verified.",
    };
  }, [provider?.verificationStatus]);

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
    "Provider profile Cloudinary response:",
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
        router.replace("/provider/login");
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Photo Permission Required",
          "Please allow photo access to choose a profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || result.assets.length === 0) return;

      setUploadingPhoto(true);

      const selectedUri = result.assets[0].uri;
      const imageUrl = await uploadProfilePhotoToCloudinary(selectedUri);

      await updateDoc(doc(db, "users", user.uid), { profileImageUrl: imageUrl });

      setProvider((current) => ({
        ...(current || {}),
        profileImageUrl: imageUrl,
      }));

      Alert.alert("Profile Updated", "Your profile picture was updated.");
    } catch (error: any) {
      console.log("Provider profile photo error:", error);
      Alert.alert("Upload Failed", error?.message || "Unable to update photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The root protected stack removes account history and opens login.
    } catch (error: any) {
      console.log("Logout error:", error);
      Alert.alert("Error", error.message || "Unable to log out.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <ProviderBackdrop variant="page" />
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>Profile</Text>
              <Text style={styles.pageSubtitle} numberOfLines={2}>
                Keep your details updated for customer trust and better matches.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => router.push("/provider/settings")}
              activeOpacity={0.85}
              hitSlop={10}
            >
              <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileRow}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={chooseProfilePhoto}
              disabled={uploadingPhoto}
              activeOpacity={0.88}
            >
              {provider?.profileImageUrl ? (
                <Image
                  source={{ uri: provider.profileImageUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {getInitials(provider?.name)}
                  </Text>
                </View>
              )}

              <View style={styles.cameraBadge}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="camera-outline" size={14} color={colors.white} />
                )}
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.name} numberOfLines={1}>
                {provider?.name || "Provider"}
              </Text>

              <Text style={styles.category} numberOfLines={1}>
                {provider?.category || "Service Provider"}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#D7E1EA"
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {provider?.district || "Service area not set"}
                </Text>
              </View>

              <View style={[styles.verifyPill, { backgroundColor: verificationUI.bg }]}>
                <Ionicons name={verificationUI.icon} size={14} color={verificationUI.fg} />
                <Text style={[styles.verifyText, { color: verificationUI.fg }]}>
                  {verificationUI.label}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => router.push("/provider/edit-profile")}
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.quickActionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => router.push("/provider/verification")}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
              <Text style={styles.quickActionText}>Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => router.push("/provider/services-pricing")}
              activeOpacity={0.85}
            >
              <Ionicons name="pricetag-outline" size={16} color={colors.primary} />
              <Text style={styles.quickActionText}>Services</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            activeOpacity={0.75}
            onPress={() => router.push("/provider/my-reviews")}
          >
            <Text style={styles.statValue}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedJobs}</Text>
            <Text style={styles.statLabel}>Jobs</Text>
          </View>
        </View>

        {/* Menu */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            title="Edit profile"
            subtitle="Update your name, phone, category and area"
            onPress={() => router.push("/provider/edit-profile")}
          />
          <MenuItem
            icon="calendar-outline"
            title="Availability"
            subtitle="Control when customers can book you"
            onPress={() => router.push("/provider/availability")}
          />
          <MenuItem
            icon="pricetag-outline"
            title="Services & pricing"
            subtitle="Manage what you offer and your starting prices"
            onPress={() => router.push("/provider/services-pricing")}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Verification"
            subtitle={verificationUI.hint}
            onPress={() => router.push("/provider/verification")}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="settings-outline"
            title="Settings"
            subtitle="Notifications and preferences"
            onPress={() => router.push("/provider/settings")}
          />
          <MenuItem
            icon="help-circle-outline"
            title="Help & support"
            subtitle="Get assistance with Fixora"
            onPress={() => Alert.alert("Coming soon", "Help & Support will be added soon.")}
            last
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.9}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProviderBottomNav />
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.menuItem, !last && styles.menuItemDivider]}
    >
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 90, // room for bottom nav
  },

  headerCard: {
backgroundColor: colors.primary,
borderRadius: radius.xl,
borderWidth: 1,
borderColor: colors.border,
padding: spacing.lg,
overflow: "hidden"
},

  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  pageTitle: {
    ...typography.sectionHeading,
    color: colors.accent,
    fontSize: 20,
    fontWeight: "900",
  },
  pageSubtitle: {
    marginTop: spacing.xs,
    ...typography.secondary,
    color: "#D7E1EA",
    fontSize: 13,
  },

  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  profileRow: { marginTop: spacing.lg, flexDirection: "row", alignItems: "center" },

  avatarWrap: { position: "relative" },
  avatarImage: {
    width: 78,
    height: 78,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  avatarFallback: {
    width: 78,
    height: 78,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 18,
  },

  cameraBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  name: { fontSize: 20, fontWeight: "800", color: colors.white },
  category: { marginTop: 3, ...typography.secondary, color: "#D7E1EA", fontSize: 13 },

  locationRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: { flex: 1, fontSize: 12, color: "#D7E1EA" },

  verifyPill: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
  },
  verifyText: { fontSize: 12, fontWeight: "800" },

  quickActions: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: { color: colors.primary, fontSize: 13, fontWeight: "900" },

  statsCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "900", color: colors.textPrimary },
  statLabel: { marginTop: 4, ...typography.caption, color: colors.textSecondary },
  statDivider: { width: 1, height: 34, backgroundColor: colors.border },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    ...typography.sectionHeading,
    fontSize: 15,
    fontWeight: "900",
  },

  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  menuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  menuItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  menuTitle: { fontSize: 14, fontWeight: "900", color: colors.textPrimary },
  menuSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  logoutBtn: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.errorLight,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  logoutText: { color: colors.error, fontWeight: "900", fontSize: 14 },
});
