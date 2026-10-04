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

import { auth, db } from "../services/firebase";

export default function CustomerLoginScreen() {
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
      setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>FIXORA</Text>

      <Text style={styles.title}>Customer Login</Text>

      <Text style={styles.subtitle}>
        Log in to book and manage home services.
      </Text>

      <Text style={styles.label}>Email Address</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging In..." : "Log In"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickLoginButton,
          loading && styles.disabledButton,
        ]}
        onPress={handleQuickCustomerLogin}
        disabled={loading}
      >
        <Text style={styles.quickLoginText}>
          Quick Customer Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/customer-signup")}
      >
        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupLink}>
            Create Account
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
    paddingTop: 50,
  },

  brand: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
  },

  title: {
    marginTop: 40,
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 34,
    color: "#64748B",
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
  },

  button: {
    marginTop: 6,
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

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  signupText: {
    marginTop: 24,
    textAlign: "center",
    color: "#64748B",
  },

  signupLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
});