import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppTextInput from "../../components/AppTextInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenHeader from "../../components/ScreenHeader";
import SecondaryButton from "../../components/SecondaryButton";
import { auth, db } from "../../services/firebase";
import { colors, spacing, typography } from "../../theme";

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
        password
      );

      const user = userCredential.user;

      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userDoc.exists()) {
        alert("Provider profile not found.");
        return;
      }

      const userData = userDoc.data();

      if (userData.role !== "provider") {
        alert(
          "This account is not registered as a service provider."
        );
        return;
      }

      router.replace("/provider/dashboard");
    } catch (error: any) {
      console.log("Provider login error:", error);

      if (error.code === "auth/invalid-credential") {
        alert("Incorrect email or password.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (
        error.code === "auth/too-many-requests"
      ) {
        alert(
          "Too many login attempts. Please try again later."
        );
      } else {
        alert(
          error.message || "Unable to log in."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickProviderLogin = async () => {
    try {
      setQuickLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          "testprovider01@gmail.com",
          "Test12345"
        );

      const user = userCredential.user;

      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userDoc.exists()) {
        alert("Provider profile not found.");
        return;
      }

      const userData = userDoc.data();

      if (userData.role !== "provider") {
        alert(
          "This is not a provider account."
        );
        return;
      }

      router.replace("/provider/dashboard");
    } catch (error: any) {
      console.log(
        "Quick provider login error:",
        error
      );

      if (
        error.code === "auth/invalid-credential"
      ) {
        alert(
          "Quick login credentials are incorrect."
        );
      } else {
        alert(
          error.message || "Quick login failed."
        );
      }
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.badgeRow}>
        <Ionicons name="briefcase-outline" size={14} color={colors.primary} />
        <Text style={styles.badgeText}>Service Provider</Text>
      </View>

      <ScreenHeader
        eyebrow="FIXORA"
        title="Provider Login"
        subtitle="Log in to manage bookings, jobs and availability."
      />

      <AppTextInput
        label="Email Address"
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

      <TouchableOpacity style={styles.forgotButton}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <PrimaryButton
        title={loading ? "Logging In..." : "Log In"}
        onPress={handleLogin}
        loading={loading}
        disabled={quickLoading}
      />

      <View style={styles.devSection}>
        <Text style={styles.devCaption}>For development &amp; testing only</Text>
        <SecondaryButton
          title="Quick Provider Login"
          onPress={handleQuickProviderLogin}
          loading={quickLoading}
          disabled={loading}
          variant="ghost"
        />
      </View>

      <View style={styles.signupRow}>
        <Text style={styles.signupText}>New service provider? </Text>

        <TouchableOpacity onPress={() => router.push("/provider/create-account")}>
          <Text style={styles.signupLink}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },

  forgotText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  devSection: {
    marginTop: spacing.lg,
    alignItems: "center",
  },

  devCaption: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },

  signupRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    justifyContent: "center",
  },

  signupText: {
    color: colors.textSecondary,
  },

  signupLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
