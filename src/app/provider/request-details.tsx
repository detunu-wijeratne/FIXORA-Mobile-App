// src/app/provider/request-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import StatusBadge, { StatusType } from "../../components/StatusBadge";
import { db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

const asMoney = (value: any) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatWhen = (date?: string, time?: string) => {
  const d = (date || "").trim();
  const t = (time || "").trim();
  if (!d && !t) return "—";
  const dateLabel = /^\d+$/.test(d) ? `Day ${d}` : d;
  return [dateLabel, t].filter(Boolean).join(" • ");
};

const toStatusType = (status?: string): StatusType => {
  if (status === "pending") return "pending";
  if (status === "confirmed") return "confirmed";
  if (status === "in_progress") return "in_progress";
  if (status === "completed") return "completed";
  if (status === "declined") return "declined";
  if (status === "cancelled") return "cancelled";
  return "pending";
};

export default function ProviderRequestDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const bookingId = typeof params.bookingId === "string" ? params.bookingId : "";

  const customer = typeof params.customer === "string" ? params.customer : "Customer";
  const phone = typeof params.phone === "string" ? params.phone : "";
  const email = typeof params.email === "string" ? params.email : "";

  const service = typeof params.service === "string" ? params.service : "Home Service";
  const date = typeof params.date === "string" ? params.date : "";
  const time = typeof params.time === "string" ? params.time : "";
  const location = typeof params.location === "string" ? params.location : "";
  const description =
    typeof params.description === "string"
      ? params.description
      : "No description provided";

  const price = typeof params.price === "string" ? params.price : "0";
  const totalAmount = typeof params.totalAmount === "string" ? params.totalAmount : "0";

  const [status, setStatus] = useState(
    typeof params.status === "string" ? params.status : "pending",
  );

  const [loading, setLoading] = useState(false);

  // Booking photo loaded from Firestore
  const [imageUrl, setImageUrl] = useState("");
  const [loadingImage, setLoadingImage] = useState(true);

  const initials = useMemo(() => {
    return customer
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [customer]);

  useEffect(() => {
    const loadBookingPhoto = async () => {
      if (!bookingId) {
        setLoadingImage(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "bookings", bookingId));
        if (snap.exists()) {
          const data: any = snap.data();
          setImageUrl(typeof data.imageUrl === "string" ? data.imageUrl : "");
        }
      } catch (error) {
        console.log("Load booking image error:", error);
      } finally {
        setLoadingImage(false);
      }
    };

    loadBookingPhoto();
  }, [bookingId]);

  const handleAccept = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found.");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, "bookings", bookingId), {
        status: "confirmed",
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStatus("confirmed");

      Alert.alert(
        "Booking Accepted",
        "The booking has been accepted successfully.",
        [{ text: "View Jobs", onPress: () => router.replace("/provider/jobs") }],
      );
    } catch (error: any) {
      console.log("Accept booking error:", error);
      Alert.alert("Error", error.message || "Unable to accept booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found.");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, "bookings", bookingId), {
        status: "declined",
        declinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStatus("declined");

      Alert.alert(
        "Booking Declined",
        "The booking has been declined.",
        [{ text: "Back to Requests", onPress: () => router.replace("/provider/requests") }],
      );
    } catch (error: any) {
      console.log("Decline booking error:", error);
      Alert.alert("Error", error.message || "Unable to decline booking.");
    } finally {
      setLoading(false);
    }
  };

  const bottomPad = Math.max(insets.bottom, spacing.md);
  const showPendingActions = status === "pending";
  const showConfirmedCta = status === "confirmed";
  const showDeclinedCta = status === "declined";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          Request details
        </Text>

        <View style={{ width: 40, alignItems: "flex-end" }}>
          <StatusBadge status={toStatusType(status)} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              (showPendingActions || showConfirmedCta || showDeclinedCta ? 120 : 24) + bottomPad,
          },
        ]}
      >
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryIcon}>
              <Ionicons name="clipboard-outline" size={18} color={colors.warning} />
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.serviceTitle} numberOfLines={1}>
                {service}
              </Text>
              <Text style={styles.whenText} numberOfLines={1}>
                {formatWhen(date, time)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.serviceMoney}>{asMoney(price)}</Text>
              <Text style={styles.moneyCaption}>Est. payout</Text>
            </View>
          </View>

          <View style={styles.summaryBottom}>
            <View style={styles.summaryPill}>
              <Ionicons name="cash-outline" size={14} color={colors.primary} />
              <Text style={styles.summaryPillText}>
                Customer total: {asMoney(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Customer</Text>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/provider/chat",
                  params: { bookingId, customer },
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.linkText}>Message</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitials}>{initials}</Text>
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.customerName} numberOfLines={1}>
                {customer}
              </Text>

              {!!phone && (
                <Text style={styles.customerMeta} numberOfLines={1}>
                  <Ionicons name="call-outline" size={13} color={colors.textSecondary} /> {phone}
                </Text>
              )}
              {!!email && (
                <Text style={styles.customerMeta} numberOfLines={1}>
                  <Ionicons name="mail-outline" size={13} color={colors.textSecondary} /> {email}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.customerActions}>
            <SecondaryButton
              title="Open chat"
              onPress={() =>
                router.push({
                  pathname: "/provider/chat",
                  params: { bookingId, customer },
                })
              }
              style={{ flex: 1 }}
            />
            <SecondaryButton
              title="All requests"
              variant="ghost"
              onPress={() => router.replace("/provider/requests")}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service location</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={3}>
              {location || "Location not provided"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Problem description</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {description || "No description provided"}
            </Text>
          </View>
        </View>

        {/* Customer Photo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer photo</Text>

          {loadingImage ? (
            <View style={styles.photoPlaceholder}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.photoHint}>Loading attachment…</Text>
            </View>
          ) : imageUrl ? (
            <>
              <Image
                source={{ uri: imageUrl }}
                style={styles.customerPhoto}
                resizeMode="cover"
              />

              <View style={styles.photoOkRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                <Text style={styles.photoOkText}>Attachment received</Text>
              </View>
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.photoHint}>No photo attached</Text>
            </View>
          )}
        </View>

        {/* Status helper */}
        <View style={styles.statusHelp}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.statusHelpText}>
            Review the details carefully before accepting. Once accepted, it will move to your Jobs.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      {(showPendingActions || showConfirmedCta || showDeclinedCta) && (
        <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
          {showPendingActions ? (
            <View style={styles.bottomRow}>
              <SecondaryButton
                title={loading ? "Please wait…" : "Decline"}
                onPress={handleDecline}
                disabled={loading}
                style={styles.bottomBtn}
              />
              <PrimaryButton
                title={loading ? "Please wait…" : "Accept request"}
                onPress={handleAccept}
                loading={loading}
                disabled={loading}
                icon="checkmark-outline"
                style={styles.bottomBtn}
              />
            </View>
          ) : null}

          {showConfirmedCta ? (
            <PrimaryButton
              title="View my jobs"
              onPress={() => router.replace("/provider/jobs")}
              icon="briefcase-outline"
            />
          ) : null}

          {showDeclinedCta ? (
            <PrimaryButton
              title="Back to requests"
              onPress={() => router.replace("/provider/requests")}
              icon="arrow-back-outline"
            />
          ) : null}
        </View>
      )}
    </SafeAreaView>
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
    gap: spacing.md,
    backgroundColor: colors.background,
  },

  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  topBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
    textAlign: "center",
  },

  scrollContent: {
    padding: spacing.xl,
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  serviceTitle: {
    ...typography.cardTitle,
    fontWeight: "900",
  },

  whenText: {
    marginTop: 3,
    ...typography.caption,
    color: colors.textSecondary,
  },

  serviceMoney: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },

  moneyCaption: {
    marginTop: 2,
    ...typography.caption,
    textAlign: "right",
  },

  summaryBottom: {
    marginTop: spacing.md,
  },

  summaryPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },

  summaryPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTitle: {
    ...typography.sectionHeading,
    fontSize: 15,
    fontWeight: "900",
  },

  linkText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  customerRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  customerAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  customerInitials: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 14,
  },

  customerName: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  customerMeta: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },

  customerActions: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },

  infoRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  descriptionBox: {
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  descriptionText: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  customerPhoto: {
    marginTop: spacing.md,
    width: "100%",
    height: 240,
    borderRadius: radius.xl,
    backgroundColor: colors.border,
  },

  photoPlaceholder: {
    marginTop: spacing.md,
    width: "100%",
    height: 150,
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  photoHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  photoOkRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  photoOkText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.success,
  },

  statusHelp: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md + 2,
  },

  statusHelpText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
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

  bottomRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  bottomBtn: {
    flex: 1,
  },
});