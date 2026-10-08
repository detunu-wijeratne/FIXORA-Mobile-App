import ProviderIllustration from "../../components/ProviderIllustration";
// src/app/provider/services-pricing.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import PrimaryButton from "../../components/ProviderPrimaryButton";
import ScreenHeader from "../../components/ProviderPageHeader";
import SecondaryButton from "../../components/ProviderSecondaryButton";
import { auth } from "../../services/firebase";
import {
  ProviderService,
  deleteService,
  subscribeToMyServices,
} from "../../services/providerServices";
import { colors, radius, spacing, typography } from "../../theme/provider";

const formatPrice = (value: number) =>
  `Rs. ${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export default function ProviderServicesPricingScreen() {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/provider/login");
      return;
    }

    const unsubscribe = subscribeToMyServices(
      (list) => {
        setServices(list);
        setLoading(false);
      },
      (error) => {
        console.log("Services load error:", error);
        alert(error.message || "Unable to load your services.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const totals = useMemo(() => {
    const count = services.length;
    const minPrice =
      count === 0
        ? 0
        : Math.min(...services.map((s) => Number(s.startingPrice || 0)));
    return { count, minPrice };
  }, [services]);

  const runDelete = async (service: ProviderService) => {
    try {
      setDeletingId(service.id);
      await deleteService(service.id);
    } catch (error: any) {
      console.log("Delete service error:", error);
      alert(error.message || "Unable to remove the service.");
    } finally {
      setDeletingId(null);
    }
  };

  // Confirmation (Alert.alert doesn’t work reliably on web)
  const confirmDelete = (service: ProviderService) => {
    const message = `Remove “${service.name}”? This cannot be undone.`;

    if (Platform.OS === "web") {
      if (window.confirm(message)) runDelete(service);
      return;
    }

    Alert.alert("Remove Service", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => runDelete(service) },
    ]);
  };

  if (loading) return <LoadingState label="Loading your services..." />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
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
          Services & Pricing
        </Text>

        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => router.push("/provider/service-form")}
          activeOpacity={0.85}
          hitSlop={10}
        >
          <Ionicons name="add" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScreenHeader
          eyebrow="FIXORA"
          title="Services"
          subtitle="Manage what you offer and your starting prices."
        />

        {/* Summary */}
        <View style={styles.summaryCard}>
          <ProviderIllustration kind="services" size={62} />

          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.summaryTitle}>
              {totals.count} {totals.count === 1 ? "service" : "services"} listed
            </Text>
            <Text style={styles.summarySub}>
              {totals.count > 0 ? `Lowest starting price: ${formatPrice(totals.minPrice)}` : "Add your first service to get discovered."}
            </Text>
          </View>
        </View>

        {/* Create entry point */}
        <PrimaryButton
          title="Add new service"
          icon="add"
          onPress={() => router.push("/provider/service-form")}
        />

        <View style={styles.list}>
          {services.length === 0 ? (
            <EmptyState
              icon="construct-outline"
              title="No services yet"
              description='Tap "Add new service" to list what you offer.'
            />
          ) : (
            services.map((service) => (
              <Card key={service.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                  </View>

                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.name} numberOfLines={1}>
                      {service.name}
                    </Text>

                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryText} numberOfLines={1}>
                        {service.category}
                      </Text>
                    </View>
                  </View>
                </View>

                {!!service.description && (
                  <Text style={styles.description} numberOfLines={3}>
                    {service.description}
                  </Text>
                )}

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Starting from</Text>
                  <Text style={styles.priceValue}>
                    {formatPrice(Number(service.startingPrice || 0))}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <View style={styles.actionItem}>
                    <SecondaryButton
                      title="Edit"
                      onPress={() =>
                        router.push({
                          pathname: "/provider/service-form",
                          params: { id: service.id },
                        })
                      }
                    />
                  </View>

                  <View style={styles.actionItem}>
                    <SecondaryButton
                      title={deletingId === service.id ? "Deleting..." : "Delete"}
                      variant="ghost"
                      loading={deletingId === service.id}
                      disabled={deletingId !== null}
                      onPress={() => confirmDelete(service)}
                    />
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={styles.note}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.noteText}>
            Customers see your lowest starting price when browsing providers.
            Keep pricing realistic to improve conversions.
          </Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
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
    justifyContent: "space-between",
    backgroundColor: colors.background,
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
    paddingBottom: spacing.xxxl + 8,
  },

  summaryCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  summarySub: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  list: {
    marginTop: spacing.xl,
  },

  card: {
    marginBottom: spacing.md + 2,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    ...typography.cardTitle,
    fontWeight: "900",
  },

  categoryPill: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderWidth: 1,
    borderColor: colors.border,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  description: {
    ...typography.secondary,
    marginTop: spacing.md,
    fontSize: 13,
  },

  priceRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },

  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  priceValue: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  actions: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
  },

  actionItem: {
    flex: 1,
  },

  note: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },

  noteText: {
    flex: 1,
    ...typography.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
});