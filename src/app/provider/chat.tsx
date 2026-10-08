// src/app/provider/chat.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme";

type ChatMessage = {
  id: string;
  text: string;
  sender: "customer" | "provider";
  senderId?: string;
};

export default function ProviderChatScreen() {
  const params = useLocalSearchParams();

  const bookingId =
    typeof params.bookingId === "string" ? params.bookingId : "";

  const customer =
    typeof params.customer === "string" ? params.customer : "Customer";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (!bookingId) return;

    const messagesQuery = query(
      collection(db, "chats", bookingId, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loadedMessages: ChatMessage[] = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...(messageDoc.data() as any),
        })) as ChatMessage[];

        setMessages(loadedMessages);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.log("Provider chat listener error:", error);
      },
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

    if (!message.trim()) return;

    try {
      setSending(true);

      await addDoc(collection(db, "chats", bookingId, "messages"), {
        text: message.trim(),
        sender: "provider",
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      setMessage("");
    } catch (error: any) {
      console.log("Send provider message error:", error);
      alert(error.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const initials = useMemo(() => {
    return customer
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [customer]);

  const bottomPad = Math.max(insets.bottom, spacing.sm);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 2 : 0}
      >
        {/* Subtle background decoration (UI only) */}
        <View pointerEvents="none" style={styles.bgDecor}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />
        </View>

        {/* Header (keeps existing info: customer + "Booking Chat") */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.customerName} numberOfLines={1}>
                {customer}
              </Text>

              <View style={styles.subRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.success} />
                <Text style={styles.subText}>Booking chat</Text>
              </View>
            </View>
          </View>

          {/* Visual-only badge (does not add new functionality) */}
          <View style={styles.headerBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
            <Text style={styles.headerBadgeText}>Fixora</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 14 + 64 + bottomPad },
            messages.length === 0 && styles.listEmptyGrow,
          ]}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => {
            const isProvider = item.sender === "provider";

            return (
              <View
                style={[
                  styles.messageRow,
                  isProvider ? styles.rowRight : styles.rowLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isProvider ? styles.bubbleProvider : styles.bubbleCustomer,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isProvider ? styles.textProvider : styles.textCustomer,
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="chatbubbles-outline" size={22} color={colors.textSecondary} />
              </View>

              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                Send a message to start the conversation with the customer.
              </Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: bottomPad }]}>
          <View style={styles.inputWrap}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!message.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={!message.trim() || sending}
            activeOpacity={0.9}
          >
            {sending ? (
              <Text style={styles.sendText}>...</Text>
            ) : (
              <>
                <Ionicons name="send" size={16} color={colors.white} />
                <Text style={styles.sendText}>Send</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  /* subtle background */
  bgDecor: {
    ...(StyleSheet.absoluteFill as any),
    overflow: "hidden",
  },
  blobA: {
    position: "absolute",
    top: -120,
    right: -160,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: colors.primarySoft,
    opacity: 0.55,
  },
  blobB: {
    position: "absolute",
    bottom: -140,
    left: -170,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "#ECFEFF",
    opacity: 0.35,
  },

  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  customerName: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  subRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  subText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.success,
  },

  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },

  headerBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
  },

  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },

  listEmptyGrow: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 26,
    paddingVertical: 18,
  },

  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  emptyText: {
    marginTop: spacing.xs,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: colors.textSecondary,
  },

  messageRow: {
    marginBottom: spacing.md,
    flexDirection: "row",
  },

  rowRight: {
    justifyContent: "flex-end",
  },

  rowLeft: {
    justifyContent: "flex-start",
  },

  bubble: {
    maxWidth: "78%",
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },

  bubbleProvider: {
    backgroundColor: colors.primary,
    borderColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 8,
  },

  bubbleCustomer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomLeftRadius: 8,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  textProvider: {
    color: colors.white,
    fontWeight: "600",
  },

  textCustomer: {
    color: colors.textPrimary,
    fontWeight: "500",
  },

  inputBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flex: 1,
  },

  input: {
    flex: 1,
    maxHeight: 120,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 0,
  },

  sendBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 46,
  },

  sendBtnDisabled: {
    opacity: 0.55,
  },

  sendText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: "900",
  },
});