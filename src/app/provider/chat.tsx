// src/app/provider/chat.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

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
  ActivityIndicator,
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { auth, db } from "../../services/firebase";
import { colors, radius, spacing, typography } from "../../theme/provider";

type ChatMessage = {
  id: string;
  text: string;
  sender: "customer" | "provider";
  senderId?: string;
  edited?: boolean;
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

  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/provider/jobs"));

  useEffect(() => {
    let active = true;
    let unsubscribeMessages: (() => void) | undefined;

    const start = async () => {
      const user = auth.currentUser;

      if (!user) {
        router.replace("/provider/login");
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

        if (!bookingSnapshot.exists() || bookingSnapshot.data().providerId !== user.uid) {
          setAuthorized(false);
          return;
        }

        setAuthorized(true);

        const messagesQuery = query(
          collection(db, "chats", bookingId, "messages"),
          orderBy("createdAt", "asc"),
        );

        unsubscribeMessages = onSnapshot(
          messagesQuery,
          (snapshot) => {
            if (!active) return;

            setChatError("");
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
            setChatError(
              error.code === "permission-denied"
                ? "You do not have permission to read this chat."
                : "Messages could not load. Please reopen this chat and try again."
            );
          },
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

    if (!message.trim()) return;

    if (sendingRef.current) return;
    try {
      sendingRef.current = true;
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

  if (authorized === null) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Checking access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (authorized === false) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={40} color={colors.textMuted} />
          <Text style={styles.centerTitle}>You don't have access to this conversation.</Text>
          <TouchableOpacity style={styles.backToJobsBtn} onPress={goBack} activeOpacity={0.9}>
            <Text style={styles.backToJobsText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Subtle background decoration (UI only) */}
        <View pointerEvents="none" style={styles.bgDecor}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />
        </View>

        {/* Header (keeps existing info: customer + "Booking Chat") */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} style={{ padding: 6, marginRight: 8 }}><Ionicons name="chevron-back" size={22} color={colors.primary} /></TouchableOpacity>
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

        {!!chatError && <Text accessibilityRole="alert" style={{ color: colors.error, paddingHorizontal: 20, paddingVertical: 12 }}>{chatError}</Text>}
        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 16 },
            messages.length === 0 && styles.listEmptyGrow,
          ]}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => {
            const isProvider = item.sender === "provider";
            const isOwn = item.senderId === auth.currentUser?.uid;

            return (
              <View
                style={[
                  styles.messageRow,
                  isProvider ? styles.rowRight : styles.rowLeft,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!isOwn}
                  delayLongPress={300}
                  onLongPress={() => openMessageMenu(item)}
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

                  {item.edited && (
                    <Text
                      style={[
                        styles.editedTag,
                        isProvider ? styles.editedTagOnProvider : styles.editedTagOnCustomer,
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
        <View style={styles.inputBarOuter}>
          {editingMessageId && (
            <View style={styles.editingBanner}>
              <Ionicons name="create-outline" size={13} color={colors.primary} />
              <Text style={styles.editingBannerText}>Editing message</Text>
            </View>
          )}

          <View style={[styles.inputBar, { paddingBottom: bottomPad }]}>
            <View style={styles.inputWrap}>
              <Ionicons name="chatbox-ellipses-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
                placeholderTextColor={colors.textMuted}
                value={editingMessageId ? editingText : message}
                onChangeText={editingMessageId ? setEditingText : setMessage}
                multiline
                editable
                accessibilityLabel={editingMessageId ? "Edit message" : "Message to customer"}
                textAlignVertical="top"
              />
            </View>

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
                    styles.sendBtn,
                    (!editingText.trim() || savingEdit) && styles.sendBtnDisabled,
                  ]}
                  onPress={handleSaveEdit}
                  disabled={!editingText.trim() || savingEdit}
                  activeOpacity={0.9}
                >
                  {savingEdit ? (
                    <Text style={styles.sendText}>...</Text>
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                      <Text style={styles.sendText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
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
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },

  centerText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  centerTitle: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },

  backToJobsBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },

  backToJobsText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
  },

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

  editedTag: {
    marginTop: 3,
    fontSize: 10,
    fontStyle: "italic",
  },

  editedTagOnProvider: {
    color: "rgba(255,255,255,0.75)",
  },

  editedTagOnCustomer: {
    color: colors.textMuted,
  },

  inputBarOuter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
  },

  editingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: spacing.xs,
  },

  editingBannerText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },

  inputBar: {
flexDirection: "row",
alignItems: "flex-end",
gap: 10,
flexShrink: 0,
paddingHorizontal: 16
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
minHeight: 48,
flexShrink: 1
},

  input: {
flex: 1,
maxHeight: 120,
color: colors.textPrimary,
minHeight: 32,
fontSize: 16,
paddingVertical: 5,
paddingHorizontal: 4
},

  editActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  cancelEditBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    minHeight: 48,
    justifyContent: "center",
  },

  cancelEditText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  sendBtn: {
backgroundColor: colors.primary,
borderRadius: radius.xl,
paddingVertical: 12,
flexDirection: "row",
alignItems: "center",
gap: 8,
marginTop: 0,
minHeight: 48,
justifyContent: "center",
paddingHorizontal: 14
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
