import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import CustomerBottomNav from "../components/CustomerBottomNav";


import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

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
import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

type ChatMessage = {
  id: string;
  text: string;
  sender: "customer" | "provider";
  senderId?: string;
};

export default function CustomerChatScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string" ? params.bookingId : "";

  const provider =
    typeof params.provider === "string" ? params.provider : "Service Provider";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const sendingRef = useRef(false);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (!bookingId) {
      setChatError("Open chat from a booking to start messaging.");
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", bookingId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setChatError("");
        const loadedMessages: ChatMessage[] = snapshot.docs.map(
          (messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          })
        ) as ChatMessage[];

        setMessages(loadedMessages);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.log("Customer chat listener error:", error);
        setChatError(error.code === "permission-denied" ? "You do not have permission to read this chat." : "Messages could not load. Please reopen this chat and try again.");
      }
    );

    return () => unsubscribe();
  }, [bookingId]);

  const sendMessage = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in first.");
      return;
    }

    if (!bookingId) {
      alert("Booking ID not found.");
      return;
    }

    if (!message.trim()) {
      return;
    }

    if (sendingRef.current) return;
    try {
      sendingRef.current = true;
      setSending(true);

      await addDoc(collection(db, "chats", bookingId, "messages"), {
        text: message.trim(),
        sender: "customer",
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      setMessage("");
    } catch (error: any) {
      console.log("Send customer message error:", error);
      alert(error.message || "Unable to send message.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.providerHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>

          <View>
            <Text style={styles.providerName}>{provider}</Text>
            <Text style={styles.onlineText}>Booking Chat</Text>
          </View>
        </View>

        {!!chatError && <Text accessibilityRole="alert" style={{ color: colors.error, paddingHorizontal: 20, paddingVertical: 12 }}>{chatError}</Text>}
        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && styles.emptyMessageList,
          ]}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => {
            const isCustomer = item.sender === "customer";

            return (
              <View
                style={[
                  styles.messageRow,
                  isCustomer ? styles.customerMessageRow : styles.providerMessageRow,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isCustomer ? styles.customerBubble : styles.providerBubble,
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                Send a message to start the conversation.
              </Text>
            </View>
          }
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            editable
            accessibilityLabel="Message to provider"
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.disabledButton,
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || sending}
          >
            <Ionicons name="send" size={17} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomerBottomNav />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  providerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  onlineText: {
    marginTop: 2,
    fontSize: 11,
    color: colors.success,
  },

  messageList: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },

  emptyMessageList: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  emptyText: {
    marginTop: spacing.xs + 1,
    fontSize: 12,
    textAlign: "center",
    color: colors.textSecondary,
  },

  messageRow: {
    marginBottom: spacing.md,
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
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
  },

  customerBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },

  providerBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  customerMessageText: {
    color: colors.white,
  },

  providerMessageText: {
    color: colors.textPrimary,
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm + 2,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 48,
    fontSize: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },
});
