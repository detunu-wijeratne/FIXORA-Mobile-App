import { router } from "expo-router";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTextInput from "../components/AppTextInput";
import LoadingState from "../components/LoadingState";
import PrimaryButton from "../components/PrimaryButton";
import ScreenHeader from "../components/ScreenHeader";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

export default function CustomerEditProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/customer-login");
          return;
        }

        const customerDoc = await getDoc(doc(db, "users", user.uid));

        if (!customerDoc.exists()) {
          alert("Customer profile not found.");
          return;
        }

        const data = customerDoc.data();

        setName(data.name || "");
        setPhone(data.phone || "");
      } catch (error: any) {
        console.log("Error loading customer profile:", error);
        alert(error.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    try {
      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        router.replace("/customer-login");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        phone: phone.trim(),
        updatedAt: serverTimestamp(),
      });

      alert("Profile updated successfully.");
      router.back();
    } catch (error: any) {
      console.log("Customer profile update error:", error);
      alert(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <LoadingState label="Loading profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          title="Edit Profile"
          subtitle="Update your personal information."
        />

        <AppTextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
        />

        <AppTextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>

        <View style={styles.disabledInput}>
          <Text style={styles.disabledText}>
            {auth.currentUser?.email || ""}
          </Text>
        </View>

        <Text style={styles.emailNote}>
          Email changes are disabled for this version.
        </Text>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Profile Information</Text>

          <Text style={styles.noteText}>
            Your updated name and phone number will be used for future
            bookings.
          </Text>
        </View>

        <PrimaryButton
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
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
    paddingBottom: 40,
  },

  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },

  disabledInput: {
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md + 2,
  },

  disabledText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  emailNote: {
    marginTop: spacing.xs + 2,
    fontSize: 11,
    color: colors.textMuted,
  },

  noteBox: {
    marginTop: spacing.xl,
    padding: spacing.lg - 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
  },

  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  noteText: {
    marginTop: spacing.xs + 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  saveButton: {
    marginTop: spacing.xxl,
  },
});
