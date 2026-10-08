import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import CustomerBottomNav from "../components/CustomerBottomNav";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppTextInput from "../components/AppTextInput";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

type SavedLocation = {
  id: string;
  label?: string;
  address?: string;
};

function locationIcon(label?: string): keyof typeof Ionicons.glyphMap {
  const lower = label?.toLowerCase() || "";
  if (lower.includes("work")) return "briefcase-outline";
  if (lower.includes("home")) return "home-outline";
  return "location-outline";
}

export default function SavedLocationsScreen() {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    const locationsRef = collection(
      db,
      "users",
      user.uid,
      "locations"
    );

    const unsubscribe = onSnapshot(
      locationsRef,
      (snapshot) => {
        const loadedLocations: SavedLocation[] =
          snapshot.docs.map((locationDoc) => ({
            id: locationDoc.id,
            ...locationDoc.data(),
          })) as SavedLocation[];

        setLocations(loadedLocations);
        setLoading(false);
      },
      (error) => {
        console.log(
          "Saved locations loading error:",
          error
        );

        alert(
          error.message ||
            "Unable to load saved locations."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setLabel("");
    setAddress("");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!label.trim()) {
      alert("Please enter a location name.");
      return;
    }

    if (!address.trim()) {
      alert("Please enter an address.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateDoc(
          doc(
            db,
            "users",
            user.uid,
            "locations",
            editingId
          ),
          {
            label: label.trim(),
            address: address.trim(),
            updatedAt: serverTimestamp(),
          }
        );

        alert("Location updated successfully.");
      } else {
        await addDoc(
          collection(
            db,
            "users",
            user.uid,
            "locations"
          ),
          {
            label: label.trim(),
            address: address.trim(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );

        alert("Location saved successfully.");
      }

      resetForm();
    } catch (error: any) {
      console.log(
        "Save location error:",
        error
      );

      alert(
        error.message ||
          "Unable to save location."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (location: SavedLocation) => {
    setEditingId(location.id);
    setLabel(location.label || "");
    setAddress(location.address || "");
  };

  const handleDelete = (location: SavedLocation) => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    Alert.alert(
      "Delete Location",
      `Delete "${location.label || "this location"}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(
                doc(
                  db,
                  "users",
                  user.uid,
                  "locations",
                  location.id
                )
              );

              if (editingId === location.id) {
                resetForm();
              }
            } catch (error: any) {
              console.log(
                "Delete location error:",
                error
              );

              alert(
                error.message ||
                  "Unable to delete location."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/*
        The missing SafeAreaView here was the actual cause of the
        title overlapping the status bar — the screen rendered flush
        from y=0 with no top inset at all. Using SafeAreaView from
        react-native-safe-area-context (not a fixed offset) fixes it
        correctly on every device/notch size.
      */}
      <SafeAreaView style={styles.container} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <View style={styles.headerIconWrap}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Saved Locations</Text>
                <Text style={styles.subtitle}>
                  Save addresses you frequently use for service bookings.
                </Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <View style={styles.formTitleRow}>
                <Ionicons
                  name={editingId ? "create-outline" : "add-circle-outline"}
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.formTitle}>
                  {editingId ? "Edit Location" : "Add Location"}
                </Text>
              </View>

              <AppTextInput
                label="Location Name"
                value={label}
                onChangeText={setLabel}
                placeholder="Example: Home, Work"
              />

              <AppTextInput
                label="Address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.addressInput}
                placeholder="Enter full address"
              />

              <PrimaryButton
                title={editingId ? "Update Location" : "Save Location"}
                onPress={handleSave}
                loading={saving}
                icon={editingId ? "checkmark-outline" : "save-outline"}
              />

              {editingId && (
                <SecondaryButton
                  title="Cancel Editing"
                  variant="ghost"
                  onPress={resetForm}
                  disabled={saving}
                  style={styles.cancelEditBtn}
                />
              )}
            </View>

            <Text style={styles.sectionTitle}>Your Locations</Text>

            {loading ? (
              <LoadingState label="Loading locations..." />
            ) : locations.length === 0 ? (
              <EmptyState
                icon="location-outline"
                title="No saved locations"
                description="Add your first location using the form above."
              />
            ) : (
              <View style={styles.locationList}>
                {locations.map((location) => (
                  <View key={location.id} style={styles.locationCard}>
                    <View style={styles.locationTopRow}>
                      <View style={styles.iconBox}>
                        <Ionicons
                          name={locationIcon(location.label)}
                          size={20}
                          color={colors.primary}
                        />
                      </View>

                      <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle} numberOfLines={1}>
                          {location.label || "Saved Location"}
                        </Text>

                        <Text style={styles.locationAddress}>
                          {location.address || "Address not provided"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleEdit(location)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="create-outline" size={15} color={colors.primary} />
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(location)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="trash-outline" size={15} color={colors.error} />
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <CustomerBottomNav />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 90,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },

  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    ...typography.pageTitle,
    fontSize: 24,
  },

  subtitle: {
    marginTop: 4,
    ...typography.secondary,
    fontSize: 12.5,
    lineHeight: 18,
  },

  formCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  formTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  formTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  addressInput: {
    minHeight: 96,
  },

  cancelEditBtn: {
    marginTop: spacing.xs,
  },

  sectionTitle: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    ...typography.sectionHeading,
  },

  locationList: {
    gap: spacing.md,
  },

  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  locationTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  locationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  locationAddress: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
  },

  editText: {
    color: colors.primary,
    fontSize: 12.5,
    fontWeight: "800",
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.errorLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
  },

  deleteText: {
    color: colors.error,
    fontSize: 12.5,
    fontWeight: "800",
  },
});
