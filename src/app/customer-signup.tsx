import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";

import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

function AuthFieldInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
}) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.fieldRow}>
        <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.fieldIcon} />

        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry ? hidden : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} style={styles.eyeButton}>
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function CustomerSignupScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.max(240, Math.round(windowHeight * 0.28));

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
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.root} edges={["bottom"]}>
        <ImageBackground
          source={require("../../assets/images/customer-signup-bg.png")}
          style={[styles.hero, { height: heroHeight }]}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />

          <SafeAreaView edges={["top"]} style={styles.heroContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.heroBottomBlock}>
              <View style={styles.brandRow}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoText}>F</Text>
                </View>
                <Text style={styles.brand}>FIXORA</Text>
              </View>

              <Text style={styles.heroTitle}>Create your account</Text>
              <Text style={styles.heroSubtitle}>
                Book trusted home services in minutes.
              </Text>

              <View style={styles.benefitsRow}>
                <View style={styles.benefitItem}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.white} />
                  <Text style={styles.benefitText}>Trusted{"\n"}professionals</Text>
                </View>

                <View style={styles.benefitItem}>
                  <Ionicons name="flash-outline" size={16} color={colors.white} />
                  <Text style={styles.benefitText}>Easy{"\n"}booking</Text>
                </View>

                <View style={styles.benefitItem}>
                  <Ionicons name="lock-closed-outline" size={16} color={colors.white} />
                  <Text style={styles.benefitText}>Secure{"\n"}account</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <AuthFieldInput
                label="Full Name"
                icon="person-outline"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />

              <AuthFieldInput
                label="Mobile Number"
                icon="call-outline"
                placeholder="Enter your mobile number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <AuthFieldInput
                label="Email Address"
                icon="mail-outline"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <AuthFieldInput
                label="Password"
                icon="lock-closed-outline"
                placeholder="Create password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <AuthFieldInput
                label="Confirm Password"
                icon="shield-checkmark-outline"
                placeholder="Confirm password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <PrimaryButton
                title="Create Account"
                icon="arrow-forward"
                onPress={handleSignup}
                loading={loading}
                style={styles.submitButton}
              />
            </View>

            <TouchableOpacity onPress={() => router.replace("/customer-login")}>
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginLink}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  hero: {
    width: "100%",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,16,32,0.36)",
  },

  heroContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  heroBottomBlock: {
    gap: spacing.xs + 1,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs + 1,
  },

  logoCircle: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  logoText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },

  brand: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.white,
  },

  heroTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
    color: colors.white,
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.88)",
  },

  benefitsRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: spacing.md,
  },

  benefitItem: {
    flex: 1,
    alignItems: "flex-start",
    gap: 3,
  },

  benefitText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  formCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  fieldContainer: {
    marginBottom: spacing.lg,
  },

  fieldLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },

  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md + 2,
  },

  fieldIcon: {
    marginRight: spacing.sm,
  },

  fieldInput: {
    flex: 1,
    paddingVertical: spacing.md + 4,
    fontSize: 15,
    color: colors.textPrimary,
  },

  eyeButton: {
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
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
