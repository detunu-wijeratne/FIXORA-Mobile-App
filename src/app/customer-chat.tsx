import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomerChatScreen() {
  const params = useLocalSearchParams();

  const provider =
    typeof params.provider === "string"
      ? params.provider
      : "Kamal Perera";

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello, I have received your booking request.",
      sender: "provider",
    },
    {
      id: "2",
      text: "Hi, thank you. What time will you arrive?",
      sender: "customer",
    },
    {
      id: "3",
      text: "I should arrive around 9:30 AM.",
      sender: "provider",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now().toString(),
        text: message.trim(),
        sender: "customer",
      },
    ]);

    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.providerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👨‍🔧</Text>
        </View>

        <View>
          <Text style={styles.providerName}>{provider}</Text>
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isCustomer = item.sender === "customer";

          return (
            <View
              style={[
                styles.messageRow,
                isCustomer
                  ? styles.customerMessageRow
                  : styles.providerMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isCustomer
                    ? styles.customerBubble
                    : styles.providerBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isCustomer
                      ? styles.customerMessageText
                      : styles.providerMessageText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#94A3B8"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 22,
  },

  providerName: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  onlineText: {
    marginLeft: 12,
    marginTop: 2,
    fontSize: 11,
    color: "#16A34A",
  },

  messageList: {
    padding: 16,
    paddingBottom: 24,
  },

  messageRow: {
    marginBottom: 12,
    flexDirection: "row",
  },

  customerMessageRow: {
    justifyContent: "flex-end",
  },

  providerMessageRow: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  customerBubble: {
    backgroundColor: "#2563EB",
    borderBottomRightRadius: 4,
  },

  providerBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  customerMessageText: {
    color: "#FFFFFF",
  },

  providerMessageText: {
    color: "#0F172A",
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  input: {
    flex: 1,
    maxHeight: 110,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#0F172A",
  },

  sendButton: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});