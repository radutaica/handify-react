import { Stack } from "expo-router";

export default function BecomeTaskerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="details" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
