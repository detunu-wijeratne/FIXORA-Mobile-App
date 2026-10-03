import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>F</Text>
        </View>

        <Text style={styles.brand}>FIXORA</Text>

        <Text style={styles.title}>Reliable home services.</Text>

        <Text style={styles.subtitle}>
          Find trusted professionals for all your home service needs.
        </Text>

        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>🔧</Text>
            <Text style={styles.cardText}>Plumbing</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>⚡</Text>
            <Text style={styles.cardText}>Electrical</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcon}>🧹</Text>
            <Text style={styles.cardText}>Cleaning</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/role-selection")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "800",
  },

  brand: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#1E3A8A",
    marginBottom: 26,
  },

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 310,
  },

  cards: {
    width: "100%",
    marginTop: 38,
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardIcon: {
    fontSize: 24,
    marginRight: 14,
  },

  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  button: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});