import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CustomerBottomNav from "../components/CustomerBottomNav";
import { auth, db } from "../services/firebase";

type CustomerData = {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
};

export default function CustomerProfileScreen() {
  const [customer, setCustomer] =
    useState<CustomerData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadCustomerProfile = async () => {
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
          console.log(
            "Customer profile not found."
          );

          return;
        }

        const data =
          customerDoc.data() as CustomerData;

        setCustomer(data);
      } catch (error) {
        console.log(
          "Error loading customer profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomerProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      router.replace(
        "/customer-login"
      );
    } catch (error: any) {
      console.log(
        "Customer logout error:",
        error
      );

      alert(
        error.message ||
          "Unable to log out."
      );
    }
  };

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={styles.loadingText}
        >
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={styles.profileHeader}
        >
          <View style={styles.avatar}>
            <Text
              style={styles.avatarText}
            >
              👤
            </Text>
          </View>

          <Text style={styles.name}>
            {customer?.name ||
              "Customer"}
          </Text>

          <Text style={styles.phone}>
            {customer?.phone ||
              "Phone number not added"}
          </Text>

          <Text style={styles.email}>
            {customer?.email ||
              auth.currentUser?.email ||
              ""}
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push("/customer-edit-profile")
            }
          >
            <Text
              style={styles.itemIcon}
            >
              👤
            </Text>

            <Text
              style={styles.itemText}
            >
              Edit Profile
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              alert(
                "Saved Locations can be connected next."
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              📍
            </Text>

            <Text
              style={styles.itemText}
            >
              Saved Locations
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              alert(
                "Favourite Providers can be added later."
              )
            }
          >
            <Text
              style={styles.itemIcon}
            >
              ❤️
            </Text>

            <Text
              style={styles.itemText}
            >
              Favourite Providers
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              🔔
            </Text>

            <Text
              style={styles.itemText}
            >
              Notifications
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              🌐
            </Text>

            <Text
              style={styles.itemText}
            >
              Language
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              ❓
            </Text>

            <Text
              style={styles.itemText}
            >
              Help & Support
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
          >
            <Text
              style={styles.itemIcon}
            >
              ⚙️
            </Text>

            <Text
              style={styles.itemText}
            >
              Settings
            </Text>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text
            style={styles.logoutText}
          >
            Log Out
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 30,
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 40,
  },

  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  phone: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  email: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },

  item: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  itemIcon: {
    fontSize: 20,
    width: 34,
  },

  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  arrow: {
    fontSize: 24,
    color: "#94A3B8",
  },

  logoutButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 15,
  },
});