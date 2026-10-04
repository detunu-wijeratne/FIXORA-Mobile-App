import { router } from "expo-router";
import {
    doc,
    getDoc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { auth, db } from "../../services/firebase";

export default function ProviderEditProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/provider/login");
          return;
        }

        const providerDoc = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!providerDoc.exists()) {
          alert("Provider profile not found.");
          return;
        }

        const data = providerDoc.data();

        setName(data.name || "");
        setPhone(data.phone || "");
        setCategory(data.category || "");
        setDistrict(data.district || "");
      } catch (error: any) {
        console.log(
          "Error loading provider profile:",
          error
        );

        alert(
          error.message ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!category.trim()) {
      alert("Please enter your service category.");
      return;
    }

    if (!district.trim()) {
      alert("Please enter your service area.");
      return;
    }

    try {
      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        router.replace("/provider/login");
        return;
      }

      await updateDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          phone: phone.trim(),
          category: category.trim(),
          district: district.trim(),
          updatedAt: serverTimestamp(),
        }
      );

      alert("Profile updated successfully.");

      router.back();
    } catch (error: any) {
      console.log(
        "Provider profile update error:",
        error
      );

      alert(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>
          Edit Profile
        </Text>

        <Text style={styles.subtitle}>
          Update your provider information.
        </Text>

        <Text style={styles.label}>
          Full Name
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>
          Phone Number
        </Text>

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>
          Service Category
        </Text>

        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Example: Plumbing & Pipe Diagnostics"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>
          Service Area
        </Text>

        <TextInput
          style={styles.input}
          value={district}
          onChangeText={setDistrict}
          placeholder="Example: Colombo District"
          placeholderTextColor="#94A3B8"
        />

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>
            Provider Information
          </Text>

          <Text style={styles.noteText}>
            These details will be visible to customers when they browse service providers.
          </Text>
        </View>

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
              : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
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
    color: "#64748B",
  },

  label: {
    marginTop: 22,
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

  noteBox: {
    marginTop: 24,
    padding: 15,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
  },

  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  noteText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },

  saveButton: {
    marginTop: 28,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});