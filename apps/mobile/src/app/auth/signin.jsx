import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { useAuthStore } from "@/utils/auth/store";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();

  const focusedPadding = 12;
  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + focusedPadding),
  ).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputFocus = () => {
    if (Platform.OS === "web") return;
    animateTo(focusedPadding);
  };

  const handleInputBlur = () => {
    if (Platform.OS === "web") return;
    animateTo(insets.bottom + focusedPadding);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { authApi } = await import("@/api");
      const data = await authApi.signIn(email, password);

      if (data.success) {
        setAuth({
          jwt: data.jwt,
          user: data.user,
        });
        router.replace("/(tabs)");
      } else {
        Alert.alert("Sign In Failed", data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Sign In Failed", error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f8fafc" }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 20,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 48, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#64748b",
                textAlign: "center",
              }}
            >
              Sign in to ServiceHub
            </Text>
          </View>

          {/* Sign In Form */}
          <View style={{ marginBottom: 32 }}>
            {/* Email Input */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Mail size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="john@example.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: "#111827",
                  }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Lock size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: "#111827",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ marginLeft: 12 }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <View style={{ alignItems: "flex-end", marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => router.push("/auth/forgot-password")}
              >
                <Text style={{ fontSize: 14, color: "#3b82f6" }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#93c5fd" : "#3b82f6",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator size="small" color="white" />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#64748b" }}>
                Don't have an account?{" "}
                <Text
                  style={{ color: "#3b82f6", fontWeight: "500" }}
                  onPress={() => router.push("/auth/signup")}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Animated.View
        style={{
          paddingBottom: paddingAnimation,
        }}
      />
    </KeyboardAvoidingAnimatedView>
  );
}
