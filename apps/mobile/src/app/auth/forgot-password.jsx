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
import { Mail, ArrowLeft, CheckCircle } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/mobile/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        Alert.alert("Error", data.error || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
      >
        <StatusBar style="dark" />

        {/* Success State */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#dcfce7",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <CheckCircle size={40} color="#16a34a" />
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Check Your Email
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              textAlign: "center",
              lineHeight: 24,
              paddingHorizontal: 20,
            }}
          >
            If an account with {email} exists, we sent you a password reset
            link.
          </Text>
        </View>

        {/* Back to Sign In Button */}
        <TouchableOpacity
          onPress={() => router.push("/auth/signin")}
          style={{
            backgroundColor: "#3b82f6",
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Back to Sign In
          </Text>
        </TouchableOpacity>

        {/* Resend Link */}
        <TouchableOpacity
          onPress={() => setSuccess(false)}
          style={{
            alignItems: "center",
            paddingVertical: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: "#3b82f6" }}>
            Try a different email
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              marginBottom: 32,
              paddingVertical: 8,
            }}
          >
            <ArrowLeft size={20} color="#64748b" />
            <Text
              style={{
                fontSize: 16,
                color: "#64748b",
                marginLeft: 8,
              }}
            >
              Back
            </Text>
          </TouchableOpacity>

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
              Forgot Password?
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#64748b",
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 20,
              }}
            >
              Enter your email address and we'll send you a link to reset your
              password
            </Text>
          </View>

          {/* Reset Form */}
          <View style={{ marginBottom: 32 }}>
            {/* Email Input */}
            <View style={{ marginBottom: 24 }}>
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

            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
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
                    Sending...
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
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#64748b" }}>
                Remember your password?{" "}
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
