import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform, View } from "react-native";
import { colors } from "../theme/provider";

export default function NewRequestAlert({ count }: { count: number }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    pulse.setValue(0);
    if (!count || reduceMotion) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(pulse, { toValue: 0, duration: 650, useNativeDriver: Platform.OS !== "web" }),
    ]));
    animation.start();
    return () => { animation.stop(); pulse.setValue(0); };
  }, [count, reduceMotion, pulse]);
  if (!count) return null;
  return <View accessibilityLabel={count + " pending requests"} style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: colors.accentSoft }}><Animated.View style={{ opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }] }}><Ionicons name="notifications" size={20} color="#A56A13" /></Animated.View></View>;
}
