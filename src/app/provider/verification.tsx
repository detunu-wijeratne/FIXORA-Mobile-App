import { router } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../services/firebase";

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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>🛡 Step 2 of 2: Verification</Text>
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
          <Text style={styles.securityIcon}>🛡️</Text>

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
              <Text style={styles.avatarText}>👨‍🔧</Text>
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
              <Text style={styles.uploadIcon}>
                {frontNIC ? "✓" : "📷"}
              </Text>
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
              <Text style={styles.uploadIcon}>
                {backNIC ? "✓" : "📷"}
              </Text>
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
            <Text style={styles.largeUploadIcon}>
              {certificate ? "✓" : "📄"}
            </Text>

            <Text style={styles.largeUploadTitle}>
              {certificate
                ? "Trade Certificate Uploaded"
                : "Upload Trade Credential"}
            </Text>

            <Text style={styles.uploadStatus}>
              PDF, PNG or JPG
            </Text>
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

            <Text style={styles.addIcon}>
              {businessDoc ? "✓" : "+"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyRow}>
          <Text style={styles.privacyIcon}>🔒</Text>
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

        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitVerification}
        >
          <Text style={styles.submitText}>
            Submit for Verification →
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 130,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stepText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  progressTrack: {
    marginTop: 10,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 5,
  },

  progressFill: {
    width: "75%",
    height: "100%",
    backgroundColor: "#1D4ED8",
    borderRadius: 5,
  },

  title: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  securityCard: {
    marginTop: 18,
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 15,
  },

  securityIcon: {
    fontSize: 22,
  },

  securityInfo: {
    flex: 1,
    marginLeft: 12,
  },

  securityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  securityText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
  },

  section: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  verifiedBadge: {
    marginLeft: 8,
    backgroundColor: "#BBF7D0",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  verifiedText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#047857",
  },

  helperText: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },

  profileRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 26,
  },

  profileText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: "#475569",
  },

  changeButton: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  changeText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },

  uploadRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  uploadBox: {
    flex: 1,
    minHeight: 120,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  uploadedBox: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },

  uploadIcon: {
    fontSize: 27,
  },

  uploadTitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  uploadStatus: {
    marginTop: 4,
    fontSize: 10,
    color: "#64748B",
  },

  note: {
    marginTop: 12,
    fontSize: 10,
    lineHeight: 16,
    color: "#64748B",
  },

  largeUploadBox: {
    marginTop: 14,
    minHeight: 140,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  largeUploadIcon: {
    fontSize: 30,
  },

  largeUploadTitle: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  optionalRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 12,
  },

  optionalTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  optionalText: {
    marginTop: 3,
    fontSize: 10,
    color: "#64748B",
  },

  addIcon: {
    fontSize: 22,
    color: "#1D4ED8",
    fontWeight: "700",
  },

  privacyRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  privacyIcon: {
    fontSize: 16,
  },

  privacyText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 10,
    lineHeight: 16,
    color: "#64748B",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 14,
  },

  slaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  slaLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  slaValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  submitButton: {
    backgroundColor: "#1D4ED8",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});