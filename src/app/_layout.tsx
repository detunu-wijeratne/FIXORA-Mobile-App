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
    </Stack>
  );
}