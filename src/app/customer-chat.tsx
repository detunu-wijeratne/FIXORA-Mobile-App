import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import CustomerBottomNav from "../components/CustomerBottomNav";


import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  Alert,
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

import LoadingState from "../components/LoadingState";
import PrimaryButton from "../components/PrimaryButton";
import { auth, db } from "../services/firebase";
import { colors, radius, spacing, typography } from "../theme";

type ChatMessage = {
  id: string;
  text: string;
  sender: "customer" | "provider";
  senderId?: string;
  edited?: boolean;
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

  /*
    null = still checking; true = verified participant; false = blocked.
    Gates loading the message listener and sending messages, so access
    is never decided by the bookingId route param alone.
  */
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    let active = true;
    let unsubscribeMessages: (() => void) | undefined;

    const start = async () => {
      const user = auth.currentUser;

      if (!user) {
        router.replace("/customer-login");
        return;
      }

      if (!bookingId) {
        setChatError("Open chat from a booking to start messaging.");
        setAuthorized(false);
        return;
      }

      try {
        const bookingSnapshot = await getDoc(doc(db, "bookings", bookingId));

        if (!active) {
          return;
        }

        if (!bookingSnapshot.exists() || bookingSnapshot.data().customerId !== user.uid) {
          setAuthorized(false);
          return;
        }

        setAuthorized(true);

        const messagesQuery = query(
          collection(db, "chats", bookingId, "messages"),
          orderBy("createdAt", "asc")
        );

        unsubscribeMessages = onSnapshot(
          messagesQuery,
          (snapshot) => {
            if (!active) return;

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
            setChatError(
              error.code === "permission-denied"
                ? "You do not have permission to read this chat."
                : "Messages could not load. Please reopen this chat and try again."
            );
          }
        );
      } catch (error) {
        console.log("Booking access check error:", error);
        if (active) {
          setAuthorized(false);
        }
      }
    };

    start();

    return () => {
      active = false;
      unsubscribeMessages?.();
    };
  }, [bookingId]);

  const sendMessage = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in first.");
      return;
    }

    if (!bookingId || authorized !== true) {
      alert("You don't have access to this conversation.");
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

  const openMessageMenu = (item: ChatMessage) => {
    if (item.senderId !== auth.currentUser?.uid) {
      return;
    }

    Alert.alert("Message options", undefined, [
      { text: "Edit", onPress: () => startEditing(item) },
      { text: "Delete", style: "destructive", onPress: () => confirmDeleteMessage(item) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const startEditing = (item: ChatMessage) => {
    setEditingMessageId(item.id);
    setEditingText(item.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleSaveEdit = async () => {
    const user = auth.currentUser;

    if (!user || !editingMessageId || !bookingId) {
      return;
    }

    const trimmed = editingText.trim();

    if (!trimmed) {
      Alert.alert("Empty message", "Message cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);

      const messageRef = doc(db, "chats", bookingId, "messages", editingMessageId);

      /*
        Re-fetch immediately before writing so the ownership check can
        never be fooled by stale local state.
      */
      const latestSnapshot = await getDoc(messageRef);

      if (!latestSnapshot.exists()) {
        Alert.alert("Message Removed", "This message no longer exists.");
        handleCancelEdit();
        return;
      }

      if (latestSnapshot.data().senderId !== user.uid) {
        Alert.alert("Not Allowed", "You can only edit your own messages.");
        handleCancelEdit();
        return;
      }

      await updateDoc(messageRef, {
        text: trimmed,
        edited: true,
        updatedAt: serverTimestamp(),
      });

      handleCancelEdit();
    } catch (error: any) {
      console.log("Edit message error:", error);
      Alert.alert("Error", error.message || "Unable to update message.");
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDeleteMessage = (item: ChatMessage) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDeleteMessage(item) },
      ]
    );
  };

  const handleDeleteMessage = async (item: ChatMessage) => {
    const user = auth.currentUser;

    if (!user || !bookingId) {
      return;
    }

    try {
      const messageRef = doc(db, "chats", bookingId, "messages", item.id);
      const latestSnapshot = await getDoc(messageRef);

      if (!latestSnapshot.exists()) {
        return;
      }

      if (latestSnapshot.data().senderId !== user.uid) {
        Alert.alert("Not Allowed", "You can only delete your own messages.");
        return;
      }

      await deleteDoc(messageRef);

      if (editingMessageId === item.id) {
        handleCancelEdit();
      }
    } catch (error: any) {
      console.log("Delete message error:", error);
      Alert.alert("Error", error.message || "Unable to delete message.");
    }
  };

  if (authorized === null) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centerContainer} edges={["top", "bottom"]}>
          <LoadingState label="Checking access..." />
        </SafeAreaView>
      </>
    );
  }

  if (authorized === false) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centerContainer} edges={["top", "bottom"]}>
          <Ionicons name="lock-closed-outline" size={40} color={colors.textMuted} />
          <Text style={styles.blockedTitle}>You don't have access to this conversation.</Text>
          <PrimaryButton
            title="Go Back"
            onPress={() => router.back()}
            style={styles.blockedButton}
          />
        </SafeAreaView>
      </>
    );
  }

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

        {!!chatError && (
          <Text
            accessibilityRole="alert"
            style={{ color: colors.error, paddingHorizontal: 20, paddingVertical: 12 }}
          >
            {chatError}
          </Text>
        )}
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
            const isOwn = item.senderId === auth.currentUser?.uid;

            return (
              <View
                style={[
                  styles.messageRow,
                  isCustomer ? styles.customerMessageRow : styles.providerMessageRow,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!isOwn}
                  delayLongPress={300}
                  onLongPress={() => openMessageMenu(item)}
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

                  {item.edited && (
                    <Text
                      style={[
                        styles.editedTag,
                        isCustomer ? styles.editedTagOnCustomer : styles.editedTagOnProvider,
                      ]}
                    >
                      (edited)
                    </Text>
                  )}
                </TouchableOpacity>
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
          {editingMessageId && (
            <View style={styles.editingBanner}>
              <Ionicons name="create-outline" size={13} color={colors.primary} />
              <Text style={styles.editingBannerText}>Editing message</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
              placeholderTextColor={colors.textMuted}
              value={editingMessageId ? editingText : message}
              onChangeText={editingMessageId ? setEditingText : setMessage}
              multiline
              editable
              accessibilityLabel={editingMessageId ? "Edit message" : "Message to provider"}
              textAlignVertical="top"
            />

            {editingMessageId ? (
              <View style={styles.editActionsRow}>
                <TouchableOpacity
                  style={styles.cancelEditBtn}
                  onPress={handleCancelEdit}
                  disabled={savingEdit}
                >
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!editingText.trim() || savingEdit) && styles.disabledButton,
                  ]}
                  onPress={handleSaveEdit}
                  disabled={!editingText.trim() || savingEdit}
                >
                  <Ionicons name="checkmark" size={17} color={colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
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
            )}
          </View>
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

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },

  blockedTitle: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },

  blockedButton: {
    marginTop: spacing.xl,
    width: "100%",
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

  editedTag: {
    marginTop: 3,
    fontSize: 10,
    fontStyle: "italic",
  },

  editedTagOnCustomer: {
    color: "rgba(255,255,255,0.75)",
  },

  editedTagOnProvider: {
    color: colors.textMuted,
  },

  inputArea: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  editingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
  },

  editingBannerText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm + 2,
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

  editActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  cancelEditBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
  },

  cancelEditText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
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
