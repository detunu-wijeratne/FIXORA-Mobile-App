import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../services/firebase";

type Notice = { id: string; bookingId: string; messageId: string; text: string; sender: string; service: string; time: number; booking: Record<string, any> };

export default function MessageNotifications({ role }: { role: "customer" | "provider" }) {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [read, setRead] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let stopBookings: (() => void) | undefined;
    const chats = new Map<string, () => void>();
    const notices = new Map<string, Notice[]>();
    let generation = 0;
    const stopAuth = onAuthStateChanged(auth, (user) => {
      const current = ++generation;
      stopBookings?.();
      chats.forEach((stop) => stop());
      chats.clear();
      notices.clear();
      setItems([]);
      setRead([]);
      setError("");
      setUserId(user?.uid || "");
      setLoading(!!user);
      if (!user) return;
      AsyncStorage.getItem(`message-notifications:${role}:${user.uid}`).then((value) => {
        if (current === generation && value) setRead(JSON.parse(value));
      }).catch(() => { /* Keep notifications unread if local storage is unavailable. */ });
      const publish = () => setItems([...notices.values()].flat().sort((a, b) => b.time - a.time));
      stopBookings = onSnapshot(query(collection(db, "bookings"), where(`${role}Id`, "==", user.uid)), (snapshot) => {
        const ids = new Set(snapshot.docs.map((booking) => booking.id));
        chats.forEach((stop, id) => {
          if (!ids.has(id)) { stop(); chats.delete(id); notices.delete(id); }
        });
        snapshot.docs.forEach((bookingDoc) => {
          if (chats.has(bookingDoc.id)) return;
          const booking = bookingDoc.data();
          chats.set(bookingDoc.id, onSnapshot(collection(db, "chats", bookingDoc.id, "messages"), (messages) => {
            notices.set(bookingDoc.id, messages.docs.filter((message) => message.data().sender === (role === "customer" ? "provider" : "customer")).map((message) => ({
              id: `${bookingDoc.id}:${message.id}`, bookingId: bookingDoc.id, messageId: message.id,
              text: String(message.data().text || ""), sender: role === "customer" ? booking.providerName || "Provider" : booking.customerName || "Customer",
              service: booking.service || "Home Service", time: message.data().createdAt?.toMillis?.() || 0, booking,
            })));
            publish();
            setLoading(false);
          }, () => { setError("Messages could not load. Please reopen the dashboard to try again."); setLoading(false); }));
        });
        publish();
        if (!snapshot.size) setLoading(false);
      }, () => { setError("Notifications could not load. Please reopen the dashboard to try again."); setLoading(false); });
    });
    return () => { generation++; stopAuth(); stopBookings?.(); chats.forEach((stop) => stop()); };
  }, [role]);

  const open = (item: Notice) => {
    const next = [...new Set([...read, item.id])];
    setRead(next);
    AsyncStorage.setItem(`message-notifications:${role}:${userId}`, JSON.stringify(next)).catch(() => {});
    setVisible(false);
    const b = item.booking;
    router.push({ pathname: role === "customer" ? "/booking-details" : "/provider/job-details", params: {
      bookingId: item.bookingId, messageId: item.messageId, messageText: item.text, messageSender: item.sender,
      customer: b.customerName || "Customer", phone: b.customerPhone || "", email: b.customerEmail || "",
      service: b.service || "Home Service", date: b.date || "", time: b.time || "", location: b.address || "",
      description: b.description || "", price: String(b.servicePrice || 0), totalAmount: String(b.totalAmount || 0), status: b.status || "confirmed",
    } });
  };
  const unread = items.filter((item) => !read.includes(item.id)).length;
  return <>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Message notifications, ${unread} unread`} onPress={() => setVisible(true)} style={styles.bell}>
      <Ionicons name="notifications-outline" size={20} color="white" />
      {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text></View>}
    </TouchableOpacity>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}><View style={styles.panel}>
        <View style={styles.heading}><Text style={styles.title}>Messages</Text><TouchableOpacity accessibilityLabel="Close notifications" onPress={() => setVisible(false)}><Ionicons name="close" size={26} /></TouchableOpacity></View>
        <ScrollView><Text accessibilityLiveRegion="polite">{error || (loading ? "Loading messages…" : items.length === 0 ? "No message notifications yet." : "")}</Text>
          {items.map((item) => <TouchableOpacity key={item.id} onPress={() => open(item)} style={[styles.item, !read.includes(item.id) && styles.unread]}>
            <Text style={styles.sender}>{item.sender} · {item.service}{!read.includes(item.id) ? " · New" : ""}</Text><Text numberOfLines={2}>{item.text}</Text><Text style={styles.hint}>View job and message →</Text>
          </TouchableOpacity>)}
        </ScrollView>
      </View></View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  bell: { padding: 10 }, badge: { position: "absolute", right: 0, top: 0, backgroundColor: "#dc2626", borderRadius: 10, minWidth: 18, paddingHorizontal: 3, alignItems: "center" }, badgeText: { color: "white", fontSize: 10, fontWeight: "700" },
  overlay: { flex: 1, justifyContent: "center", backgroundColor: "#0008", padding: 24 }, panel: { backgroundColor: "white", borderRadius: 20, padding: 20, maxHeight: "80%", width: "100%", maxWidth: 560, alignSelf: "center" }, heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, title: { fontSize: 22, fontWeight: "700" }, item: { padding: 14, borderRadius: 10, marginVertical: 5, backgroundColor: "#f5f5f5" }, unread: { backgroundColor: "#e8f2ff" }, sender: { fontWeight: "700", marginBottom: 5 }, hint: { color: "#2563eb", marginTop: 8, fontSize: 12 },
});
