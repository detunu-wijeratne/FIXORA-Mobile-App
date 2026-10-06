import { router } from "expo-router";
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
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../services/firebase";

type SavedLocation = {
  id: string;
  label?: string;
  address?: string;
};

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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>
          Saved Locations
        </Text>

        <Text style={styles.subtitle}>
          Save addresses you frequently use for service bookings.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingId
              ? "Edit Location"
              : "Add Location"}
          </Text>

          <Text style={styles.label}>
            Location Name
          </Text>

          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Example: Home, Work"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Address
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.addressInput,
            ]}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Enter full address"
            placeholderTextColor="#94A3B8"
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving
                ? "Saving..."
                : editingId
                ? "Update Location"
                : "Save Location"}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
            >
              <Text style={styles.cancelButtonText}>
                Cancel Editing
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Your Locations
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text style={styles.loadingText}>
              Loading locations...
            </Text>
          </View>
        ) : locations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              📍
            </Text>

            <Text style={styles.emptyTitle}>
              No saved locations
            </Text>

            <Text style={styles.emptyText}>
              Add your first location using the form above.
            </Text>
          </View>
        ) : (
          <View style={styles.locationList}>
            {locations.map((location) => (
              <View
                key={location.id}
                style={styles.locationCard}
              >
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>
                    {location.label
                      ?.toLowerCase()
                      .includes("work")
                      ? "🏢"
                      : location.label
                          ?.toLowerCase()
                          .includes("home")
                      ? "🏠"
                      : "📍"}
                  </Text>
                </View>

                <View style={styles.locationInfo}>
                  <Text style={styles.locationTitle}>
                    {location.label ||
                      "Saved Location"}
                  </Text>

                  <Text style={styles.locationAddress}>
                    {location.address ||
                      "Address not provided"}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      handleEdit(location)
                    }
                  >
                    <Text style={styles.editText}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      handleDelete(location)
                    }
                  >
                    <Text style={styles.deleteText}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <CustomerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
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

  formCard: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },

  formTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  label: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#0F172A",
  },

  addressInput: {
    minHeight: 100,
  },

  saveButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 28,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 34,
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },

  locationList: {
    gap: 12,
  },

  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 21,
  },

  locationInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },

  locationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  locationAddress: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
  },

  actions: {
    gap: 6,
  },

  editButton: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  editText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  deleteText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "700",
  },
});