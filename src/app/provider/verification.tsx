import ProviderBackdrop from "../../components/ProviderBackdrop";
import ProviderIllustration from "../../components/ProviderIllustration";
// src/app/provider/verification.tsx
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import PrimaryButton from "../../components/ProviderPrimaryButton";
import SecondaryButton from "../../components/ProviderSecondaryButton";
import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme/provider";

const CLOUDINARY_CLOUD_NAME = "yuoh84r1";
const CLOUDINARY_UPLOAD_PRESET = "fixora_uploads";

type UploadState = {
  url: string;
  name?: string;
  mimeType?: string;
};

type PickedAsset = {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  file?: File | null; // web (sometimes)
};

function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    // web-friendly
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

async function cloudinaryUpload(asset: PickedAsset) {
  const name = asset.name || "upload";
  const mimeType = asset.mimeType || "application/octet-stream";

  const isPdf =
    mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");

  const resource = isPdf ? "raw" : "image";
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resource}/upload`;

  const form = new FormData();

  if (Platform.OS === "web") {
    if (asset.file instanceof File) {
      form.append("file", asset.file);
    } else {
      const blob = await (await fetch(asset.uri)).blob();
      form.append("file", blob, name);
    }
  } else {
    form.append("file", { uri: asset.uri, name, type: mimeType } as any);
  }

  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(endpoint, { method: "POST", body: form });
  const data: any = await res.json();

  if (!res.ok) throw new Error(data?.error?.message || "Upload failed.");
  if (!data?.secure_url) throw new Error("Upload succeeded but no URL returned.");

  return data.secure_url as string;
}

export default function ProviderVerificationScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ providerId?: string }>();

  const providerIdParam =
    typeof params.providerId === "string" ? params.providerId : "";

  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  const [frontNIC, setFrontNIC] = useState<UploadState>({ url: "" });
  const [backNIC, setBackNIC] = useState<UploadState>({ url: "" });
  const [certificate, setCertificate] = useState<UploadState>({ url: "" });
  const [businessDoc, setBusinessDoc] = useState<UploadState>({ url: "" });

  const [uploadingKey, setUploadingKey] = useState<
    "front" | "back" | "cert" | "biz" | null
  >(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const requiredDone = !!frontNIC.url && !!backNIC.url && !!certificate.url;

  const progress = useMemo(() => {
    const done =
      Number(!!frontNIC.url) +
      Number(!!backNIC.url) +
      Number(!!certificate.url) +
      Number(!!businessDoc.url);

    const pct = Math.round((done / 4) * 100);
    return { done, pct };
  }, [frontNIC.url, backNIC.url, certificate.url, businessDoc.url]);

  const pickNICImage = async (side: "front" | "back") => {
    try {
      setSubmitError(null);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted && Platform.OS !== "web") {
        notify("Permission needed", "Please allow photo access to upload documents.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });

      if (result.canceled || result.assets.length === 0) return;

      const a = result.assets[0] as any;
      setUploadingKey(side);

      const url = await cloudinaryUpload({
        uri: a.uri,
        name: `${side}-nic.jpg`,
        mimeType: a.mimeType || "image/jpeg",
        file: a.file || null,
      });

      if (side === "front") setFrontNIC({ url, name: "NIC Front", mimeType: a.mimeType });
      else setBackNIC({ url, name: "NIC Back", mimeType: a.mimeType });
    } catch (e: any) {
      console.log("NIC upload error:", e);
      notify("Upload failed", e?.message || "Unable to upload this image.");
    } finally {
      setUploadingKey(null);
    }
  };

  const pickDocument = async (key: "cert" | "biz") => {
    try {
      setSubmitError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log("DocumentPicker result:", result);
      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      setUploadingKey(key);

      const url = await cloudinaryUpload({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        file: (asset as any).file || null,
      });

      const payload: UploadState = {
        url,
        name: asset.name,
        mimeType: asset.mimeType,
      };

      if (key === "cert") setCertificate(payload);
      else setBusinessDoc(payload);
    } catch (e: any) {
      console.log("Doc upload error:", e);
      notify("Upload failed", e?.message || "Unable to upload this document.");
    } finally {
      setUploadingKey(null);
    }
  };

  const submitVerification = async () => {
    setSubmitError(null);

    if (!requiredDone) {
      notify("Missing documents", "Please upload NIC front + back and your trade/NVQ certificate.");
      return;
    }

    const docId = uid || providerIdParam;

    if (!uid) {
      // This is the most common cause on web after refresh
      const msg =
        "You are not logged in (auth.currentUser is null).\n\nPlease go back and log in again, then submit.";
      setSubmitError(msg);
      notify("Login required", msg);
      return;
    }

    if (!docId) {
      const msg = "Provider id not found.";
      setSubmitError(msg);
      notify("Error", msg);
      return;
    }

    try {
      setSubmitting(true);

      console.log("Submitting verification for UID:", docId);

      // Use setDoc({merge:true}) so it never fails if doc missing
      await setDoc(
        doc(db, "users", docId),
        {
          verificationStatus: "pending",
          verificationDocuments: {
            frontNICUrl: frontNIC.url,
            backNICUrl: backNIC.url,
            tradeCertificateUrl: certificate.url,
            optionalDocumentUrl: businessDoc.url || null,
            tradeCertificateName: certificate.name || null,
            optionalDocumentName: businessDoc.name || null,
          },
          verificationSubmittedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      notify("Verification submitted", "Your documents have been submitted for review.");

      router.replace("/provider/dashboard");
    } catch (e: any) {
      console.log("Verification submit error:", e);

      const msg =
        e?.code === "permission-denied"
          ? "Firestore permission denied.\nCheck your Firestore Rules to allow the logged-in provider to update their own user document."
          : e?.message || "Unable to submit verification.";

      setSubmitError(msg);
      notify("Submit failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const bottomPad = Math.max(insets.bottom, spacing.md);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topTitle} numberOfLines={1}>
          Verification
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 + bottomPad }]}
      >
        <View style={styles.heroCard}>
            <ProviderBackdrop variant="page" />
            <ProviderIllustration kind="profile" size={76} />
          <Text style={styles.heroTitle}>Partner verification</Text>
          <Text style={styles.heroSub}>
            Upload documents to get verified and unlock more bookings.
          </Text>

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{progress.pct}% completed</Text>
            <Text style={styles.progressText}>{progress.done}/4</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(10, progress.pct)}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Required documents</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>National ID (NIC) / License</Text>
          <Text style={styles.helperText}>Upload both sides.</Text>

          <View style={styles.gridRow}>
            <UploadTile
              title="Front side"
              subtitle={frontNIC.url ? "Uploaded (tap to replace)" : "Tap to upload"}
              done={!!frontNIC.url}
              uploading={uploadingKey === "front"}
              iconIdle="camera-outline"
              onPress={() => pickNICImage("front")}
              previewUrl={frontNIC.url}
            />

            <UploadTile
              title="Back side"
              subtitle={backNIC.url ? "Uploaded (tap to replace)" : "Tap to upload"}
              done={!!backNIC.url}
              uploading={uploadingKey === "back"}
              iconIdle="camera-outline"
              onPress={() => pickNICImage("back")}
              previewUrl={backNIC.url}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trade / NVQ certificate</Text>
          <Text style={styles.helperText}>Upload PDF or image.</Text>

          <UploadTile
            wide
            title={certificate.url ? "Certificate uploaded" : "Upload trade credential"}
            subtitle={certificate.url ? `File: ${certificate.name || "Uploaded"}` : "PDF, PNG or JPG"}
            done={!!certificate.url}
            uploading={uploadingKey === "cert"}
            iconIdle="document-text-outline"
            onPress={() => pickDocument("cert")}
            previewUrl={certificate.url}
          />
        </View>

        <Text style={styles.sectionTitle}>Optional</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business reg / Police clearance</Text>
          <Text style={styles.helperText}>Optional document.</Text>

          <UploadTile
            wide
            title={businessDoc.url ? "Optional document uploaded" : "Upload optional document"}
            subtitle={businessDoc.url ? `File: ${businessDoc.name || "Uploaded"}` : "PDF, PNG or JPG"}
            done={!!businessDoc.url}
            uploading={uploadingKey === "biz"}
            iconIdle="add-circle-outline"
            onPress={() => pickDocument("biz")}
            previewUrl={businessDoc.url}
          />
        </View>

        {!uid ? (
          <View style={styles.warnCard}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.warnText}>
              You are not logged in. If you refreshed the page on web, please log in again before
              submitting verification.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

        <PrimaryButton
          title={submitting ? "Submitting..." : "Submit for verification"}
          onPress={submitVerification}
          icon="arrow-forward"
          loading={submitting}
          disabled={!requiredDone || uploadingKey !== null}
        />

        <SecondaryButton
          title="Back to dashboard"
          onPress={() => router.replace("/provider/dashboard")}
          variant="ghost"
          style={{ marginTop: spacing.xs }}
        />
      </View>
    </SafeAreaView>
  );
}

function UploadTile({
  title,
  subtitle,
  done,
  uploading,
  iconIdle,
  onPress,
  wide,
  previewUrl,
}: {
  title: string;
  subtitle: string;
  done: boolean;
  uploading: boolean;
  iconIdle: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  wide?: boolean;
  previewUrl?: string;
}) {
  const showPreview = !!previewUrl && previewUrl.includes("/image/upload");

  return (
    <TouchableOpacity
      style={[
        styles.uploadTile,
        wide && styles.uploadTileWide,
        done ? styles.uploadTileDone : styles.uploadTileIdle,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator color={colors.primary} />
      ) : showPreview ? (
        <Image source={{ uri: previewUrl }} style={styles.preview} />
      ) : (
        <Ionicons
          name={done ? "checkmark-circle" : iconIdle}
          size={26}
          color={done ? colors.success : colors.textSecondary}
        />
      )}

      <Text style={styles.uploadTitle}>{title}</Text>
      <Text style={styles.uploadSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  topBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  scrollContent: { padding: spacing.xl },

  heroCard: {
borderRadius: radius.xl,
padding: spacing.lg,
overflow: "hidden",
backgroundColor: colors.primary
},
  heroTitle: {
fontSize: 18,
fontWeight: "900",
color: colors.white
},
  heroSub: {
marginTop: spacing.xs,
fontSize: 13,
lineHeight: 19,
color: colors.white
},
  progressRow: { marginTop: spacing.md, flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.75)" },
  progressTrack: {
    marginTop: spacing.sm,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: colors.primarySoft },

  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    ...typography.sectionHeading,
    fontSize: 15,
    fontWeight: "900",
  },

  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardTitle: { fontSize: 15, fontWeight: "900", color: colors.textPrimary },
  helperText: { marginTop: spacing.xs, fontSize: 12, lineHeight: 18, color: colors.textSecondary },

  gridRow: { marginTop: spacing.md, flexDirection: "row", gap: spacing.sm },

  uploadTile: {
    flex: 1,
    minHeight: 130,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  uploadTileWide: { marginTop: spacing.md, minHeight: 150 },
  uploadTileIdle: {},
  uploadTileDone: { backgroundColor: colors.successLight, borderColor: colors.success },

  preview: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.border },

  uploadTitle: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
    textAlign: "center",
  },
  uploadSubtitle: { marginTop: spacing.xs, fontSize: 11, color: colors.textSecondary, textAlign: "center" },

  warnCard: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md + 2,
  },
  warnText: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.textSecondary },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md + 2,
  },

  errorText: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
});