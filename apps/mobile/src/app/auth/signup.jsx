import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react-native";
import { useAuthStore } from "@/utils/auth/store";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/mobile/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuth({
          jwt: data.jwt,
          user: data.user,
        });

        // Navigate to onboarding after signup
        router.replace("/onboarding");
      } else {
        Alert.alert("Sign Up Failed", data.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "Network error. Please try again.");
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
              Join ServiceHub
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#64748b",
                textAlign: "center",
              }}
            >
              Connect with trusted local professionals
            </Text>
          </View>

          {/* Sign Up Form */}
          <View style={{ marginBottom: 32 }}>
            {/* Name Inputs Row */}
            <View style={{ flexDirection: "row", marginBottom: 20, gap: 12 }}>
              {/* First Name */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  First Name
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
                  <User size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    placeholder="John"
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
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

              {/* Last Name */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Last Name
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
                  <User size={20} color="#9ca3af" style={{ marginRight: 12 }} />
                  <TextInput
                    placeholder="Doe"
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
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
            </View>

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
            <View style={{ marginBottom: 24 }}>
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
                  placeholder="Create a secure password"
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
              <Text
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginTop: 4,
                }}
              >
                Must be at least 6 characters
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
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
                    Creating Account...
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
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#64748b" }}>
                Already have an account?{" "}
                <Text
                  style={{ color: "#3b82f6", fontWeight: "500" }}
                  onPress={() => router.push("/auth/signin")}
                >
                  Sign in
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
