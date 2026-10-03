import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RoleSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>How would you like to continue?</Text>

        <Text style={styles.subtitle}>
          Choose your role to continue with FIXORA.
        </Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/customer-login")}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>👤</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Continue as Customer</Text>
            <Text style={styles.cardDescription}>
              Find and book trusted home service professionals.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/provider/login")}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🛠️</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Continue as Service Provider</Text>
            <Text style={styles.cardDescription}>
              Manage jobs, requests and your service availability.
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  title: {
    marginTop: 40,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
  },

  options: {
    marginTop: 40,
    gap: 18,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  icon: {
    fontSize: 26,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  cardDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
});