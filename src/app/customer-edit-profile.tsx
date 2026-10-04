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

import { auth, db } from "../services/firebase";

export default function CustomerEditProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/customer-login");
          return;
        }

        const customerDoc = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!customerDoc.exists()) {
          alert("Customer profile not found.");
          return;
        }

        const data = customerDoc.data();

        setName(data.name || "");
        setPhone(data.phone || "");
      } catch (error: any) {
        console.log(
          "Error loading customer profile:",
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

    try {
      setSaving(true);

      const user = auth.currentUser;

      if (!user) {
        router.replace("/customer-login");
        return;
      }

      await updateDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          phone: phone.trim(),
          updatedAt: serverTimestamp(),
        }
      );

      alert("Profile updated successfully.");

      router.back();
    } catch (error: any) {
      console.log(
        "Customer profile update error:",
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
          Update your personal information.
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
          Email
        </Text>

        <View style={styles.disabledInput}>
          <Text style={styles.disabledText}>
            {auth.currentUser?.email || ""}
          </Text>
        </View>

        <Text style={styles.emailNote}>
          Email changes are disabled for this version.
        </Text>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>
            Profile Information
          </Text>

          <Text style={styles.noteText}>
            Your updated name and phone number will be used for future bookings.
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
    fontSize: 13,
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

  disabledInput: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  disabledText: {
    fontSize: 14,
    color: "#64748B",
  },

  emailNote: {
    marginTop: 6,
    fontSize: 11,
    color: "#94A3B8",
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