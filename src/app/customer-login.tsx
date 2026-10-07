import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  ActivityIndicator,
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

export default function CustomerLoginScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.max(240, Math.round(windowHeight * 0.3));

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
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.root} edges={["bottom"]}>
        <ImageBackground
          source={require("../../assets/images/customer-login-bg.png")}
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

              <Text style={styles.heroTitle}>Welcome back</Text>
              <Text style={styles.heroSubtitle}>Your home, taken care of.</Text>
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
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <PrimaryButton
                title="Log In"
                icon="arrow-forward"
                onPress={handleLogin}
                loading={loading}
                disabled={quickLoading}
                style={styles.loginButton}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.devCard, (loading || quickLoading) && styles.devCardDisabled]}
                onPress={handleQuickCustomerLogin}
                disabled={loading || quickLoading}
                activeOpacity={0.8}
              >
                <View style={styles.devIconBox}>
                  <Ionicons name="code-slash-outline" size={16} color={colors.primary} />
                </View>

                <View style={styles.devTextBlock}>
                  <Text style={styles.devCaption}>Development access</Text>
                  <Text style={styles.devTitle}>Quick Customer Login</Text>
                </View>

                {quickLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push("/customer-signup")}>
              <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text style={styles.signupLink}>Create Account</Text>
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
    backgroundColor: "rgba(10,16,32,0.32)",
  },

  heroContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
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
    gap: spacing.xs + 2,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },

  logoText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },

  brand: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.white,
  },

  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    color: colors.white,
  },

  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.88)",
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

  loginButton: {
    marginTop: spacing.xs,
  },

  dividerRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    fontSize: 11,
    color: colors.textMuted,
  },

  devCard: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    gap: spacing.sm + 2,
  },

  devCardDisabled: {
    opacity: 0.6,
  },

  devIconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  devTextBlock: {
    flex: 1,
  },

  devCaption: {
    fontSize: 10,
    color: colors.textSecondary,
  },

  devTitle: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  signupText: {
    marginTop: spacing.xl,
    textAlign: "center",
    color: colors.textSecondary,
  },

  signupLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
