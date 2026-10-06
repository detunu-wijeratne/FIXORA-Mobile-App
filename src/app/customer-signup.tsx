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
} from "react-native";

import AppTextInput from "../components/AppTextInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenHeader from "../components/ScreenHeader";
import { auth, db } from "../services/firebase";
import { colors, spacing } from "../theme";

export default function CustomerSignupScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      alert("Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        role: "customer",
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        accountStatus: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.replace("/customer-home");
    } catch (error: any) {
      console.log("Customer signup error:", error);

      if (error.code === "auth/email-already-in-use") {
        alert("An account already exists with this email.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email.");
      } else if (error.code === "auth/weak-password") {
        alert("Please use a stronger password.");
      } else {
        alert(error.message || "Unable to create account.");
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
        <ScreenHeader
          eyebrow="FIXORA"
          title="Create Account"
          subtitle="Create your Fixora customer account."
        />

        <AppTextInput
          label="Full Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <AppTextInput
          label="Mobile Number"
          placeholder="Enter your mobile number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
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
          placeholder="Create password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <AppTextInput
          label="Confirm Password"
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <PrimaryButton
          title={loading ? "Creating Account..." : "Create Account"}
          onPress={handleSignup}
          loading={loading}
          style={styles.submitButton}
        />

        <TouchableOpacity onPress={() => router.replace("/customer-login")}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Log In</Text>
          </Text>
        </TouchableOpacity>
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
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl + 8,
  },

  submitButton: {
    marginTop: spacing.xs,
  },

  loginText: {
    marginTop: spacing.xl,
    textAlign: "center",
    color: colors.textSecondary,
  },

  loginLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
