// src/app/provider/edit-profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTextInput from "../../components/AppTextInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenHeader from "../../components/ScreenHeader";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

export default function ProviderEditProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/provider/login");
          return;
        }

        const providerDoc = await getDoc(doc(db, "users", user.uid));

        if (!providerDoc.exists()) {
          alert("Provider profile not found.");
          return;
        }

        const data = providerDoc.data();

        setName(data.name || "");
        setPhone(data.phone || "");
        setCategory(data.category || "");
        setDistrict(data.district || "");
      } catch (error: any) {
        console.log("Error loading provider profile:", error);
        alert(error.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return alert("Please enter your name.");
    if (!phone.trim()) return alert("Please enter your phone number.");
    if (!category.trim()) return alert("Please enter your service category.");
    if (!district.trim()) return alert("Please enter your service area.");

    try {
      setSaving(true);

      const user = auth.currentUser;
      if (!user) {
        router.replace("/provider/login");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        phone: phone.trim(),
        category: category.trim(),
        district: district.trim(),
        updatedAt: serverTimestamp(),
      });

      router.back();
    } catch (error: any) {
      console.log("Provider profile update error:", error);
      alert(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <ScreenHeader
            eyebrow="FIXORA"
            title="Edit profile"
            subtitle="Update your provider details shown to customers."
          />

          <View style={styles.card}>
            <AppTextInput
              label="Full name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inlineLabel}>Mobile number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+94</Text>
              </View>

              <View style={{ flex: 1 }}>
                <AppTextInput
                  placeholder="77 123 4567"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.phoneInputInner}
                />
              </View>
            </View>

            <AppTextInput
              label="Primary trade category"
              placeholder="Example: Plumbing & Pipe Diagnostics"
              value={category}
              onChangeText={setCategory}
            />

            <AppTextInput
              label="Service coverage / district"
              placeholder="Example: Colombo District (Zones 01–15)"
              value={district}
              onChangeText={setDistrict}
            />

            <View style={styles.note}>
              <View style={styles.noteIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>Visible to customers</Text>
                <Text style={styles.noteText}>
                  Your name, category and coverage area appear in search results
                  and booking pages. Keep them accurate for better matches.
                </Text>
              </View>
            </View>

            <PrimaryButton
              title={saving ? "Saving..." : "Save changes"}
              onPress={handleSave}
              loading={saving}
              icon="checkmark-outline"
              style={styles.saveBtn}
            />

            <Text style={styles.helper}>
              You can update availability separately from the Schedule tab.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingBottom: spacing.xxxl + 24,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  inlineLabel: {
    ...typography.label,
    marginTop: spacing.md + 2,
    marginBottom: spacing.sm,
  },

  phoneRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginBottom: spacing.md,
  },

  countryCode: {
    width: 74,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },

  countryCodeText: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 14,
  },

  phoneInputInner: {
    marginBottom: 0,
  },

  note: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },

  noteIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  noteTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  noteText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  saveBtn: {
    marginTop: spacing.lg,
  },

  helper: {
    marginTop: spacing.md,
    textAlign: "center",
    ...typography.caption,
  },
});