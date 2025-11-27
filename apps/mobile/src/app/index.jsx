import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { View, Text } from "react-native";

export default function Index() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 18, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
