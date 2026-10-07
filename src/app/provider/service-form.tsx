// src/app/provider/service-form.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import AppTextInput from "../../components/AppTextInput";
import LoadingState from "../../components/LoadingState";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import { auth } from "../../services/firebase";
import {
  SERVICE_CATEGORIES,
  createService,
  getServiceById,
  updateService,
} from "../../services/providerServices";
import { colors, radius, spacing, typography } from "../../theme";

function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  // eslint-disable-next-line no-alert
  alert(`${title}\n\n${message}`);
}

function formatPriceInput(input: string) {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return "";
  // prevent extremely long values
  const trimmed = digits.slice(0, 10);
  return Number(trimmed).toLocaleString();
}

function parsePrice(input: string) {
  const numeric = Number(String(input).replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : NaN;
}

export default function ServiceFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // keep as formatted string (e.g. "2,500")
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Pre-fill when editing
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        if (!auth.currentUser) {
          router.replace("/provider/login");
          return;
        }

        const service = await getServiceById(id as string);

        if (!service) {
          notify("Not found", "Service not found.");
          router.back();
          return;
        }

        setName(service.name);
        setCategory(service.category);
        setDescription(service.description);
        setPrice(Number(service.startingPrice || 0).toLocaleString());
      } catch (e: any) {
        console.log("Load service error:", e);
        notify("Error", e?.message || "Unable to load this service.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const priceNumber = useMemo(() => parsePrice(price), [price]);

  const handleSave = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Please enter the service name.");
      return;
    }

    if (!category) {
      setError("Please select a service category.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError("Please enter a valid starting price.");
      return;
    }

    const input = {
      name: name.trim(),
      category,
      description: description.trim(),
      startingPrice: priceNumber,
    };

    try {
      setSaving(true);

      if (isEdit) {
        await updateService(id as string, input);
      } else {
        await createService(input);
      }

      router.back();
    } catch (e: any) {
      console.log("Save service error:", e);
      const msg = e?.message || "Unable to save the service.";
      setError(msg);
      notify("Save failed", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading service..." />;

  const bottomPad = Math.max(insets.bottom, spacing.md);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
            hitSlop={10}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <Text style={styles.topTitle} numberOfLines={1}>
            {isEdit ? "Edit service" : "Add service"}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 + bottomPad },
          ]}
        >
          <View style={styles.headerCard}>
            <Text style={styles.pageTitle}>
              {isEdit ? "Update your service" : "Create a new service"}
            </Text>
            <Text style={styles.pageSub}>
              Customers see your service name, category, description and starting
              price.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <AppTextInput
              label="Service name"
              placeholder="Example: Pipe Leak Repair"
              value={name}
              onChangeText={(v) => {
                setError(null);
                setName(v);
              }}
            />

            <Text style={styles.label}>Service category</Text>

            <View style={styles.chipRow}>
              {SERVICE_CATEGORIES.map((item) => {
                const active = category === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => {
                      setError(null);
                      setCategory(item);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppTextInput
              label="Description"
              placeholder="Example: Repair of leaking pipes and fittings"
              value={description}
              onChangeText={(v) => {
                setError(null);
                setDescription(v);
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.multiline}
            />

            <AppTextInput
              label="Starting price (Rs.)"
              placeholder="Example: 2,500"
              value={price}
              onChangeText={(v) => {
                setError(null);
                setPrice(formatPriceInput(v));
              }}
              keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
            />

            {/* Preview */}
            <View style={styles.previewCard}>
              <View style={styles.previewIcon}>
                <Ionicons
                  name="eye-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle}>Customer preview</Text>
                <Text style={styles.previewText} numberOfLines={2}>
                  {name.trim() ? name.trim() : "Your service name"} •{" "}
                  {category || "Category"} • From{" "}
                  {Number.isFinite(priceNumber) && priceNumber > 0
                    ? `Rs. ${priceNumber.toLocaleString()}`
                    : "Rs. —"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom bar */}
        <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
          <View style={styles.bottomRow}>
            <SecondaryButton
              title="Cancel"
              onPress={() => router.back()}
              disabled={saving}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              title={isEdit ? "Save changes" : "Add service"}
              onPress={handleSave}
              loading={saving}
              icon={isEdit ? "checkmark-outline" : "add"}
              style={{ flex: 1 }}
            />
          </View>

          <Text style={styles.bottomHint}>
            Tip: Use a clear service name customers can search for.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

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

  scrollContent: {
    padding: spacing.xl,
  },

  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  pageTitle: {
    ...typography.sectionHeading,
    fontSize: 18,
    fontWeight: "900",
  },

  pageSub: {
    marginTop: spacing.xs,
    ...typography.secondary,
    fontSize: 13,
  },

  errorCard: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md + 2,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: colors.error,
  },

  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  chip: {
    maxWidth: "100%",
    paddingHorizontal: spacing.lg - 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  chipTextActive: {
    color: colors.white,
  },

  multiline: {
    minHeight: 96,
  },

  previewCard: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md + 2,
  },

  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  previewTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  previewText: {
    marginTop: 3,
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md + 2,
  },

  bottomRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  bottomHint: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: "center",
    ...typography.caption,
  },
});