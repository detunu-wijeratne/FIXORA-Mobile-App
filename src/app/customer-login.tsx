import { router } from "expo-router";
import { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppTextInput from "../components/AppTextInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenHeader from "../components/ScreenHeader";
import SecondaryButton from "../components/SecondaryButton";
import { auth, db } from "../services/firebase";
import { colors, spacing, typography } from "../theme";

export default function CustomerLoginScreen() {
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

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userDoc.exists()) {
        alert("Customer profile not found.");
        return;
      }

      const data = userDoc.data();

      if (data.role !== "customer") {
        alert("This account is not a customer account.");
        return;
      }

      router.replace("/customer-home");
    } catch (error: any) {
      console.log("Customer login error:", error);

      if (error.code === "auth/invalid-credential") {
        alert("Incorrect email or password.");
      } else {
        alert(error.message || "Unable to log in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCustomerLogin = async () => {
    try {
      setQuickLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          "shane@gmail.com",
          "Shane12345"
        );

      const user = userCredential.user;

      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userDoc.exists()) {
        alert("Customer profile not found.");
        return;
      }

      const data = userDoc.data();

      if (data.role !== "customer") {
        alert("This account is not a customer account.");
        return;
      }

      router.replace("/customer-home");
    } catch (error: any) {
      console.log("Quick customer login error:", error);

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
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        eyebrow="FIXORA"
        title="Customer Login"
        subtitle="Log in to book and manage home services."
      />

      <AppTextInput
        label="Email Address"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
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

      <PrimaryButton
        title={loading ? "Logging In..." : "Log In"}
        onPress={handleLogin}
        loading={loading}
        disabled={quickLoading}
        style={styles.loginButton}
      />

      <View style={styles.devSection}>
        <Text style={styles.devCaption}>For development &amp; testing only</Text>
        <SecondaryButton
          title="Quick Customer Login"
          onPress={handleQuickCustomerLogin}
          loading={quickLoading}
          disabled={loading}
          variant="ghost"
        />
      </View>

      <TouchableOpacity onPress={() => router.push("/customer-signup")}>
        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupLink}>Create Account</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xxl,
  },

  loginButton: {
    marginTop: spacing.xs,
  },

  devSection: {
    marginTop: spacing.lg,
    alignItems: "center",
  },

  devCaption: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },

  signupText: {
    marginTop: spacing.xxl,
    textAlign: "center",
    color: colors.textSecondary,
  },

  signupLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
