import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomerBottomNav from "../components/CustomerBottomNav";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

type FavouriteDoc = {
  id: string;
  providerId: string;
  note?: string;
};

type ProviderInfo = {
  name: string;
  category: string;
  district: string;
  email: string;
  phone: string;
  profileImageUrl: string;
  rating: number;
  reviewCount: number;
  experience: string;
  price: number;
  verified: boolean;
};

export default function FavouriteProvidersScreen() {
  const [favourites, setFavourites] = useState<FavouriteDoc[]>([]);
  const [loading, setLoading] = useState(true);

  /*
    undefined = not fetched yet, null = provider missing/disabled,
    object = real provider info resolved from users/{providerId}.
    Favourite documents only ever store providerId + note + timestamps
    (never a copy of the provider's profile), so this is resolved
    live from the real provider record, not duplicated data.
  */
  const [providerDetails, setProviderDetails] = useState<
    Record<string, ProviderInfo | null>
  >({});
  const handledProviderIdsRef = useRef<Set<string>>(new Set());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    const favouritesRef = collection(db, "users", user.uid, "favourites");

    const unsubscribe = onSnapshot(
      favouritesRef,
      (snapshot) => {
        const loaded: FavouriteDoc[] = snapshot.docs.map((favDoc) => ({
          id: favDoc.id,
          ...favDoc.data(),
        })) as FavouriteDoc[];

        setFavourites(loaded);
        setLoading(false);

        loaded.forEach((favourite) => {
          if (handledProviderIdsRef.current.has(favourite.providerId)) {
            return;
          }

          handledProviderIdsRef.current.add(favourite.providerId);

          getDoc(doc(db, "users", favourite.providerId))
            .then((providerSnapshot) => {
              const data = providerSnapshot.exists() ? providerSnapshot.data() : null;

              const info: ProviderInfo | null =
                data && data.role === "provider" && data.accountStatus !== "disabled"
                  ? {
                      name: data.name || "Service Provider",
                      category: data.category || "Service Provider",
                      district: data.district || "Location not set",
                      email: data.email || "",
                      phone: data.phone || "",
                      profileImageUrl: data.profileImageUrl || "",
                      rating: Number(data.rating || 0),
                      reviewCount: Number(data.reviewCount || 0),
                      experience: data.experience || "New provider",
                      price: Number(data.price || 2500),
                      verified: data.verificationStatus === "approved",
                    }
                  : null;

              setProviderDetails((current) => ({
                ...current,
                [favourite.providerId]: info,
              }));
            })
            .catch((error) => {
              console.log("Load favourite provider error:", error);
              setProviderDetails((current) => ({
                ...current,
                [favourite.providerId]: null,
              }));
            });
        });
      },
      (error) => {
        console.log("Favourites loading error:", error);
        alert(error.message || "Unable to load favourite providers.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const startEditNote = (favourite: FavouriteDoc) => {
    setEditingId(favourite.id);
    setEditingNote(favourite.note || "");
  };

  const cancelEditNote = () => {
    setEditingId(null);
    setEditingNote("");
  };

  const saveNote = async (favourite: FavouriteDoc) => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/customer-login");
      return;
    }

    if (savingNote) {
      return;
    }

    try {
      setSavingNote(true);

      await updateDoc(doc(db, "users", user.uid, "favourites", favourite.providerId), {
        note: editingNote.trim(),
        updatedAt: serverTimestamp(),
      });

      cancelEditNote();
    } catch (error: any) {
      console.log("Update favourite note error:", error);
      Alert.alert("Error", error.message || "Unable to update note.");
    } finally {
      setSavingNote(false);
    }
  };

  const confirmRemove = (favourite: FavouriteDoc) => {
    Alert.alert(
      "Remove Favourite",
      "Remove this provider from your favourites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const user = auth.currentUser;

            if (!user) {
              return;
            }

            try {
              await deleteDoc(doc(db, "users", user.uid, "favourites", favourite.providerId));

              if (editingId === favourite.id) {
                cancelEditNote();
              }
            } catch (error: any) {
              console.log("Remove favourite error:", error);
              Alert.alert("Error", error.message || "Unable to remove favourite.");
            }
          },
        },
      ]
    );
  };

  const openProvider = (favourite: FavouriteDoc, info: ProviderInfo) => {
    router.push({
      pathname: "/provider-profile",
      params: {
        providerId: favourite.providerId,
        name: info.name,
        service: info.category,
        category: info.category,
        district: info.district,
        email: info.email,
        phone: info.phone,
        rating: String(info.rating),
        reviews: String(info.reviewCount),
        experience: info.experience,
        price: String(info.price),
        verified: info.verified ? "true" : "false",
        profileImageUrl: info.profileImageUrl,
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="heart" size={20} color={colors.error} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Favourite Providers</Text>
              <Text style={styles.subtitle}>
                Providers you've saved for quick access next time you need a service.
              </Text>
            </View>
          </View>

          {loading ? (
            <LoadingState label="Loading favourite providers..." />
          ) : favourites.length === 0 ? (
            <EmptyState
              icon="heart-outline"
              title="No favourite providers yet"
              description='Tap the heart icon on a provider profile to save it here.'
            />
          ) : (
            <View style={styles.list}>
              {favourites.map((favourite) => {
                const info = providerDetails[favourite.providerId];
                const isEditing = editingId === favourite.id;

                if (info === undefined) {
                  return (
                    <View key={favourite.id} style={styles.card}>
                      <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.loadingRowText}>Loading provider...</Text>
                      </View>
                    </View>
                  );
                }

                if (info === null) {
                  return (
                    <View key={favourite.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.iconBoxMuted}>
                          <Ionicons name="person-outline" size={22} color={colors.textMuted} />
                        </View>

                        <View style={styles.cardInfo}>
                          <Text style={styles.missingTitle}>Provider no longer available</Text>
                          <Text style={styles.missingText}>
                            This provider's account may have been removed or disabled.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => confirmRemove(favourite)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="trash-outline" size={15} color={colors.error} />
                          <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={favourite.id} style={styles.card}>
                    <TouchableOpacity
                      style={styles.cardTopRow}
                      onPress={() => openProvider(favourite, info)}
                      activeOpacity={0.85}
                    >
                      {info.profileImageUrl ? (
                        <Image source={{ uri: info.profileImageUrl }} style={styles.avatarImage} />
                      ) : (
                        <View style={styles.avatar}>
                          <Ionicons name="person" size={26} color={colors.primary} />
                        </View>
                      )}

                      <View style={styles.cardInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name} numberOfLines={1}>
                            {info.name}
                          </Text>

                          {info.verified && (
                            <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                          )}
                        </View>

                        <Text style={styles.category} numberOfLines={1}>
                          {info.category}
                        </Text>

                        <View style={styles.districtRow}>
                          <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                          <Text style={styles.districtText} numberOfLines={1}>
                            {info.district}
                          </Text>
                        </View>
                      </View>

                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.noteBox}>
                      <View style={styles.noteLabelRow}>
                        <Ionicons name="pricetag-outline" size={13} color={colors.textSecondary} />
                        <Text style={styles.noteLabel}>Personal note</Text>
                      </View>

                      {isEditing ? (
                        <>
                          <TextInput
                            style={styles.noteInput}
                            value={editingNote}
                            onChangeText={setEditingNote}
                            placeholder="Example: Preferred electrician"
                            placeholderTextColor={colors.textMuted}
                            multiline
                            autoFocus
                          />

                          <View style={styles.noteEditActions}>
                            <TouchableOpacity
                              style={styles.cancelNoteBtn}
                              onPress={cancelEditNote}
                              disabled={savingNote}
                            >
                              <Text style={styles.cancelNoteText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.saveNoteBtn, savingNote && styles.disabledBtn]}
                              onPress={() => saveNote(favourite)}
                              disabled={savingNote}
                            >
                              <Text style={styles.saveNoteText}>
                                {savingNote ? "Saving..." : "Save"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <Text style={favourite.note ? styles.noteText : styles.noteEmptyText}>
                          {favourite.note || "No note added yet."}
                        </Text>
                      )}
                    </View>

                    {!isEditing && (
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.editNoteBtn}
                          onPress={() => startEditNote(favourite)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="create-outline" size={15} color={colors.primary} />
                          <Text style={styles.editNoteText}>Edit Note</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => confirmRemove(favourite)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="trash-outline" size={15} color={colors.error} />
                          <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

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
    backgroundColor: colors.errorLight,
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

  list: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  loadingRowText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  iconBoxMuted: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },

  name: {
    ...typography.cardTitle,
    fontSize: 15,
    flexShrink: 1,
  },

  category: {
    marginTop: 2,
    ...typography.secondary,
    fontSize: 12.5,
  },

  districtRow: {
    marginTop: spacing.xs + 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  districtText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },

  missingTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  missingText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  noteBox: {
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  noteLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.xs + 2,
  },

  noteLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  noteText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
  },

  noteEmptyText: {
    fontSize: 12,
    fontStyle: "italic",
    color: colors.textMuted,
  },

  noteInput: {
    minHeight: 60,
    fontSize: 13,
    color: colors.textPrimary,
    textAlignVertical: "top",
  },

  noteEditActions: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },

  cancelNoteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
  },

  cancelNoteText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  saveNoteBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.xs + 3,
  },

  disabledBtn: {
    opacity: 0.6,
  },

  saveNoteText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  actionsRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },

  editNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
  },

  editNoteText: {
    color: colors.primary,
    fontSize: 12.5,
    fontWeight: "800",
  },

  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.errorLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
  },

  removeText: {
    color: colors.error,
    fontSize: 12.5,
    fontWeight: "800",
  },
});
