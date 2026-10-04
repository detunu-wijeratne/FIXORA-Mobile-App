import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

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

import { auth, db } from "../services/firebase";

type ChatMessage = {
  id: string;
  text: string;
  sender: "customer" | "provider";
  senderId?: string;
};

export default function CustomerChatScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string"
      ? params.bookingId
      : "";

  const provider =
    typeof params.provider === "string"
      ? params.provider
      : "Service Provider";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const messagesQuery = query(
      collection(
        db,
        "chats",
        bookingId,
        "messages"
      ),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loadedMessages: ChatMessage[] =
          snapshot.docs.map((messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          })) as ChatMessage[];

        setMessages(loadedMessages);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({
            animated: true,
          });
        }, 100);
      },
      (error) => {
        console.log(
          "Customer chat listener error:",
          error
        );
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

    try {
      setSending(true);

      await addDoc(
        collection(
          db,
          "chats",
          bookingId,
          "messages"
        ),
        {
          text: message.trim(),
          sender: "customer",
          senderId: user.uid,
          createdAt: serverTimestamp(),
        }
      );

      setMessage("");
    } catch (error: any) {
      console.log(
        "Send customer message error:",
        error
      );

      alert(
        error.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.providerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            👨‍🔧
          </Text>
        </View>

        <View>
          <Text style={styles.providerName}>
            {provider}
          </Text>

          <Text style={styles.onlineText}>
            Booking Chat
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messageList,
          messages.length === 0 &&
            styles.emptyMessageList,
        ]}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({
            animated: true,
          })
        }
        renderItem={({ item }) => {
          const isCustomer =
            item.sender === "customer";

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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              💬
            </Text>

            <Text style={styles.emptyTitle}>
              No messages yet
            </Text>

            <Text style={styles.emptyText}>
              Send a message to start the
              conversation.
            </Text>
          </View>
        }
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
          style={[
            styles.sendButton,
            (!message.trim() || sending) &&
              styles.disabledButton,
          ]}
          onPress={sendMessage}
          disabled={
            !message.trim() || sending
          }
        >
          <Text style={styles.sendText}>
            {sending ? "..." : "Send"}
          </Text>
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

  emptyMessageList: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 36,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
    color: "#64748B",
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

  disabledButton: {
    opacity: 0.5,
  },
});