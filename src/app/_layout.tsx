import { Stack, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { cloneElement, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, db } from "../services/firebase";

type UserRole = "customer" | "provider" | null;
const screens = {
  "index": (<Stack.Screen
          name="index"
          options={{
            headerShown:
              false,
          }}
        />),
  "role-selection": (<Stack.Screen
          name="role-selection"
          options={{
            headerShown:
              false,
          }}
        />),
  "customer-login": (<Stack.Screen
          name="customer-login"
          options={{
            title: "Login",
          }}
        />),
  "customer-home": (<Stack.Screen
          name="customer-home"
          options={{
            headerShown:
              false,
          }}
        />),
  "services": (<Stack.Screen
          name="services"
          options={{
            title:
              "All Services",
          }}
        />),
  "providers": (<Stack.Screen
          name="providers"
          options={{
            title:
              "Providers",
          }}
        />),
  "provider-profile": (<Stack.Screen
          name="provider-profile"
          options={{
            title:
              "Provider Profile",
          }}
        />),
  "select-date-time": (<Stack.Screen
          name="select-date-time"
          options={{
            title:
              "Select Date & Time",
          }}
        />),
  "job-details": (<Stack.Screen
          name="job-details"
          options={{
            title:
              "Job Details",
          }}
        />),
  "service-location": (<Stack.Screen
          name="service-location"
          options={{
            title:
              "Service Location",
          }}
        />),
  "booking-summary": (<Stack.Screen
          name="booking-summary"
          options={{
            title:
              "Booking Summary",
          }}
        />),
  "booking-confirmation": (<Stack.Screen
          name="booking-confirmation"
          options={{
            title:
              "Booking Confirmation",
          }}
        />),
  "my-bookings": (<Stack.Screen
          name="my-bookings"
          options={{
            title:
              "My Bookings",
          }}
        />),
  "booking-details": (<Stack.Screen
          name="booking-details"
          options={{
            title:
              "Booking Details",
          }}
        />),
  "customer-chat": (<Stack.Screen
          name="customer-chat"
          options={{
            title: "Chat",
          }}
        />),
  "rate-review": (<Stack.Screen
          name="rate-review"
          options={{
            title:
              "Rate & Review",
          }}
        />),
  "customer-profile": (<Stack.Screen
          name="customer-profile"
          options={{
            title:
              "Profile",
          }}
        />),
  "provider/login": (<Stack.Screen
          name="provider/login"
          options={{
            title:
              "Provider Login",
          }}
        />),
  "provider/dashboard": (<Stack.Screen
          name="provider/dashboard"
          options={{
            headerShown:
              false,
          }}
        />),
  "provider/requests": (<Stack.Screen
          name="provider/requests"
          options={{
            title:
              "Incoming Requests",
          }}
        />),
  "provider/request-details": (<Stack.Screen
          name="provider/request-details"
          options={{
            title:
              "Request Details",
          }}
        />),
  "provider/jobs": (<Stack.Screen
          name="provider/jobs"
          options={{
            title:
              "My Jobs",
          }}
        />),
  "provider/schedule": (<Stack.Screen
          name="provider/schedule"
          options={{
            title:
              "Schedule",
          }}
        />),
  "provider/earnings": (<Stack.Screen
          name="provider/earnings"
          options={{
            title:
              "Earnings",
          }}
        />),
  "provider/profile": (<Stack.Screen
          name="provider/profile"
          options={{
            title:
              "Provider Profile",
          }}
        />),
  "provider/job-details": (<Stack.Screen
          name="provider/job-details"
          options={{
            title:
              "Job Details",
          }}
        />),
  "provider/chat": (<Stack.Screen
          name="provider/chat"
          options={{
            title:
              "Chat with Customer",
          }}
        />),
  "provider/availability": (<Stack.Screen
          name="provider/availability"
          options={{
            title:
              "Manage Availability",
          }}
        />),
  "provider/settings": (<Stack.Screen
          name="provider/settings"
          options={{
            title:
              "Settings",
          }}
        />),
  "provider/create-account": (<Stack.Screen
          name="provider/create-account"
          options={{
            title:
              "Create Provider Account",
          }}
        />),
  "provider/verification": (<Stack.Screen
          name="provider/verification"
          options={{
            title:
              "Provider Verification",
          }}
        />),
  "customer-signup": (<Stack.Screen
          name="customer-signup"
          options={{
            title:
              "Create Account",
          }}
        />),
  "provider/edit-profile": (<Stack.Screen
          name="provider/edit-profile"
          options={{
            title:
              "Edit Provider Profile",
          }}
        />),
  "customer-edit-profile": (<Stack.Screen
          name="customer-edit-profile"
          options={{
            title:
              "Edit Profile",
          }}
        />),
  "saved-locations": (<Stack.Screen
          name="saved-locations"
          options={{
            title:
              "Saved Locations",
          }}
        />),
  "provider/services-pricing": (<Stack.Screen
          name="provider/services-pricing"
          options={{
            title:
              "Services & Pricing",
          }}
        />),
  "provider/create-manual-job": (<Stack.Screen
          name="provider/create-manual-job"
          options={{
            headerShown:
              false,
          }}
        />),
  "edit-booking": (<Stack.Screen name="edit-booking" options={{ title: "Edit Booking" }} />),
  "provider/my-reviews": (<Stack.Screen name="provider/my-reviews" options={{ title: "My Reviews" }} />),
  "provider/service-form": (<Stack.Screen name="provider/service-form" options={{ title: "Service" }} />),
};

export default function RootLayout() {
  const segments = useSegments();
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const roleRef = useRef<UserRole>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [ready, setReady] = useState(false);
  const [loginRoute, setLoginRoute] = useState<string>("index");
  const [providerSignup, setProviderSignup] = useState(false);

  useEffect(() => {
    let active = true;
    let revision = 0;
    let unsubscribeProfile: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      const currentRevision = ++revision;
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
      if (!user) {
        if (roleRef.current) {
          setLoginRoute(roleRef.current === "provider" ? "provider/login" : "customer-login");
        }
        roleRef.current = null;
        setRole(null);
        setProviderSignup(false);
        setReady(true);
        return;
      }
      roleRef.current = null;
      setRole(null);
      setProviderSignup(segmentsRef.current.join("/") === "provider/create-account");
      // Signup emits an auth event before its profile is written.
      // Observe the profile so registration can enable the protected routes.
      unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (!active || currentRevision !== revision || auth.currentUser?.uid !== user.uid) return;
        const value = snapshot.data()?.role;
        const nextRole = value === "customer" || value === "provider" ? value : null;
        roleRef.current = nextRole;
        setRole(nextRole);
        setReady(true);
      }, (error) => {
        if (!active || currentRevision !== revision) return;
        console.log("Auth profile load error:", error);
        roleRef.current = null;
        setRole(null);
        setReady(true);
      });
    });
    return () => {
      active = false;
      revision++;
      unsubscribeAuth();
      unsubscribeProfile?.();
    };
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" /></View>;
  }
  const publicRoutes = ["index","role-selection","customer-login","customer-signup","provider/login","provider/create-account"] as const;
  const customerRoutes = ["customer-home","services","providers","provider-profile","select-date-time","job-details","service-location","booking-summary","booking-confirmation","my-bookings","booking-details","customer-chat","rate-review","customer-profile","customer-edit-profile","saved-locations","edit-booking"] as const;
  const providerRoutes = ["provider/dashboard","provider/requests","provider/request-details","provider/jobs","provider/schedule","provider/earnings","provider/profile","provider/job-details","provider/chat","provider/availability","provider/settings","provider/verification","provider/edit-profile","provider/services-pricing","provider/create-manual-job","provider/my-reviews","provider/service-form"] as const;
  const orderedPublic = [...publicRoutes].sort((a, b) => Number(b === loginRoute) - Number(a === loginRoute));
  const providerLanding = providerSignup ? "provider/verification" : "provider/dashboard";
  const orderedProvider = [...providerRoutes].sort((a, b) => Number(b === providerLanding) - Number(a === providerLanding));

  return (
    <Stack screenOptions={{
      headerShown: true,
      headerTitleAlign: "center",
      headerShadowVisible: false,
      headerStyle: { backgroundColor: "#FFFFFF" },
      headerTintColor: "#0F172A",
      contentStyle: { backgroundColor: "#F8FAFC" },
    }}>
      <Stack.Protected guard={role === null}>
        {orderedPublic.map((name) => cloneElement(screens[name], { key: name }))}
      </Stack.Protected>
      <Stack.Protected guard={role === "customer"}>
        {customerRoutes.map((name) => cloneElement(screens[name], { key: name }))}
      </Stack.Protected>
      <Stack.Protected guard={role === "provider"}>
        {orderedProvider.map((name) => cloneElement(screens[name], { key: name }))}
      </Stack.Protected>
    </Stack>
  );
}
