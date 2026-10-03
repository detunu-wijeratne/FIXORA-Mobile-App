import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProviderLoginScreen() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.replace("/provider/dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>FIXORA</Text>

      <Text style={styles.title}>Provider Login</Text>

      <Text style={styles.subtitle}>
        Log in to manage bookings, jobs and availability.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Mobile Number</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your mobile number"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
        />

        <Text style={styles.label}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>
            New service provider?{" "}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/provider/create-account")}
            >
            <Text style={styles.signupLink}>Create Account</Text>
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