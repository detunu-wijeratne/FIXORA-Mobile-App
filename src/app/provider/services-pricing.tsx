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

export default function ProviderServicesPricingScreen() {
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [experience, setExperience] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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

        setCategory(data.category || "");
        setPrice(
          data.price
            ? String(data.price)
            : ""
        );
        setExperience(
          data.experience || ""
        );
      } catch (error: any) {
        console.log(
          "Service pricing load error:",
          error
        );

        alert(
          error.message ||
            "Unable to load service information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    if (!category.trim()) {
      alert("Please enter your service category.");
      return;
    }

    if (!price.trim()) {
      alert("Please enter your service price.");
      return;
    }

    const numericPrice = Number(
      price.replace(/,/g, "")
    );

    if (
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {
      alert("Please enter a valid price.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(
        doc(db, "users", user.uid),
        {
          category: category.trim(),
          price: numericPrice,
          experience: experience.trim(),
          updatedAt: serverTimestamp(),
        }
      );

      alert(
        "Service and pricing updated successfully."
      );

      router.back();
    } catch (error: any) {
      console.log(
        "Service pricing update error:",
        error
      );

      alert(
        error.message ||
          "Unable to update service information."
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
          Loading service information...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Text style={styles.title}>
          Services & Pricing
        </Text>

        <Text style={styles.subtitle}>
          Manage the service customers see on your profile.
        </Text>

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
          Starting Price (Rs.)
        </Text>

        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Example: 2500"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          Experience
        </Text>

        <TextInput
          style={styles.input}
          value={experience}
          onChangeText={setExperience}
          placeholder="Example: 5 years"
          placeholderTextColor="#94A3B8"
        />

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>
            Customer View
          </Text>

          <Text style={styles.noteText}>
            Your category, starting price and experience will be shown to customers when they browse providers.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving &&
              styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text
            style={styles.saveButtonText}
          >
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
    lineHeight: 20,
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
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
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