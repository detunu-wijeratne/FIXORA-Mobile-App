import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

export default function ProviderVerificationScreen() {
  const [frontNIC, setFrontNIC] = useState(true);
  const [backNIC, setBackNIC] = useState(false);
  const [certificate, setCertificate] = useState(false);
  const [businessDoc, setBusinessDoc] = useState(false);

  const submitVerification = async () => {
  if (!frontNIC || !backNIC || !certificate) {
    Alert.alert(
      "Missing Documents",
      "Please upload both sides of your NIC and your trade certificate."
    );
    return;
  }

  try {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Error",
        "No logged-in provider was found."
      );
      return;
    }

    await updateDoc(doc(db, "users", user.uid), {
      verificationStatus: "pending",

      verificationDocuments: {
        frontNIC,
        backNIC,
        tradeCertificate: certificate,
        optionalDocument: businessDoc,
      },

      verificationSubmittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    Alert.alert(
      "Verification Submitted",
      "Your documents have been submitted for review.",
      [
        {
          text: "Continue",
          onPress: () =>
            router.replace("/provider/dashboard"),
        },
      ]
    );
  } catch (error: any) {
    console.log("Verification update error:", error);

    Alert.alert(
      "Error",
      error.message || "Unable to submit verification."
    );
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>Step 2 of 2: Verification</Text>
          <Text style={styles.progressText}>75% Completed</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.title}>Partner Verification</Text>

        <Text style={styles.subtitle}>
          Help us verify your identity and professional trade credentials.
        </Text>

        <View style={styles.securityCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={colors.primary}
          />

          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>Secure 24-Hour Review</Text>
            <Text style={styles.securityText}>
              Your documents are reviewed privately before your provider
              account is activated.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>

            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons
                name="person-circle-outline"
                size={34}
                color={colors.primary}
              />
            </View>

            <Text style={styles.profileText}>
              Customer-facing avatar for trust
            </Text>

            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            National ID (NIC) / License *
          </Text>

          <Text style={styles.helperText}>
            Sri Lankan NIC or driving license
          </Text>

          <View style={styles.uploadRow}>
            <TouchableOpacity
              style={[
                styles.uploadBox,
                frontNIC && styles.uploadedBox,
              ]}
              onPress={() => setFrontNIC(!frontNIC)}
            >
              <Ionicons
                name={frontNIC ? "checkmark-circle" : "camera-outline"}
                size={26}
                color={frontNIC ? colors.success : colors.textSecondary}
              />
              <Text style={styles.uploadTitle}>Front Side</Text>
              <Text style={styles.uploadStatus}>
                {frontNIC ? "Uploaded" : "Tap to upload"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.uploadBox,
                backNIC && styles.uploadedBox,
              ]}
              onPress={() => setBackNIC(!backNIC)}
            >
              <Ionicons
                name={backNIC ? "checkmark-circle" : "camera-outline"}
                size={26}
                color={backNIC ? colors.success : colors.textSecondary}
              />
              <Text style={styles.uploadTitle}>Back Side</Text>
              <Text style={styles.uploadStatus}>
                {backNIC ? "Uploaded" : "Tap to upload"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            Ensure all four corners and the NIC number are clearly readable.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Trade / NVQ Certificate *
          </Text>

          <Text style={styles.helperText}>
            NVQ Level 3/4, NAITA, or City & Guilds qualification
          </Text>

          <TouchableOpacity
            style={[
              styles.largeUploadBox,
              certificate && styles.uploadedBox,
            ]}
            onPress={() => setCertificate(!certificate)}
          >
            <Ionicons
              name={certificate ? "checkmark-circle" : "document-text-outline"}
              size={30}
              color={certificate ? colors.success : colors.textSecondary}
            />

            <Text style={styles.largeUploadTitle}>
              {certificate
                ? "Trade Certificate Uploaded"
                : "Upload Trade Credential"}
            </Text>

            <Text style={styles.uploadStatus}>PDF, PNG or JPG</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Business Reg or Police Clearance
          </Text>

          <Text style={styles.helperText}>
            Optional document to strengthen your provider profile
          </Text>

          <TouchableOpacity
            style={styles.optionalRow}
            onPress={() => setBusinessDoc(!businessDoc)}
          >
            <View>
              <Text style={styles.optionalTitle}>
                {businessDoc
                  ? "Optional document added"
                  : "Add optional document"}
              </Text>

              <Text style={styles.optionalText}>
                Recommended for high-value bookings
              </Text>
            </View>

            <Ionicons
              name={businessDoc ? "checkmark-circle" : "add-circle-outline"}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.privacyRow}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.privacyText}>
            Your documents are kept private and used only for verification.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.slaRow}>
          <Text style={styles.slaLabel}>Verification SLA</Text>
          <Text style={styles.slaValue}>Under 24h</Text>
        </View>

        <PrimaryButton
          title="Submit for Verification"
          onPress={submitVerification}
          icon="arrow-forward"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    padding: spacing.lg + 2,
    paddingBottom: 130,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stepText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  progressTrack: {
    marginTop: spacing.sm + 2,
    height: 5,
    backgroundColor: colors.borderStrong,
    borderRadius: 5,
  },

  progressFill: {
    width: "75%",
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 5,
  },

  title: {
    ...typography.pageTitle,
    marginTop: spacing.xl,
    fontSize: 26,
  },

  subtitle: {
    ...typography.secondary,
    marginTop: spacing.xs + 2,
    fontSize: 13,
  },

  securityCard: {
    marginTop: spacing.lg + 2,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg - 1,
    gap: spacing.md,
  },

  securityInfo: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  securityText: {
    marginTop: spacing.xs,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  section: {
    marginTop: spacing.md + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  verifiedBadge: {
    marginLeft: spacing.sm,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm - 1,
    paddingVertical: spacing.xs - 1,
    borderRadius: radius.sm,
  },

  verifiedText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.success,
  },

  helperText: {
    marginTop: spacing.xs - 1,
    fontSize: 11,
    color: colors.textSecondary,
  },

  profileRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 12,
    color: colors.textSecondary,
  },

  changeButton: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.sm,
  },

  changeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  uploadRow: {
    marginTop: spacing.md + 2,
    flexDirection: "row",
    gap: spacing.sm + 2,
  },

  uploadBox: {
    flex: 1,
    minHeight: 120,
    backgroundColor: colors.background,
    borderRadius: radius.lg - 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  uploadedBox: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },

  uploadTitle: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  uploadStatus: {
    marginTop: spacing.xs,
    fontSize: 10,
    color: colors.textSecondary,
  },

  note: {
    marginTop: spacing.md,
    fontSize: 10,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  largeUploadBox: {
    marginTop: spacing.md + 2,
    minHeight: 140,
    borderRadius: radius.lg - 2,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  largeUploadTitle: {
    marginTop: spacing.sm + 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  optionalRow: {
    marginTop: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: spacing.md + 2,
    borderRadius: radius.md,
  },

  optionalTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  optionalText: {
    marginTop: spacing.xs - 1,
    fontSize: 10,
    color: colors.textSecondary,
  },

  privacyRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  privacyText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md + 2,
  },

  slaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 2,
  },

  slaLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  slaValue: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
});
