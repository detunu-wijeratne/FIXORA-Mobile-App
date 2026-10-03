import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#0F172A",
        contentStyle: {
          backgroundColor: "#F8FAFC",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="role-selection"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="customer-login"
        options={{
          title: "Login",
        }}
      />

      <Stack.Screen
        name="customer-home"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="services"
        options={{
          title: "All Services",
        }}
      />

      <Stack.Screen
        name="providers"
        options={{
          title: "Providers",
        }}
      />

      <Stack.Screen
        name="provider-profile"
        options={{
          title: "Provider Profile",
        }}
      />

      <Stack.Screen
        name="select-date-time"
        options={{
          title: "Select Date & Time",
      }}
      />

      <Stack.Screen
        name="job-details"
        options={{
          title: "Job Details",
      }}
      />

      <Stack.Screen
        name="service-location"
        options={{
        title: "Service Location",
      }}
      />

      <Stack.Screen
        name="booking-summary"
        options={{
        title: "Booking Summary",
      }}
      />

      <Stack.Screen
        name="booking-confirmation"
        options={{
        title: "Booking Confirmation",
      }}
      />

      <Stack.Screen
        name="my-bookings"
        options={{
        title: "My Bookings",
      }}
      />

            <Stack.Screen
        name="booking-details"
        options={{
          title: "Booking Details",
        }}
      />

      <Stack.Screen
        name="customer-chat"
        options={{
          title: "Chat",
        }}
      />

      <Stack.Screen
        name="rate-review"
        options={{
          title: "Rate & Review",
        }}
      />

      <Stack.Screen
        name="customer-profile"
        options={{
          title: "Profile",
        }}
      />
    </Stack>
  );
}