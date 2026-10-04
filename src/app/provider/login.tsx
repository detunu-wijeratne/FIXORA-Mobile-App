import { router } from "expo-router";
import { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../../services/firebase";

export default function ProviderLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>FIXORA</Text>

      <Text style={styles.title}>
        Provider Login
      </Text>

      <Text style={styles.subtitle}>
        Log in to manage bookings, jobs and availability.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>
          Email Address
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email address"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>
          Password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading
              ? "Logging In..."
              : "Log In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickLoginButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleQuickProviderLogin}
          disabled={loading}
        >
          <Text style={styles.quickLoginText}>
            Quick Provider Login
          </Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>
            New service provider?{" "}
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/provider/create-account"
              )
            }
          >
            <Text style={styles.signupLink}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingTop: 50,
  },

  brand: {
    fontSize: 20,
    color: "#2563EB",
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  title: {
    marginTop: 40,
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  form: {
    marginTop: 34,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 18,
    fontSize: 15,
    color: "#0F172A",
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 22,
  },

  forgotText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },

  loginButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  quickLoginButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#EFF6FF",
  },

  quickLoginText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  signupRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
  },

  signupText: {
    color: "#64748B",
  },

  signupLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
});