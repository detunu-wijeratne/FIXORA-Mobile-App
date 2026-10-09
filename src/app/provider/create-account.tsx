import ProviderHero from "../../components/ProviderHero";
// src/app/provider/create-account.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTextInput from "../../components/AppTextInput";
import PrimaryButton from "../../components/ProviderPrimaryButton";
import SecondaryButton from "../../components/ProviderSecondaryButton";
import { auth, db } from "../../services/firebase";
import { SERVICE_CATEGORIES } from "../../services/providerServices";
import { colors, radius, spacing, typography } from "../../theme/provider";

function passwordStrength(pw: string) {
  const v = pw.trim();
  let score = 0;
  if (v.length >= 8) score += 1;
  if (/[A-Z]/.test(v)) score += 1;
  if (/[0-9]/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v)) score += 1;

  if (v.length === 0) return { label: "—", color: colors.textMuted, score: 0 };
  if (score <= 1) return { label: "Weak", color: colors.error, score };
  if (score === 2) return { label: "Good", color: colors.warning, score };
  return { label: "Strong", color: colors.success, score };
}

export default function ProviderCreateAccountScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const continueToVerification = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Please complete all required fields.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Missing details", "Please enter a phone number.");
      return;
    }

    const phoneDigits = phone.trim().replace(/[\s-]/g, "");
    if (!/^0?7\d{8}$/.test(phoneDigits)) {
      Alert.alert(
        "Invalid phone number",
        "Enter 9 digits after +94 (e.g. 771234567), or 10 digits starting with 07 (e.g. 0771234567).",
      );
      return;
    }

    if (!SERVICE_CATEGORIES.includes(category)) {
      Alert.alert("Missing details", "Please select your primary trade category.");
      return;
    }

    if (!district.trim()) {
      Alert.alert("Missing details", "Please enter your service coverage area.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    if (!agreed) {
      Alert.alert("Partner Agreement", "Please accept the Partner Agreement to continue.");
      return;
    }

    try {
      setLoading(true);

      // 1) Create auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      // 2) Save provider profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        role: "provider",

        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),

        category: category.trim(),
        district: district.trim(),

        verificationStatus: "not_submitted",
        accountStatus: "active",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // The root protected stack opens verification after the profile is saved.
    } catch (error: any) {
      console.log("Provider registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Email already used", "An account already exists with this email.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Invalid email", "Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Weak password", "Please use a stronger password.");
      } else {
        Alert.alert("Error", error.message || "Unable to create provider account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <ProviderHero title={"Build a business.\nMake a difference."} subtitle="Bring your skills. Find your next opportunity with Fixora." onBack={() => router.dismissTo("/provider/login")}>
            <View style={styles.signupProgress}><View style={styles.signupStep}><Text style={styles.signupStepNumber}>01</Text><Text style={styles.progressActive}>Your profile</Text></View><View style={styles.signupProgressLine} /><View style={styles.signupStep}><Text style={styles.signupStepMuted}>02</Text><Text style={styles.progressInactive}>Verification</Text></View></View>
          </ProviderHero>
          <Text style={styles.signupFormTitle}>Let's get to know you</Text>
          <Text style={styles.signupFormSubtitle}>Create your professional profile to get started.</Text>

          {/* Form */}
          <View style={styles.card}>
            <AppTextInput
              label="Full legal name *"
              value={name}
              onChangeText={setName}
              placeholder="Your name as on NIC"
            />

            <Text style={styles.inlineLabel}>Mobile phone number *</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+94</Text>
              </View>

              <View style={{ flex: 1 }}>
                <AppTextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="77 123 4567"
                  onBlur={() => setPhone((value) => value.trim())}
                  style={styles.phoneInputInner}
                />
              </View>
            </View>

            <Text style={styles.categoryHint}>
              9 digits after +94, or 10 digits starting with 07.
            </Text>

            <AppTextInput
              label="Email address *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />

            <Text style={styles.inlineLabel}>Primary trade category *</Text>
            <Text style={styles.categoryHint}>
              Choose your main trade. You can add more services after signing up.
            </Text>
            <View style={styles.categoryOptions}>
              {SERVICE_CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: category === item, disabled: loading }}
                  disabled={loading}
                  style={[styles.categoryOption, category === item && styles.categoryOptionSelected]}
                  onPress={() => setCategory(item)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.categoryOptionText, category === item && styles.categoryOptionTextSelected]}>
                    {item}
                  </Text>
                  {category === item && <Ionicons name="checkmark" size={16} color={colors.white} />}
                </TouchableOpacity>
              ))}
            </View>

            <AppTextInput
              label="Service coverage / district *"
              value={district}
              onChangeText={setDistrict}
              placeholder="Example: Colombo District (Zones 01–15)"
            />

            <AppTextInput
              label="Create password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Min 8 characters"
            />

            <View style={styles.passwordRow}>
              <Text style={styles.passwordHint}>Strength:</Text>
              <Text style={[styles.passwordValue, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>

            <AppTextInput
              label="Confirm password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Re-enter your password"
            />

            <View style={styles.passwordRow}>
              <Text style={styles.passwordHint}>Match:</Text>
              <Text
                style={[
                  styles.passwordValue,
                  { color: passwordsMatch ? colors.success : colors.textMuted },
                ]}
              >
                {confirmPassword.length === 0
                  ? "—"
                  : passwordsMatch
                    ? "Yes"
                    : "No"}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="cash-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Weekly LKR payouts</Text>
                <Text style={styles.infoText}>
                  Automated settlements based on completed jobs.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setAgreed((v) => !v)}
              activeOpacity={0.85}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : null}
              </View>

              <Text style={styles.agreementText}>
                I agree to the Fixora Partner Agreement and Code of Conduct.
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title={loading ? "Creating account..." : "Continue to verification"}
              onPress={continueToVerification}
              loading={loading}
              disabled={!agreed || !passwordsMatch || password.length < 8}
              icon="arrow-forward"
              style={styles.continueBtn}
            />

            <SecondaryButton
              title="Already registered? Log in"
              onPress={() => router.replace("/provider/login")}
              variant="ghost"
              style={styles.backToLogin}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  signupProgress: { flexDirection: "row", alignItems: "center", marginTop: 24, gap: 12 },
  signupStep: { flexDirection: "row", alignItems: "center", gap: 8 },
  signupStepNumber: { fontSize: 12, fontWeight: "900", color: colors.primary, backgroundColor: colors.accent, padding: 7, borderRadius: 9 },
  signupStepMuted: { fontSize: 12, fontWeight: "800", color: "#CBD5DF" },
  signupProgressLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  signupFormTitle: { color: colors.textPrimary, fontSize: 24, fontWeight: "800", letterSpacing: -0.6 },
  signupFormSubtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 6 },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 8,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  topBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  stepText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  proPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },

  proPillText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900",
  },

  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    backgroundColor: colors.textPrimary,
  },

  heroEyebrow: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.75)",
  },

  heroTitle: {
    marginTop: spacing.sm,
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
  },

  heroSub: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
  },

  progressTrack: {
    marginTop: spacing.lg,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },

  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: colors.primarySoft,
  },

  progressLabels: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressActive: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900",
  },

  progressInactive: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "700",
  },

  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  inlineLabel: {
    ...typography.label,
    marginTop: spacing.md + 2,
    marginBottom: spacing.sm,
  },

  categoryHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  categoryOptionTextSelected: {
    color: colors.white,
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

  passwordRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
  },

  passwordHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  passwordValue: {
    ...typography.caption,
    fontWeight: "900",
  },

  infoCard: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  infoText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  agreementRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  agreementText: {
    flex: 1,
    marginLeft: spacing.sm + 2,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  continueBtn: {
    marginTop: spacing.xl,
  },

  backToLogin: {
    marginTop: spacing.md,
  },
});
