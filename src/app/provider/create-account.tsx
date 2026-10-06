import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppTextInput from "../../components/AppTextInput";
import PrimaryButton from "../../components/PrimaryButton";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

export default function ProviderCreateAccountScreen() {
  const [name, setName] = useState("Ahmad Rasheed");
  const [phone, setPhone] = useState("77 482 9104");
  const [email, setEmail] = useState("ahmad.pro@fixora.lk");
  const [category, setCategory] = useState("Plumbing & Pipe Diagnostics");
  const [district, setDistrict] = useState(
    "Colombo District (Zones 01–15 & Suburbs)"
  );
  const [password, setPassword] = useState("ColomboPro#2025");
  const [confirmPassword, setConfirmPassword] = useState("ColomboPro#2025");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const continueToVerification = async () => {
  if (!name.trim() || !email.trim() || !password.trim()) {
    alert("Please complete all required fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (!agreed) {
    alert("Please accept the Partner Agreement.");
    return;
  }

  try {
    setLoading(true);

    // 1. Create Firebase Authentication account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = userCredential.user;

    // 2. Save provider profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      role: "provider",

      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),

      category,
      district,

      verificationStatus: "not_submitted",
      accountStatus: "active",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 3. Continue to verification
    router.replace({
      pathname: "/provider/verification",
      params: {
        providerId: user.uid,
        name,
        email,
      },
    });
  } catch (error: any) {
    console.log("Provider registration error:", error);

    if (error.code === "auth/email-already-in-use") {
      alert("An account already exists with this email.");
    } else if (error.code === "auth/invalid-email") {
      alert("Please enter a valid email address.");
    } else if (error.code === "auth/weak-password") {
      alert("Please use a stronger password.");
    } else {
      alert(error.message || "Unable to create provider account.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.progressRow}>
          <Text style={styles.stepBadge}>Step 1 of 2</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.networkText}>Sri Lanka Pro Network</Text>
          <Text style={styles.heroTitle}>Join Fixora as a Pro Partner</Text>
          <Text style={styles.heroText}>
            Earn from verified local jobs and grow your service business.
          </Text>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.activeStep}>1. Basic Profile</Text>
            <Text style={styles.inactiveStep}>2. Verification Docs</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <AppTextInput
            label="Full Legal Name"
            value={name}
            onChangeText={setName}
            placeholder="Full legal name"
          />

          <Text style={styles.label}>Mobile Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+94</Text>
            </View>

            <View style={styles.phoneInputWrapper}>
              <AppTextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.phoneInputInner}
              />
            </View>
          </View>

          <AppTextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Primary Trade Category</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Ionicons
              name="construct-outline"
              size={16}
              color={colors.textSecondary}
              style={styles.selectLeadingIcon}
            />
            <Text style={styles.selectText}>{category}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={styles.label}>Service Coverage District</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.textSecondary}
              style={styles.selectLeadingIcon}
            />
            <Text style={styles.selectText}>{district}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <AppTextInput
            label="Create Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.passwordStatus}>Strong</Text>

          <AppTextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Text
            style={[
              styles.passwordStatus,
              password !== confirmPassword && styles.passwordStatusError,
            ]}
          >
            {password === confirmPassword ? "Match" : "Passwords do not match"}
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Direct Weekly LKR Payouts</Text>
            <Text style={styles.infoText}>
              Automated bank deposits and instant payment settlement.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setAgreed(!agreed)}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>

            <Text style={styles.agreementText}>
              I agree to the Fixora Partner Agreement and Code of Conduct.
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title={
              loading
                ? "Creating Account..."
                : "Continue to Document Verification"
            }
            onPress={continueToVerification}
            loading={loading}
            disabled={!agreed || password !== confirmPassword}
            icon="arrow-forward"
            style={styles.continueButton}
          />

          <TouchableOpacity onPress={() => router.replace("/provider/login")}>
            <Text style={styles.loginText}>
              Already registered as a Fixora Partner?{" "}
              <Text style={styles.loginLink}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    padding: spacing.lg + 2,
    paddingBottom: spacing.xxxl + 8,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stepBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  proBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    borderRadius: radius.sm - 2,
  },

  proBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },

  heroCard: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg + 2,
    backgroundColor: colors.textPrimary,
  },

  networkText: {
    color: colors.borderStrong,
    fontSize: 12,
  },

  heroTitle: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
  },

  heroText: {
    marginTop: spacing.xs + 2,
    fontSize: 13,
    lineHeight: 20,
    color: colors.borderStrong,
  },

  progressBar: {
    marginTop: spacing.lg,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#334155",
  },

  progressFill: {
    width: "50%",
    height: "100%",
    borderRadius: 5,
    backgroundColor: colors.primarySoft,
  },

  progressLabels: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  activeStep: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },

  inactiveStep: {
    color: colors.textMuted,
    fontSize: 11,
  },

  formCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },

  label: {
    ...typography.label,
    marginTop: spacing.md + 2,
    marginBottom: spacing.sm - 1,
  },

  phoneRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  countryCode: {
    width: 70,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md + 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  countryCodeText: {
    color: colors.primary,
    fontWeight: "700",
  },

  phoneInputWrapper: {
    flex: 1,
  },

  phoneInputInner: {
    marginBottom: 0,
  },

  selectInput: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md + 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg - 2,
    marginBottom: spacing.lg,
  },

  selectLeadingIcon: {
    marginRight: spacing.sm,
  },

  selectText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },

  passwordStatus: {
    marginTop: spacing.xs,
    textAlign: "right",
    color: colors.success,
    fontSize: 11,
    fontWeight: "700",
  },

  passwordStatusError: {
    color: colors.error,
  },

  infoCard: {
    marginTop: spacing.lg + 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  infoText: {
    marginTop: spacing.xs,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  agreementRow: {
    marginTop: spacing.lg + 2,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm - 2,
    borderWidth: 1,
    borderColor: colors.textMuted,
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

  continueButton: {
    marginTop: spacing.xl + 2,
  },

  loginText: {
    marginTop: spacing.lg + 2,
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
  },

  loginLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
