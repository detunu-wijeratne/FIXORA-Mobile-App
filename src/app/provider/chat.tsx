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

export default function ProviderChatScreen() {
  const params = useLocalSearchParams();

  const customer =
    typeof params.customer === "string"
      ? params.customer
      : "Suresh Kumar";

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello, I have accepted your booking.",
      sender: "provider",
    },
    {
      id: "2",
      text: "Thanks. Around what time will you arrive?",
      sender: "customer",
    },
    {
      id: "3",
      text: "I should arrive around 10:00 AM.",
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
        sender: "provider",
      },
    ]);

    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.customerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SK</Text>
        </View>

        <View>
          <Text style={styles.customerName}>{customer}</Text>
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isProvider = item.sender === "provider";

          return (
            <View
              style={[
                styles.messageRow,
                isProvider
                  ? styles.providerMessageRow
                  : styles.customerMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isProvider
                    ? styles.providerBubble
                    : styles.customerBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isProvider
                      ? styles.providerMessageText
                      : styles.customerMessageText,
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
    backgroundColor: "#F7F7FC",
  },

  customerHeader: {
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
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  customerName: {
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

  providerMessageRow: {
    justifyContent: "flex-end",
  },

  customerMessageRow: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  providerBubble: {
    backgroundColor: "#1D4ED8",
    borderBottomRightRadius: 4,
  },

  customerBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  providerMessageText: {
    color: "#FFFFFF",
  },

  customerMessageText: {
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
    backgroundColor: "#1D4ED8",
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