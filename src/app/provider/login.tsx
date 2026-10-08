// src/app/provider/login.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";

import {
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
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
import ProviderHero from "../../components/ProviderHero";
import SecondaryButton from "../../components/ProviderSecondaryButton";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme/provider";

export default function ProviderLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        alert("Provider profile not found.");
        return;
      }

      const userData = userDoc.data();

      if (userData.role !== "provider") {
        alert("This account is not registered as a service provider.");
        return;
      }

      // The root protected stack handles the session transition.
    } catch (error: any) {
      console.log("Provider login error:", error);

      if (error.code === "auth/invalid-credential") {
        alert("Incorrect email or password.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        alert("Too many login attempts. Please try again later.");
      } else {
        alert(error.message || "Unable to log in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickProviderLogin = async () => {
    try {
      setQuickLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        "testprovider01@gmail.com",
        "Test12345",
      );

      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        alert("Provider profile not found.");
        return;
      }

      const userData = userDoc.data();

      if (userData.role !== "provider") {
        alert("This is not a provider account.");
        return;
      }

      // The root protected stack handles the session transition.
    } catch (error: any) {
      console.log("Quick provider login error:", error);

      if (error.code === "auth/invalid-credential") {
        alert("Quick login credentials are incorrect.");
      } else {
        alert(error.message || "Quick login failed.");
      }
    } finally {
      setQuickLoading(false);
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
          <ProviderHero title={"Your craft.\nYour next chapter."} subtitle="Great work starts here. Manage your jobs, customers and earnings in one place." onBack={() => router.dismissTo("/role-selection")} />
          <View style={styles.formHeading}><Text style={styles.formTitle}>Welcome back</Text><Text style={styles.formSubtitle}>Sign in to your partner workspace.</Text></View>
          <View style={styles.card}>
            <AppTextInput
              label="Email address"
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <AppTextInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() =>
                alert("Password reset will be added soon. Please contact support for now.")
              }
              activeOpacity={0.8}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <PrimaryButton
              title={loading ? "Signing in..." : "Sign in to workspace"}
              onPress={handleLogin}
              loading={loading}
              disabled={quickLoading}
              icon="log-in-outline"
              style={styles.primaryBtn}
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.devCard}>
              <View style={styles.devHeader}>
                <Ionicons name="flask-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.devTitle}>Development access</Text>
              </View>

<SecondaryButton
                title="Quick provider login"
                onPress={handleQuickProviderLogin}
                loading={quickLoading}
                disabled={loading}
                variant="outline"
                style={styles.secondaryBtn}
              />
            </View>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New service provider? </Text>
            <TouchableOpacity onPress={() => router.push("/provider/create-account")}>
              <Text style={styles.signupLink}>Create account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            By continuing, you agree to FIXORA Partner Terms & Code of Conduct.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  formHeading: { marginBottom: 20 },
  formTitle: { fontSize: 25, fontWeight: "800", letterSpacing: -0.6, color: colors.textPrimary },
  formSubtitle: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 5 },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 8,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badgeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  forgotText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  primaryBtn: {
    marginTop: spacing.xs,
  },

  dividerRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    ...typography.caption,
    fontWeight: "900",
    color: colors.textMuted,
  },

  devCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
  },

  devHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  devTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  devCaption: {
    marginTop: spacing.xs + 2,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  secondaryBtn: {
    marginTop: spacing.md,
  },

  signupRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    justifyContent: "center",
  },

  signupText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  signupLink: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 13,
  },

  footerText: {
    marginTop: spacing.lg,
    textAlign: "center",
    ...typography.caption,
  },
});