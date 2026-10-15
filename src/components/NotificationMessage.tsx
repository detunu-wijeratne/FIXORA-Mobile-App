import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function NotificationMessage({ role }: { role: "customer" | "provider" }) {
  const params = useLocalSearchParams();
  if (typeof params.messageId !== "string" || typeof params.bookingId !== "string") return null;
  return <TouchableOpacity
    accessibilityRole="button"
    style={{ padding: 16, marginBottom: 16, backgroundColor: "#e8f2ff", borderRadius: 12 }}
    onPress={() => router.push({ pathname: role === "customer" ? "/customer-chat" : "/provider/chat", params: { bookingId: params.bookingId, messageId: params.messageId, provider: params.messageSender, customer: params.messageSender } })}
  >
    <Text style={{ fontWeight: "700", marginBottom: 6 }}>Message from {params.messageSender}</Text>
    <Text>{params.messageText}</Text>
    <Text style={{ color: "#2563eb", marginTop: 8 }}>Open this message in chat →</Text>
  </TouchableOpacity>;
}
