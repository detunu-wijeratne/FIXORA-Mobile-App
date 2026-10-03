import { View, Text, StyleSheet } from "react-native";

export default function SelectDateTimeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date & Time</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
});