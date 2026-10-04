import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../services/firebase";

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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.progressRow}>
          <Text style={styles.stepBadge}>● Step 1 of 2</Text>
          <Text style={styles.proBadge}>PRO</Text>
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
          <Text style={styles.label}>Full Legal Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full legal name"
          />

          <Text style={styles.label}>Mobile Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+94</Text>
            </View>

            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Primary Trade Category</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Text style={styles.selectText}>🔧 {category}</Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Service Coverage District</Text>
          <TouchableOpacity style={styles.selectInput}>
            <Text style={styles.selectText}>📍 {district}</Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Create Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.passwordStatus}>Strong</Text>

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Text style={styles.passwordStatus}>
            {password === confirmPassword ? "✓ Match" : "Passwords do not match"}
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
              {agreed && <Text style={styles.check}>✓</Text>}
            </View>

            <Text style={styles.agreementText}>
              I agree to the Fixora Partner Agreement and Code of Conduct.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!agreed ||
                password !== confirmPassword ||
                loading) &&
                styles.disabledButton,
            ]}
            disabled={
              !agreed ||
              password !== confirmPassword ||
              loading
            }
            onPress={continueToVerification}
          >
            <Text style={styles.continueText}>
              {loading
                ? "Creating Account..."
                : "Continue to Document Verification →"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/provider/login")}>
            <Text style={styles.loginText}>
              Already registered as a Fixora Partner?{" "}
              <Text style={styles.loginLink}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FC",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stepBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  proBadge: {
    backgroundColor: "#1D4ED8",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  heroCard: {
    marginTop: 16,
    borderRadius: 18,
    padding: 18,
    backgroundColor: "#0F214A",
  },

  networkText: {
    color: "#CBD5E1",
    fontSize: 12,
  },

  heroTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#CBD5E1",
  },

  progressBar: {
    marginTop: 16,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#334155",
  },

  progressFill: {
    width: "50%",
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#93C5FD",
  },

  progressLabels: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  activeStep: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  inactiveStep: {
    color: "#94A3B8",
    fontSize: 11,
  },

  formCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },

  label: {
    marginTop: 14,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#0F172A",
  },

  phoneRow: {
    flexDirection: "row",
    gap: 8,
  },

  countryCode: {
    width: 70,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  countryCodeText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  selectInput: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },

  selectText: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
  },

  chevron: {
    color: "#64748B",
  },

  passwordStatus: {
    marginTop: 5,
    textAlign: "right",
    color: "#059669",
    fontSize: 11,
    fontWeight: "700",
  },

  infoCard: {
    marginTop: 18,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 14,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  infoText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
  },

  agreementRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActive: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },

  check: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  agreementText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },

  continueButton: {
    marginTop: 22,
    backgroundColor: "#1D4ED8",
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabledButton: {
    backgroundColor: "#94A3B8",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  loginText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
  },

  loginLink: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
});